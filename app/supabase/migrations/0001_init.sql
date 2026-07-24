-- GreenLeaf MVP — initial schema
-- Chạy trong Supabase SQL Editor hoặc `supabase db push`
-- Tất cả bảng/hàm/trigger đặt tiền tố "greenleaf_" vì database này dùng chung cho nhiều project.

-- ─────────────────────────────────────────────────────────────
-- Helpers
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.greenleaf_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────
-- greenleaf_profiles (1-1 với auth.users)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.greenleaf_profiles (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT        NOT NULL CHECK (role IN ('student', 'teacher', 'parent')),
  name       TEXT        NOT NULL DEFAULT '',
  grade_id   UUID,
  parent_id  UUID        REFERENCES public.greenleaf_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- grade_id FK thêm sau khi tạo bảng greenleaf_grades (xem ALTER TABLE bên dưới), vì bảng đó chưa tồn tại tại đây.

-- SECURITY DEFINER để tránh đệ quy RLS khi policy trên chính bảng greenleaf_profiles
-- cần đọc role của người dùng hiện tại. Định nghĩa sau khi greenleaf_profiles đã tồn tại.
CREATE OR REPLACE FUNCTION public.greenleaf_my_role()
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT role FROM public.greenleaf_profiles WHERE id = auth.uid()
$$;

-- ─────────────────────────────────────────────────────────────
-- greenleaf_grades
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.greenleaf_grades (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT        NOT NULL UNIQUE CHECK (code IN ('kindergarten', 'kids1', 'kids2', 'teens')),
  name        TEXT        NOT NULL,
  age_range   TEXT        NOT NULL,
  order_index INTEGER     NOT NULL DEFAULT 0
);

-- ADD CONSTRAINT không có dạng IF NOT EXISTS trong Postgres, nên bọc trong DO block
-- để migration chạy lại nhiều lần (idempotent) không báo lỗi "already exists".
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'greenleaf_profiles_grade_id_fkey'
  ) THEN
    ALTER TABLE public.greenleaf_profiles
      ADD CONSTRAINT greenleaf_profiles_grade_id_fkey FOREIGN KEY (grade_id) REFERENCES public.greenleaf_grades(id);
  END IF;
END $$;

INSERT INTO public.greenleaf_grades (code, name, age_range, order_index) VALUES
  ('kindergarten', 'Kindergarten', '2.5 - 6 tuổi', 1),
  ('kids1',        'Kids 1',       'Lớp 1 - 2 - 3', 2),
  ('kids2',        'Kids 2',       'Lớp 4 - 5',     3),
  ('teens',        'Teens',        'THCS & THPT',   4)
ON CONFLICT (code) DO NOTHING;

-- Tự tạo profile khi có user mới trong auth.users (áp dụng cho cả self-signup
-- của teacher/parent lẫn tài khoản học sinh do giáo viên tạo qua Admin API).
-- role/name/grade_code lấy từ raw_user_meta_data do client truyền vào lúc signUp().
CREATE OR REPLACE FUNCTION public.greenleaf_handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_grade_id UUID;
BEGIN
  SELECT id INTO v_grade_id FROM public.greenleaf_grades WHERE code = NEW.raw_user_meta_data->>'grade_code';

  INSERT INTO public.greenleaf_profiles (id, role, name, grade_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    v_grade_id
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger trên auth.users (bảng dùng chung toàn project) — PHẢI đặt tên riêng
-- cho GreenLeaf để không đụng/ghi đè trigger của project khác trên cùng database.
DROP TRIGGER IF EXISTS greenleaf_on_auth_user_created ON auth.users;
CREATE TRIGGER greenleaf_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.greenleaf_handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- greenleaf_missions
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.greenleaf_missions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id    UUID        NOT NULL REFERENCES public.greenleaf_grades(id) ON DELETE CASCADE,
  type        TEXT        NOT NULL CHECK (type IN ('words_explorer', 'phonics', 'speaking_challenge')),
  order_index INTEGER     NOT NULL DEFAULT 0,
  title       TEXT        NOT NULL,
  content     JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (grade_id, order_index)
);

