/*
  # Auto-create user profile on sign-up

  1. Problem
    - When email confirmation is enabled, signUp() returns a user but no session
    - The client-side INSERT into user_profiles fails because RLS requires auth.uid()
    - Users end up with no profile row, so they can never access the dashboard

  2. Solution
    - Add a database trigger on auth.users that auto-creates a user_profiles row
    - The trigger runs with SECURITY DEFINER, so it bypasses RLS
    - It reads role and display_name from the user's raw_user_meta_data
    - The client-side signUp will pass role/displayName/company via metadata

  3. Changes
    - New function: handle_new_user() (trigger function)
    - New trigger: on_auth_user_created on auth.users AFTER INSERT
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, role, display_name, company)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
