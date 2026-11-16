-- Onboarding "help tour" — track whether an account has already seen the
-- first-time onboarding tour (one column works for both student and teacher
-- roles since each profile only ever has a single role/tour).
ALTER TABLE public.greenleaf_profiles
  ADD COLUMN IF NOT EXISTS onboarding_tour_seen_at TIMESTAMPTZ;