-- ─────────────────────────────────────────────────────────────
-- greenleaf_student_progress
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.greenleaf_student_progress (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID        NOT NULL REFERENCES public.greenleaf_profiles(id) ON DELETE CASCADE,
  mission_id   UUID        NOT NULL REFERENCES public.greenleaf_missions(id) ON DELETE CASCADE,
  score        NUMERIC,
  audio_url    TEXT,
  status       TEXT        NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'try_again', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, mission_id)
);

DROP TRIGGER IF EXISTS greenleaf_trg_student_progress_updated_at ON public.greenleaf_student_progress;
CREATE TRIGGER greenleaf_trg_student_progress_updated_at
  BEFORE UPDATE ON public.greenleaf_student_progress
  FOR EACH ROW EXECUTE FUNCTION public.greenleaf_set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- greenleaf_rewards (1 dòng / học sinh) + greenleaf_reward_events (log audit)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.greenleaf_rewards (
  student_id      UUID        PRIMARY KEY REFERENCES public.greenleaf_profiles(id) ON DELETE CASCADE,
  leaf_count      INTEGER     NOT NULL DEFAULT 0,
  streak_days     INTEGER     NOT NULL DEFAULT 0,
  last_active_date DATE
);

CREATE TABLE IF NOT EXISTS public.greenleaf_reward_events (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID        NOT NULL REFERENCES public.greenleaf_profiles(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL CHECK (type IN ('mission_complete', 'perfect_score', 'streak_7', 'bonus_3missions')),
  leaf_delta INTEGER     NOT NULL,
  mission_id UUID        REFERENCES public.greenleaf_missions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- homework
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.greenleaf_homework_assignments (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID        NOT NULL REFERENCES public.greenleaf_profiles(id) ON DELETE CASCADE,
  grade_id   UUID        NOT NULL REFERENCES public.greenleaf_grades(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  prompt     TEXT        NOT NULL DEFAULT '',
  due_date   DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.greenleaf_homework_submissions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID        NOT NULL REFERENCES public.greenleaf_homework_assignments(id) ON DELETE CASCADE,
  student_id    UUID        NOT NULL REFERENCES public.greenleaf_profiles(id) ON DELETE CASCADE,
  content_text  TEXT        NOT NULL DEFAULT '',
  status        TEXT        NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded')),
  submitted_at  TIMESTAMPTZ,
  graded_at     TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (assignment_id, student_id)
);

DROP TRIGGER IF EXISTS greenleaf_trg_homework_submissions_updated_at ON public.greenleaf_homework_submissions;
CREATE TRIGGER greenleaf_trg_homework_submissions_updated_at
  BEFORE UPDATE ON public.greenleaf_homework_submissions
  FOR EACH ROW EXECUTE FUNCTION public.greenleaf_set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- greenleaf_resource_files (Teacher Resource Library)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.greenleaf_resource_files (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course       TEXT        NOT NULL,
  unit         TEXT        NOT NULL,
  file_type    TEXT        NOT NULL CHECK (file_type IN ('lesson_plan', 'worksheet', 'flashcard', 'audio', 'video', 'test', 'keys')),
  file_name    TEXT        NOT NULL,
  storage_path TEXT        NOT NULL,
  uploaded_by  UUID        REFERENCES public.greenleaf_profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.greenleaf_profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greenleaf_grades                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greenleaf_missions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greenleaf_student_progress      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greenleaf_rewards               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greenleaf_reward_events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greenleaf_homework_assignments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greenleaf_homework_submissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greenleaf_resource_files        ENABLE ROW LEVEL SECURITY;

-- greenleaf_profiles: tự đọc/sửa mình; teacher đọc tất cả; parent đọc con mình
DROP POLICY IF EXISTS "greenleaf_profiles_select" ON public.greenleaf_profiles;
CREATE POLICY "greenleaf_profiles_select" ON public.greenleaf_profiles FOR SELECT
  USING (id = auth.uid() OR public.greenleaf_my_role() = 'teacher' OR parent_id = auth.uid());

DROP POLICY IF EXISTS "greenleaf_profiles_update_own" ON public.greenleaf_profiles;
CREATE POLICY "greenleaf_profiles_update_own" ON public.greenleaf_profiles FOR UPDATE
  USING (id = auth.uid());

-- grades, missions: public read (mọi role đã đăng nhập)
DROP POLICY IF EXISTS "greenleaf_grades_select_all" ON public.greenleaf_grades;
CREATE POLICY "greenleaf_grades_select_all" ON public.greenleaf_grades FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "greenleaf_missions_select_all" ON public.greenleaf_missions;
CREATE POLICY "greenleaf_missions_select_all" ON public.greenleaf_missions FOR SELECT TO authenticated USING (true);

-- student_progress: học sinh CRUD của mình; teacher đọc tất cả; parent đọc của con
DROP POLICY IF EXISTS "greenleaf_progress_own_student" ON public.greenleaf_student_progress;
CREATE POLICY "greenleaf_progress_own_student" ON public.greenleaf_student_progress FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "greenleaf_progress_read_teacher_parent" ON public.greenleaf_student_progress;
CREATE POLICY "greenleaf_progress_read_teacher_parent" ON public.greenleaf_student_progress FOR SELECT
  USING (
    public.greenleaf_my_role() = 'teacher'
    OR EXISTS (SELECT 1 FROM public.greenleaf_profiles p WHERE p.id = greenleaf_student_progress.student_id AND p.parent_id = auth.uid())
  );

-- rewards: tương tự student_progress
DROP POLICY IF EXISTS "greenleaf_rewards_own_student" ON public.greenleaf_rewards;
CREATE POLICY "greenleaf_rewards_own_student" ON public.greenleaf_rewards FOR SELECT
  USING (
    student_id = auth.uid()
    OR public.greenleaf_my_role() = 'teacher'
    OR EXISTS (SELECT 1 FROM public.greenleaf_profiles p WHERE p.id = greenleaf_rewards.student_id AND p.parent_id = auth.uid())
  );

DROP POLICY IF EXISTS "greenleaf_reward_events_own_student" ON public.greenleaf_reward_events;
CREATE POLICY "greenleaf_reward_events_own_student" ON public.greenleaf_reward_events FOR SELECT
  USING (student_id = auth.uid() OR public.greenleaf_my_role() = 'teacher');

-- homework
DROP POLICY IF EXISTS "greenleaf_homework_assignments_select" ON public.greenleaf_homework_assignments;
CREATE POLICY "greenleaf_homework_assignments_select" ON public.greenleaf_homework_assignments FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "greenleaf_homework_assignments_write_teacher" ON public.greenleaf_homework_assignments;
CREATE POLICY "greenleaf_homework_assignments_write_teacher" ON public.greenleaf_homework_assignments FOR ALL
  USING (public.greenleaf_my_role() = 'teacher')
  WITH CHECK (public.greenleaf_my_role() = 'teacher');

DROP POLICY IF EXISTS "greenleaf_homework_submissions_own_student" ON public.greenleaf_homework_submissions;
CREATE POLICY "greenleaf_homework_submissions_own_student" ON public.greenleaf_homework_submissions FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "greenleaf_homework_submissions_teacher" ON public.greenleaf_homework_submissions;
CREATE POLICY "greenleaf_homework_submissions_teacher" ON public.greenleaf_homework_submissions FOR SELECT
  USING (public.greenleaf_my_role() = 'teacher');

DROP POLICY IF EXISTS "greenleaf_homework_submissions_teacher_grade" ON public.greenleaf_homework_submissions;
CREATE POLICY "greenleaf_homework_submissions_teacher_grade" ON public.greenleaf_homework_submissions FOR UPDATE
  USING (public.greenleaf_my_role() = 'teacher');

-- resource_files: mọi người đã đăng nhập đọc; chỉ teacher upload/xoá
DROP POLICY IF EXISTS "greenleaf_resource_files_select_all" ON public.greenleaf_resource_files;
CREATE POLICY "greenleaf_resource_files_select_all" ON public.greenleaf_resource_files FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "greenleaf_resource_files_write_teacher" ON public.greenleaf_resource_files;
CREATE POLICY "greenleaf_resource_files_write_teacher" ON public.greenleaf_resource_files FOR ALL
  USING (public.greenleaf_my_role() = 'teacher')
  WITH CHECK (public.greenleaf_my_role() = 'teacher');
