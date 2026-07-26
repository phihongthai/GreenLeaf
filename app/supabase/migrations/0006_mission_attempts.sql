-- greenleaf_student_progress chỉ lưu trạng thái MỚI NHẤT của mỗi mission (upsert, bị ghi
-- đè mỗi lần học lại) — không đủ để xem lịch sử/tiến trình/số lần học mỗi ngày.
-- Thêm bảng log riêng, chỉ INSERT không bao giờ UPDATE, giữ lại toàn bộ lịch sử mỗi lần thử.

CREATE TABLE IF NOT EXISTS public.greenleaf_mission_attempts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID        NOT NULL REFERENCES public.greenleaf_profiles(id) ON DELETE CASCADE,
  mission_id UUID        NOT NULL REFERENCES public.greenleaf_missions(id) ON DELETE CASCADE,
  score      NUMERIC     NOT NULL,
  status     TEXT        NOT NULL CHECK (status IN ('completed', 'try_again')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS greenleaf_mission_attempts_student_created_idx
  ON public.greenleaf_mission_attempts (student_id, created_at DESC);

ALTER TABLE public.greenleaf_mission_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "greenleaf_mission_attempts_insert_own" ON public.greenleaf_mission_attempts;
CREATE POLICY "greenleaf_mission_attempts_insert_own" ON public.greenleaf_mission_attempts FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- student xem của mình; teacher xem tất cả; parent xem của con
DROP POLICY IF EXISTS "greenleaf_mission_attempts_select" ON public.greenleaf_mission_attempts;
CREATE POLICY "greenleaf_mission_attempts_select" ON public.greenleaf_mission_attempts FOR SELECT
  USING (
    student_id = auth.uid()
    OR public.greenleaf_my_role() = 'teacher'
    OR EXISTS (
      SELECT 1 FROM public.greenleaf_profiles p
      WHERE p.id = greenleaf_mission_attempts.student_id AND p.parent_id = auth.uid()
    )
  );
