-- Thêm khái niệm "Lesson" (bài học): mỗi Grade có nhiều Lesson dạng danh sách phẳng,
-- mỗi Lesson chứa đúng 3 Mission cố định (words_explorer, phonics, speaking_challenge).
-- Giáo viên tạo Lesson mới qua UI thay vì chỉ có đúng 1 bộ Mission demo cố định/grade.

-- ─────────────────────────────────────────────────────────────
-- greenleaf_lessons
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.greenleaf_lessons (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id    UUID        NOT NULL REFERENCES public.greenleaf_grades(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  order_index INTEGER     NOT NULL DEFAULT 0,
  created_by  UUID        REFERENCES public.greenleaf_profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.greenleaf_lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "greenleaf_lessons_select_all" ON public.greenleaf_lessons;
CREATE POLICY "greenleaf_lessons_select_all" ON public.greenleaf_lessons FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "greenleaf_lessons_write_teacher" ON public.greenleaf_lessons;
CREATE POLICY "greenleaf_lessons_write_teacher" ON public.greenleaf_lessons FOR ALL
  USING (public.greenleaf_my_role() = 'teacher')
  WITH CHECK (public.greenleaf_my_role() = 'teacher');

-- ─────────────────────────────────────────────────────────────
-- greenleaf_missions: chuyển từ gắn thẳng grade_id sang gắn qua lesson_id
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.greenleaf_missions ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.greenleaf_lessons(id) ON DELETE CASCADE;

-- Backfill: mỗi grade đang có sẵn 3 mission demo (từ 0002) -> gom vào 1 Lesson "Demo" per grade.
DO $$
DECLARE
  g RECORD;
  new_lesson_id UUID;
BEGIN
  FOR g IN SELECT DISTINCT grade_id FROM public.greenleaf_missions WHERE lesson_id IS NULL AND grade_id IS NOT NULL LOOP
    INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
    VALUES (g.grade_id, 'Demo', 1)
    RETURNING id INTO new_lesson_id;

    UPDATE public.greenleaf_missions
    SET lesson_id = new_lesson_id
    WHERE grade_id = g.grade_id AND lesson_id IS NULL;
  END LOOP;
END $$;

ALTER TABLE public.greenleaf_missions ALTER COLUMN lesson_id SET NOT NULL;

ALTER TABLE public.greenleaf_missions DROP CONSTRAINT IF EXISTS greenleaf_missions_grade_id_order_index_key;
ALTER TABLE public.greenleaf_missions DROP CONSTRAINT IF EXISTS greenleaf_missions_lesson_id_type_key;
ALTER TABLE public.greenleaf_missions ADD CONSTRAINT greenleaf_missions_lesson_id_type_key UNIQUE (lesson_id, type);

ALTER TABLE public.greenleaf_missions DROP COLUMN IF EXISTS grade_id;

-- Giáo viên được phép tạo/sửa/xoá Mission (trước đây chỉ có policy SELECT).
DROP POLICY IF EXISTS "greenleaf_missions_write_teacher" ON public.greenleaf_missions;
CREATE POLICY "greenleaf_missions_write_teacher" ON public.greenleaf_missions FOR ALL
  USING (public.greenleaf_my_role() = 'teacher')
  WITH CHECK (public.greenleaf_my_role() = 'teacher');
