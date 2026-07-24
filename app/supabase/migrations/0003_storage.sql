-- Bucket cho Teacher Resource Library — public read (giáo viên tải xuống trực tiếp qua public URL),
-- chỉ teacher mới upload/xoá.
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "resources_public_read" ON storage.objects;
CREATE POLICY "resources_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'resources');

DROP POLICY IF EXISTS "resources_teacher_write" ON storage.objects;
CREATE POLICY "resources_teacher_write" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'resources' AND public.my_role() = 'teacher');

DROP POLICY IF EXISTS "resources_teacher_delete" ON storage.objects;
CREATE POLICY "resources_teacher_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'resources' AND public.my_role() = 'teacher');
