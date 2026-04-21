/*
  # Grant SELECT on auth.users(id) for FK resolution

  1. Problem
    - Multiple public tables (user_profiles, listings, csv_upload_batches, media_profiles)
      have foreign keys referencing auth.users(id)
    - PostgREST needs SELECT access on auth.users to resolve these FK relationships
    - Without this grant, all queries on these tables fail with
      "permission denied for table users" (error 42501)
    - This blocks logged-in users from viewing dashboards, listings, and profiles

  2. Fix
    - Grant SELECT on the `id` column only of auth.users to both anon and authenticated roles
    - This is the minimal permission needed for PostgREST FK resolution
    - No other columns (email, encrypted_password, etc.) are exposed

  3. Affected tables
    - user_profiles (id -> auth.users.id)
    - listings (seller_user_id -> auth.users.id)
    - csv_upload_batches (seller_user_id -> auth.users.id)
    - media_profiles (seller_user_id -> auth.users.id)
*/

GRANT SELECT (id) ON auth.users TO anon;
GRANT SELECT (id) ON auth.users TO authenticated;
