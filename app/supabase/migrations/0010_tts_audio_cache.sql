-- Bucket cache cho audio "Nghe mẫu" (Azure TTS). Nội dung mission (từ vựng, câu phonics,
-- script speaking) lặp lại cho rất nhiều học sinh, nên thay vì gọi Azure TTS mỗi lần phát,
-- server tính hash(text+rate+voice) và lưu file mp3 tương ứng vào đây — lần sau phát lại từ
-- cache. Public read để phát trực tiếp qua public URL; chỉ server (service role) mới ghi,
-- nên không cần policy INSERT/DELETE cho client.
INSERT INTO storage.buckets (id, name, public)
VALUES ('greenleaf-tts-cache', 'greenleaf-tts-cache', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "greenleaf_tts_cache_public_read" ON storage.objects;
CREATE POLICY "greenleaf_tts_cache_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'greenleaf-tts-cache');
