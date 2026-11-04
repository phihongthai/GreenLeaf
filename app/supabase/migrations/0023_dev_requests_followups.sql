-- Admin dev chat: Claude may ask a clarifying question (status 'needs_answer'); the admin's answer
-- is stored as a follow-up request whose parent_id points at the question.
ALTER TABLE public.greenleaf_dev_requests
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.greenleaf_dev_requests(id) ON DELETE SET NULL;

ALTER TABLE public.greenleaf_dev_requests DROP CONSTRAINT IF EXISTS greenleaf_dev_requests_status_check;
ALTER TABLE public.greenleaf_dev_requests
  ADD CONSTRAINT greenleaf_dev_requests_status_check
  CHECK (status IN ('queued', 'running', 'needs_answer', 'needs_review', 'merged', 'failed', 'no_changes'));
