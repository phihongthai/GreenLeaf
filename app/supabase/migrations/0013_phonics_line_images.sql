-- Phonics/Sentence Builder có nhiều câu trong CÙNG 1 mission (giống Words Explorer có nhiều
-- từ) — ảnh minh hoạ phải gắn theo TỪNG CÂU, không phải 1 ảnh dùng chung cho cả mission.
-- Đổi content.lines từ mảng string sang mảng object {text, imageUrl, imageDescription}.
-- Cũng dọn 2 key imageUrl/imageDescription ở cấp mission (nếu có, từ lần thử trước) vì giờ
-- không còn dùng ở cấp đó nữa.
UPDATE public.greenleaf_missions
SET content = jsonb_set(
  content - 'imageUrl' - 'imageDescription',
  '{lines}',
  (
    SELECT jsonb_agg(jsonb_build_object('text', line, 'imageUrl', '', 'imageDescription', ''))
    FROM jsonb_array_elements_text(content->'lines') AS line
  )
)
WHERE type = 'phonics'
  AND jsonb_typeof(content->'lines') = 'array'
  -- Idempotent: bỏ qua nếu đã là mảng object (phần tử đầu tiên có key "text") — tránh chạy
  -- lại migration này làm hỏng dữ liệu đã chuyển đổi hoặc dữ liệu giáo viên mới tự nhập.
  AND jsonb_typeof(content->'lines'->0) = 'string';
