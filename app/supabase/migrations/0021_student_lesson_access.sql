-- ─────────────────────────────────────────────────────────────
-- Migration 0021: Per-student lesson access overrides
-- A row overrides the lesson-wide greenleaf_lessons.is_unlocked for one
-- student: unlocked = TRUE opens the lesson, FALSE locks it. No row = follow
-- the lesson default (is_unlocked / completion of the previous lesson).
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.greenleaf_student_lesson_access (
  student_id uuid NOT NULL REFERENCES public.greenleaf_profiles(id) ON DELETE CASCADE,
  lesson_id  uuid NOT NULL REFERENCES public.greenleaf_lessons(id) ON DELETE CASCADE,
  unlocked   boolean NOT NULL,
  updated_by uuid REFERENCES public.greenleaf_profiles(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, lesson_id)
);

ALTER TABLE public.greenleaf_student_lesson_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY greenleaf_student_lesson_access_select
  ON public.greenleaf_student_lesson_access FOR SELECT
  USING (
    student_id = auth.uid()
    OR public.greenleaf_my_role() = 'teacher'
    OR EXISTS (
      SELECT 1 FROM public.greenleaf_profiles p
      WHERE p.id = student_id AND p.parent_id = auth.uid()
    )
  );

CREATE POLICY greenleaf_student_lesson_access_write_teacher
  ON public.greenleaf_student_lesson_access FOR ALL
  USING (public.greenleaf_my_role() = 'teacher')
  WITH CHECK (public.greenleaf_my_role() = 'teacher');
