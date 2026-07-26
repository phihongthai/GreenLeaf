-- Cho phép giáo viên tạo tài khoản username+password cho học sinh/phụ huynh (không cần email
-- thật, không cần xác nhận email — tạo qua Supabase Admin API với email_confirm=true).
-- Auth vẫn cần định dạng email nên dùng email giả "<username>@greenleaf.local"; cột username
-- lưu tên đăng nhập thật để hiển thị lại cho giáo viên (không đọc được auth.users.email từ client).

ALTER TABLE public.greenleaf_profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Cập nhật trigger để lưu thêm username khi có trong raw_user_meta_data lúc tạo tài khoản.
CREATE OR REPLACE FUNCTION public.greenleaf_handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_grade_id UUID;
BEGIN
  SELECT id INTO v_grade_id FROM public.greenleaf_grades WHERE code = NEW.raw_user_meta_data->>'grade_code';

  INSERT INTO public.greenleaf_profiles (id, role, name, grade_id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    v_grade_id,
    NEW.raw_user_meta_data->>'username'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Giáo viên được sửa mọi profile (trước đây chỉ tự sửa được mình) — cần để gán parent_id
-- cho học sinh (liên kết phụ huynh ↔ học sinh) từ phía giáo viên.
DROP POLICY IF EXISTS "greenleaf_profiles_update_teacher" ON public.greenleaf_profiles;
CREATE POLICY "greenleaf_profiles_update_teacher" ON public.greenleaf_profiles FOR UPDATE
  USING (public.greenleaf_my_role() = 'teacher')
  WITH CHECK (public.greenleaf_my_role() = 'teacher');
