-- Admin "dev chat": an admin types a change request, a GitHub Actions workflow runs Claude on the
-- repo, opens a PR and (if checks pass and no protected paths changed) merges it → Vercel deploys.
-- Rows are written only by the service role (API routes + the workflow callback); admins can read.

CREATE TABLE IF NOT EXISTS public.greenleaf_dev_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID NOT NULL REFERENCES public.greenleaf_profiles(id) ON DELETE CASCADE,
  prompt      TEXT NOT NULL CHECK (char_length(prompt) BETWEEN 1 AND 4000),
  status      TEXT NOT NULL DEFAULT 'queued'
              CHECK (status IN ('queued', 'running', 'needs_review', 'merged', 'failed', 'no_changes')),
  summary     TEXT,
  run_url     TEXT,
  pr_url      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS greenleaf_dev_requests_created_idx
  ON public.greenleaf_dev_requests (created_at DESC);

ALTER TABLE public.greenleaf_dev_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS greenleaf_dev_requests_admin_select ON public.greenleaf_dev_requests;
CREATE POLICY greenleaf_dev_requests_admin_select ON public.greenleaf_dev_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.greenleaf_profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
