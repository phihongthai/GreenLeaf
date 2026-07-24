-- Bucket cho Teacher Resource Library — public read (giáo viên tải xuống trực tiếp qua public URL),
-- chỉ teacher mới upload/xoá. Đặt tên "greenleaf-resources" (không phải "resources") vì bucket id
-- dùng chung namespace toàn Supabase project, tránh đụng project khác trên cùng database.
INSERT INTO storage.buckets (id, name, public)
VALUES ('greenleaf-resources', 'greenleaf-resources', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "greenleaf_resources_public_read" ON storage.objects;
CREATE POLICY "greenleaf_resources_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'greenleaf-resources');

DROP POLICY IF EXISTS "greenleaf_resources_teacher_write" ON storage.objects;
CREATE POLICY "greenleaf_resources_teacher_write" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'greenleaf-resources' AND public.greenleaf_my_role() = 'teacher');

DROP POLICY IF EXISTS "greenleaf_resources_teacher_delete" ON storage.objects;
CREATE POLICY "greenleaf_resources_teacher_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'greenleaf-resources' AND public.greenleaf_my_role() = 'teacher');
