-- BUG FIX: greenleaf_rewards và greenleaf_reward_events chỉ có policy SELECT (đọc) từ
-- migration 0001, thiếu INSERT/UPDATE cho học sinh. RLS mặc định DENY mọi thao tác không có
-- policy khớp, nên mọi lần cộng Leaf (lib/rewards.ts) bị chặn ghi ÂM THẦM — leaf_count/
-- streak_days không bao giờ tăng, dù student_progress (có policy FOR ALL) vẫn cập nhật bình
-- thường -> Learning Journey lớn lên nhưng Leaves luôn = 0.

DROP POLICY IF EXISTS "greenleaf_rewards_insert_own" ON public.greenleaf_rewards;
CREATE POLICY "greenleaf_rewards_insert_own" ON public.greenleaf_rewards FOR INSERT
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "greenleaf_rewards_update_own" ON public.greenleaf_rewards;
CREATE POLICY "greenleaf_rewards_update_own" ON public.greenleaf_rewards FOR UPDATE
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "greenleaf_reward_events_insert_own" ON public.greenleaf_reward_events;
CREATE POLICY "greenleaf_reward_events_insert_own" ON public.greenleaf_reward_events FOR INSERT
  WITH CHECK (student_id = auth.uid());
