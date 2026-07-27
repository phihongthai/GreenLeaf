-- Words Explorer/Phonics có nhiều từ/câu trong CÙNG 1 mission — trước đây mỗi lượt ghi âm chỉ
-- log missionId + score, nên giáo viên/phụ huynh nhìn lịch sử không biết học sinh bị vướng ở
-- từ nào / câu nào trong bài, chỉ thấy chung chung "Words Explorer: 64 điểm" lặp lại nhiều lần.
-- Thêm cột item_label (nullable) lưu đúng từ/câu đang luyện tại thời điểm ghi âm đó.
ALTER TABLE public.greenleaf_mission_attempts ADD COLUMN IF NOT EXISTS item_label TEXT;
