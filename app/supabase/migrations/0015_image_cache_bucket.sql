INSERT INTO storage.buckets (id, name, public)
VALUES ('greenleaf-images', 'greenleaf-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "greenleaf_images_public_read" ON storage.objects;
CREATE POLICY "greenleaf_images_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'greenleaf-images');

DROP POLICY IF EXISTS "greenleaf_images_service_write" ON storage.objects;
CREATE POLICY "greenleaf_images_service_write" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'greenleaf-images');
