-- Mystery Box reward system: students spend 100 Leaves on a Mystery Box, request it in the app,
-- and an admin confirms at the center (which deducts the Leaves).
--
-- ⚠️ RUN ORDER: deploy the app code FIRST, then run this migration. The new code writes Leaves
-- with the service role; this migration drops the student write policies on greenleaf_rewards, so
-- running it before the deploy would silently block Leaf earning (same failure mode as 0007).
--
-- Creating the first admin (no UI for this on purpose — nobody can self-elevate):
--   UPDATE public.greenleaf_profiles SET role = 'admin' WHERE username = '<username>';
--   -- or WHERE id = '<auth user uuid>' for an email account.

-- ─────────────────────────────────────────────────────────────
-- 1. 'admin' role
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.greenleaf_profiles DROP CONSTRAINT IF EXISTS greenleaf_profiles_role_check;
ALTER TABLE public.greenleaf_profiles
  ADD CONSTRAINT greenleaf_profiles_role_check CHECK (role IN ('student', 'teacher', 'parent', 'admin'));

-- Self-signup passes `role` in raw_user_meta_data (client-controlled) — never let that create an admin.
CREATE OR REPLACE FUNCTION public.greenleaf_handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_grade_id UUID;
  v_role TEXT;
BEGIN
  SELECT id INTO v_grade_id FROM public.greenleaf_grades WHERE code = NEW.raw_user_meta_data->>'grade_code';

  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  IF v_role NOT IN ('student', 'teacher', 'parent') THEN
    v_role := 'student';
  END IF;

  INSERT INTO public.greenleaf_profiles (id, role, name, grade_id, username)
  VALUES (
    NEW.id,
    v_role,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    v_grade_id,
    NEW.raw_user_meta_data->>'username'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Existing hole: greenleaf_profiles_update_own (0001) has no column restriction, so any logged-in
-- user could set their own `role` (e.g. to 'admin') straight from the browser with the anon key.
-- Block role changes from any signed-in caller; the service role and the SQL editor have no
-- auth.uid() and are unaffected.
CREATE OR REPLACE FUNCTION public.greenleaf_block_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'role cannot be changed from the client';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS greenleaf_trg_block_role_change ON public.greenleaf_profiles;
CREATE TRIGGER greenleaf_trg_block_role_change
  BEFORE UPDATE ON public.greenleaf_profiles
  FOR EACH ROW EXECUTE FUNCTION public.greenleaf_block_role_change();

-- Admin can read profiles + rewards (to show who is requesting and their Leaf balance).
DROP POLICY IF EXISTS "greenleaf_profiles_select_admin" ON public.greenleaf_profiles;
CREATE POLICY "greenleaf_profiles_select_admin" ON public.greenleaf_profiles FOR SELECT
  USING (public.greenleaf_my_role() = 'admin');

DROP POLICY IF EXISTS "greenleaf_rewards_select_admin" ON public.greenleaf_rewards;
CREATE POLICY "greenleaf_rewards_select_admin" ON public.greenleaf_rewards FOR SELECT
  USING (public.greenleaf_my_role() = 'admin');

-- ─────────────────────────────────────────────────────────────
-- 2. Leaves can only be written server-side (service role)
-- ─────────────────────────────────────────────────────────────
-- 0007 let students INSERT/UPDATE their own greenleaf_rewards row, i.e. edit leaf_count directly.
-- With Leaves now redeemable for real prizes that must not be possible.
DROP POLICY IF EXISTS "greenleaf_rewards_insert_own" ON public.greenleaf_rewards;
DROP POLICY IF EXISTS "greenleaf_rewards_update_own" ON public.greenleaf_rewards;
DROP POLICY IF EXISTS "greenleaf_reward_events_insert_own" ON public.greenleaf_reward_events;

ALTER TABLE public.greenleaf_reward_events DROP CONSTRAINT IF EXISTS greenleaf_reward_events_type_check;
ALTER TABLE public.greenleaf_reward_events
  ADD CONSTRAINT greenleaf_reward_events_type_check
  CHECK (type IN ('mission_complete', 'perfect_score', 'streak_7', 'bonus_3missions', 'mystery_box_redeem'));

-- ─────────────────────────────────────────────────────────────
-- 3. Mystery Box requests
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.greenleaf_mystery_box_requests (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID        NOT NULL REFERENCES public.greenleaf_profiles(id) ON DELETE CASCADE,
  status      TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  cost        INTEGER     NOT NULL DEFAULT 100,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID        REFERENCES public.greenleaf_profiles(id) ON DELETE SET NULL
);

-- At most one pending request per student, enforced by the database (not just the API).
CREATE UNIQUE INDEX IF NOT EXISTS greenleaf_mystery_box_one_pending
  ON public.greenleaf_mystery_box_requests (student_id) WHERE status = 'pending';

ALTER TABLE public.greenleaf_mystery_box_requests ENABLE ROW LEVEL SECURITY;

-- Read-only from the client; all writes go through the API routes (service role).
DROP POLICY IF EXISTS "greenleaf_mystery_box_select" ON public.greenleaf_mystery_box_requests;
CREATE POLICY "greenleaf_mystery_box_select" ON public.greenleaf_mystery_box_requests FOR SELECT
  USING (
    student_id = auth.uid()
    OR public.greenleaf_my_role() IN ('admin', 'teacher')
    OR EXISTS (SELECT 1 FROM public.greenleaf_profiles p WHERE p.id = student_id AND p.parent_id = auth.uid())
  );

-- ─────────────────────────────────────────────────────────────
-- 4. Atomic confirm: check balance, deduct, log event, mark completed — in one transaction.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.greenleaf_confirm_mystery_box(p_request_id UUID, p_admin_id UUID)
RETURNS TABLE (ok BOOLEAN, reason TEXT, new_balance INTEGER)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req public.greenleaf_mystery_box_requests%ROWTYPE;
  v_leaves INTEGER;
BEGIN
  SELECT * INTO v_req FROM public.greenleaf_mystery_box_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'not_found', 0; RETURN;
  END IF;
  IF v_req.status <> 'pending' THEN
    RETURN QUERY SELECT FALSE, 'not_pending', 0; RETURN;
  END IF;

  SELECT r.leaf_count INTO v_leaves FROM public.greenleaf_rewards r WHERE r.student_id = v_req.student_id FOR UPDATE;
  IF v_leaves IS NULL OR v_leaves < v_req.cost THEN
    RETURN QUERY SELECT FALSE, 'insufficient_leaves', COALESCE(v_leaves, 0); RETURN;
  END IF;

  UPDATE public.greenleaf_rewards SET leaf_count = leaf_count - v_req.cost WHERE student_id = v_req.student_id;
  INSERT INTO public.greenleaf_reward_events (student_id, type, leaf_delta)
    VALUES (v_req.student_id, 'mystery_box_redeem', -v_req.cost);
  UPDATE public.greenleaf_mystery_box_requests
    SET status = 'completed', resolved_at = NOW(), resolved_by = p_admin_id
    WHERE id = p_request_id;

  RETURN QUERY SELECT TRUE, 'ok', v_leaves - v_req.cost;
END;
$$;

REVOKE ALL ON FUNCTION public.greenleaf_confirm_mystery_box(UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.greenleaf_confirm_mystery_box(UUID, UUID) TO service_role;
