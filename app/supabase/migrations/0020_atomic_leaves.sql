-- Migration 0020: Atomic Leaf & Streak Accounting
-- Prevents race conditions / double awards when mission completion requests arrive concurrently.
-- Writes are performed via SECURITY DEFINER functions callable only by service_role.

-- ─────────────────────────────────────────────────────────────
-- 1. Atomic Leaf Increment & Event Logging
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.greenleaf_add_leaves(
  p_student_id UUID,
  p_type TEXT,
  p_leaf_delta INTEGER DEFAULT NULL,
  p_mission_id UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_delta INTEGER;
BEGIN
  IF p_leaf_delta IS NOT NULL THEN
    v_delta := p_leaf_delta;
  ELSE
    CASE p_type
      WHEN 'mission_complete' THEN v_delta := 1;
      WHEN 'perfect_score'    THEN v_delta := 5;
      WHEN 'streak_7'         THEN v_delta := 20;
      WHEN 'bonus_3missions'  THEN v_delta := 3;
      ELSE
        RAISE EXCEPTION 'Unknown reward event type without delta: %', p_type;
    END CASE;
  END IF;

  -- Upsert greenleaf_rewards
  INSERT INTO public.greenleaf_rewards (student_id, leaf_count, streak_days)
  VALUES (p_student_id, v_delta, 0)
  ON CONFLICT (student_id)
  DO UPDATE SET leaf_count = greenleaf_rewards.leaf_count + v_delta;

  -- Insert audit event
  INSERT INTO public.greenleaf_reward_events (student_id, type, leaf_delta, mission_id)
  VALUES (p_student_id, p_type, v_delta, p_mission_id);

  RETURN v_delta;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 2. Atomic Streak Update (same day = keep, yesterday = +1, else reset to 1)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.greenleaf_update_streak(
  p_student_id UUID,
  p_today DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (streak_days INTEGER, streak_bonus_awarded BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today DATE := COALESCE(p_today, CURRENT_DATE);
  v_yesterday DATE := v_today - 1;
  v_cur_streak INTEGER;
  v_last_active DATE;
  v_new_streak INTEGER;
  v_bonus BOOLEAN := FALSE;
BEGIN
  -- Lock row if exists
  SELECT r.streak_days, r.last_active_date
    INTO v_cur_streak, v_last_active
    FROM public.greenleaf_rewards r
   WHERE r.student_id = p_student_id
     FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.greenleaf_rewards (student_id, leaf_count, streak_days, last_active_date)
    VALUES (p_student_id, 0, 1, v_today)
    ON CONFLICT (student_id) DO UPDATE
      SET streak_days = CASE
            WHEN greenleaf_rewards.last_active_date >= v_today THEN greenleaf_rewards.streak_days
            WHEN greenleaf_rewards.last_active_date = v_yesterday THEN greenleaf_rewards.streak_days + 1
            ELSE 1
          END,
          last_active_date = GREATEST(greenleaf_rewards.last_active_date, v_today)
    RETURNING greenleaf_rewards.streak_days INTO v_new_streak;

    IF v_new_streak > 0 AND v_new_streak % 7 = 0 THEN
      PERFORM public.greenleaf_add_leaves(p_student_id, 'streak_7', 20, NULL);
      v_bonus := TRUE;
    END IF;

    RETURN QUERY SELECT v_new_streak, v_bonus;
    RETURN;
  END IF;

  IF v_last_active >= v_today THEN
    RETURN QUERY SELECT COALESCE(v_cur_streak, 1), FALSE;
    RETURN;
  END IF;

  IF v_last_active = v_yesterday THEN
    v_new_streak := COALESCE(v_cur_streak, 0) + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  UPDATE public.greenleaf_rewards
     SET streak_days = v_new_streak,
         last_active_date = v_today
   WHERE student_id = p_student_id;

  IF v_new_streak > 0 AND v_new_streak % 7 = 0 THEN
    PERFORM public.greenleaf_add_leaves(p_student_id, 'streak_7', 20, NULL);
    v_bonus := TRUE;
  END IF;

  RETURN QUERY SELECT v_new_streak, v_bonus;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 3. Atomic Progress Upsert & First-Completion Detection
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.greenleaf_record_progress(
  p_student_id UUID,
  p_mission_id UUID,
  p_score NUMERIC
)
RETURNS TABLE (status TEXT, was_already_completed BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_passed BOOLEAN;
  v_status TEXT;
  v_existing_status TEXT;
  v_was_completed BOOLEAN := FALSE;
BEGIN
  -- Serialize concurrent attempts for this student + mission
  PERFORM pg_advisory_xact_lock(hashtext(p_student_id::text || ':' || p_mission_id::text));

  v_passed := (p_score >= 80);
  v_status := CASE WHEN v_passed THEN 'completed' ELSE 'try_again' END;

  SELECT p.status INTO v_existing_status
    FROM public.greenleaf_student_progress p
   WHERE p.student_id = p_student_id AND p.mission_id = p_mission_id;

  IF FOUND AND v_existing_status = 'completed' THEN
    v_was_completed := TRUE;
  END IF;

  INSERT INTO public.greenleaf_student_progress (
    student_id, mission_id, score, status, completed_at
  ) VALUES (
    p_student_id, p_mission_id, p_score, v_status,
    CASE WHEN v_passed THEN NOW() ELSE NULL END
  )
  ON CONFLICT (student_id, mission_id) DO UPDATE
    SET score = EXCLUDED.score,
        status = CASE
          WHEN greenleaf_student_progress.status = 'completed' THEN 'completed'
          ELSE EXCLUDED.status
        END,
        completed_at = CASE
          WHEN greenleaf_student_progress.status = 'completed' THEN greenleaf_student_progress.completed_at
          WHEN EXCLUDED.status = 'completed' THEN NOW()
          ELSE NULL
        END,
        updated_at = NOW();

  RETURN QUERY SELECT v_status, v_was_completed;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 4. Atomic Lesson Bonus Claim
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.greenleaf_claim_lesson_bonus(
  p_student_id UUID,
  p_lesson_id UUID,
  p_trigger_mission_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_missions INTEGER;
  v_completed_missions INTEGER;
  v_already_awarded BOOLEAN;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_student_id::text || ':lesson:' || p_lesson_id::text));

  SELECT COUNT(*) INTO v_total_missions
    FROM public.greenleaf_missions
   WHERE lesson_id = p_lesson_id;

  IF v_total_missions = 0 THEN
    RETURN FALSE;
  END IF;

  SELECT COUNT(DISTINCT p.mission_id) INTO v_completed_missions
    FROM public.greenleaf_student_progress p
    JOIN public.greenleaf_missions m ON m.id = p.mission_id
   WHERE p.student_id = p_student_id
     AND m.lesson_id = p_lesson_id
     AND p.status = 'completed';

  IF v_completed_missions < v_total_missions THEN
    RETURN FALSE;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.greenleaf_reward_events re
     JOIN public.greenleaf_missions m ON m.id = re.mission_id
    WHERE re.student_id = p_student_id
      AND re.type = 'bonus_3missions'
      AND m.lesson_id = p_lesson_id
  ) INTO v_already_awarded;

  IF v_already_awarded THEN
    RETURN FALSE;
  END IF;

  PERFORM public.greenleaf_add_leaves(p_student_id, 'bonus_3missions', 3, p_trigger_mission_id);
  RETURN TRUE;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 5. Revoke execute from public/anon/authenticated; grant to service_role
-- ─────────────────────────────────────────────────────────────
REVOKE ALL ON FUNCTION public.greenleaf_add_leaves(UUID, TEXT, INTEGER, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.greenleaf_add_leaves(UUID, TEXT, INTEGER, UUID) TO service_role;

REVOKE ALL ON FUNCTION public.greenleaf_update_streak(UUID, DATE) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.greenleaf_update_streak(UUID, DATE) TO service_role;

REVOKE ALL ON FUNCTION public.greenleaf_record_progress(UUID, UUID, NUMERIC) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.greenleaf_record_progress(UUID, UUID, NUMERIC) TO service_role;

REVOKE ALL ON FUNCTION public.greenleaf_claim_lesson_bonus(UUID, UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.greenleaf_claim_lesson_bonus(UUID, UUID, UUID) TO service_role;
