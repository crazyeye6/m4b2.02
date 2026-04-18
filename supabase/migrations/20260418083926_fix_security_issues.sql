/*
  # Fix Security Issues

  1. Fix mutable search_path on trigger functions
     - `update_listings_search_vector`: add SET search_path = '' to prevent search_path injection
     - `update_tag_usage_count`: add SET search_path = '' to prevent search_path injection

  2. Move pg_trgm extension from public schema to extensions schema
     - Drop dependent indexes, drop extension, recreate in extensions schema, recreate indexes

  3. Tighten RLS INSERT policies
     - `slot_bookings`: replace always-true WITH CHECK with authenticated user check
     - `tags`: replace always-true WITH CHECK with authenticated user check
*/

-- Fix function search paths
CREATE OR REPLACE FUNCTION public.update_listings_search_vector()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.property_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.audience, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.location, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.slot_type, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.media_owner_name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.media_company_name, '')), 'B');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_tag_usage_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tags SET usage_count = GREATEST(0, usage_count - 1) WHERE id = OLD.tag_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Move pg_trgm to extensions schema
-- Drop dependent indexes first, then drop+recreate extension, then recreate indexes
DROP INDEX IF EXISTS public.tags_name_trgm_idx;
DROP INDEX IF EXISTS public.tags_display_name_trgm_idx;

DROP EXTENSION IF EXISTS pg_trgm;

CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;

CREATE INDEX IF NOT EXISTS tags_name_trgm_idx ON public.tags USING gin (name extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS tags_display_name_trgm_idx ON public.tags USING gin (display_name extensions.gin_trgm_ops);

-- Fix slot_bookings INSERT policy
DROP POLICY IF EXISTS "Authenticated insert slot bookings" ON public.slot_bookings;

CREATE POLICY "Authenticated users can insert their own bookings"
  ON public.slot_bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Fix tags INSERT policy
DROP POLICY IF EXISTS "Authenticated insert tags" ON public.tags;

CREATE POLICY "Authenticated users can insert tags"
  ON public.tags
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
