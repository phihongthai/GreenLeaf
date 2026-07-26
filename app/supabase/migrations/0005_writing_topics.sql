-- Thêm "Writing Topic" (đề bài mẫu, tái sử dụng nhiều lần) — tách khỏi Assignment
-- (lần giao cụ thể). Giáo viên tạo Topic 1 lần trong thư viện, mỗi lần giao bài chỉ
-- cần CHỌN Topic + hạn nộp, giống hệt mô hình Lesson cho Speaking (migration 0004).

-- ─────────────────────────────────────────────────────────────
-- greenleaf_writing_topics
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.greenleaf_writing_topics (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id    UUID        NOT NULL REFERENCES public.greenleaf_grades(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  prompt      TEXT        NOT NULL DEFAULT '',
  order_index INTEGER     NOT NULL DEFAULT 0,
  created_by  UUID        REFERENCES public.greenleaf_profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.greenleaf_writing_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "greenleaf_writing_topics_select_all" ON public.greenleaf_writing_topics;
CREATE POLICY "greenleaf_writing_topics_select_all" ON public.greenleaf_writing_topics FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "greenleaf_writing_topics_write_teacher" ON public.greenleaf_writing_topics;
CREATE POLICY "greenleaf_writing_topics_write_teacher" ON public.greenleaf_writing_topics FOR ALL
  USING (public.greenleaf_my_role() = 'teacher')
  WITH CHECK (public.greenleaf_my_role() = 'teacher');

-- ─────────────────────────────────────────────────────────────
-- greenleaf_homework_assignments: chuyển từ chứa thẳng title/prompt/grade_id
-- sang tham chiếu 1 Topic có sẵn trong thư viện.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.greenleaf_homework_assignments ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.greenleaf_writing_topics(id) ON DELETE CASCADE;

-- Backfill: mỗi assignment cũ đã có sẵn title/prompt/grade_id riêng -> tạo 1 Topic
-- tương ứng trong thư viện rồi trỏ assignment về Topic đó.
DO $$
DECLARE
  a RECORD;
  new_topic_id UUID;
BEGIN
  FOR a IN
    SELECT id, grade_id, title, prompt, teacher_id
    FROM public.greenleaf_homework_assignments
    WHERE topic_id IS NULL
  LOOP
    INSERT INTO public.greenleaf_writing_topics (grade_id, title, prompt, created_by)
    VALUES (a.grade_id, a.title, a.prompt, a.teacher_id)
    RETURNING id INTO new_topic_id;

    UPDATE public.greenleaf_homework_assignments
    SET topic_id = new_topic_id
    WHERE id = a.id;
  END LOOP;
END $$;

ALTER TABLE public.greenleaf_homework_assignments ALTER COLUMN topic_id SET NOT NULL;

ALTER TABLE public.greenleaf_homework_assignments DROP COLUMN IF EXISTS title;
ALTER TABLE public.greenleaf_homework_assignments DROP COLUMN IF EXISTS prompt;
ALTER TABLE public.greenleaf_homework_assignments DROP COLUMN IF EXISTS grade_id;
