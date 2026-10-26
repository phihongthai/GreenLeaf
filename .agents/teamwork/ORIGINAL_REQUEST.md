# Original User Request

## 2026-10-16T21:38:30Z

Rà soát toàn bộ logic, nội dung và giao diện của hệ thống GreenLeaf (Web & Mobile React Native), đánh giá mức độ phù hợp thực tế đối với một trung tâm tiếng Anh tại ngoại ô Hà Nội, nơi học viên là trẻ nhỏ và phụ huynh là công nhân khu công nghiệp làm theo ca kíp. Xuất báo cáo phản biện toàn diện (Audit Report & Action Plan) chỉ rõ các điểm xa rời thực tế và danh sách đầu việc kỹ thuật cần khắc phục.

Working directory: /Users/phihongthai/tcbs/my-project/GreenLeaf
Integrity mode: development

## Bối cảnh & Thực tế hiện trường
1. **Thiết bị**: Trẻ dùng điện thoại thông minh giá rẻ (Android phổ thông, iPhone đời cũ pin chai), màn hình nhỏ, mạng 3G/4G chập chờn tại các khu nhà trọ ngoại thành.
2. **Phụ huynh**: Bố mẹ công nhân tăng ca về muộn, mệt mỏi, không có trình độ tiếng Anh và không có thời gian ngồi kèm. Họ sẽ **không** vào web dashboard phức tạp, không tải thêm app cồng kềnh.
3. **Trẻ nhỏ**: Cần tự giác mở máy là học được ngay (0-click / 1-click), giao diện trực quan trực giác bằng hình ảnh/âm thanh thay vì nhiều chữ hướng dẫn.

## Requirements

### R1. Rà soát luồng tự học độc lập của trẻ (0-click / Zero Friction UX)
- Rà soát toàn bộ luồng từ đăng nhập, chọn bài đến khi vào làm bài trên cả Web (`app/`) và Mobile (`mobile/`).
- Đánh giá rào cản thao tác: Chỗ nào bắt đọc chữ hướng dẫn phức tạp? Chỗ nào trẻ phải nhờ người lớn bấm hộ?
- Rà soát cơ chế tự động chạy bài học, tự phát âm thanh (Speaking Challenge, Phonics Chant) và cơ chế phản hồi giọng nói/chấm điểm khi trẻ nói tiếng Anh bập bẹ hoặc phát âm sai.

### R2. Rà soát khả năng tương thích thiết bị yếu & mạng chập chờn (Low-end Hardware & Offline/Network Resilience)
- Phân tích bundle size, asset nặng, việc decode ảnh và tải video/âm thanh trên máy cấu hình thấp.
- Đánh giá khả năng sống sót khi rớt mạng đột ngột (Offline-first, Local Storage caching, retry logic).
- Đánh giá mức độ hao pin và tài nguyên (CPU/RAM) khi chạy liên tục các màn hình có hoạt họa và xử lý âm thanh.

### R3. Rà soát kênh kết nối phụ huynh công nhân (Parent Loop)
- Đánh giá tính thực tế của các tính năng dành cho phụ huynh hiện tại (Parent Dashboard, báo cáo học tập).
- Đề xuất mô hình thông báo tiến độ "1 chạm" (qua Zalo bot, tin nhắn ngắn gọn, hình ảnh huy hiệu/khen ngợi trực quan) mà bố mẹ liếc qua 5 giây sau ca làm việc là thấy yên tâm và tự hào về con.

### R4. Lập kế hoạch hành động kỹ thuật (Action Plan & Prioritization)
- Bảng ma trận Gap Analysis: Hiện trạng code vs Thực tế hiện trường vs Giải pháp.
- Phân loại ưu tiên:
  - **P0 (Khẩn cấp)**: Các điểm nghẽn khiến trẻ không thể tự học độc lập hoặc app văng trên máy yếu.
  - **P1 (Quan trọng)**: Tối ưu mạng chập chờn, giảm tải dữ liệu, đơn giản hóa giao diện.
  - **P2 (Nâng cao)**: Tối ưu hóa kênh báo cáo phụ huynh và tăng tính gắn kết văn hóa đời sống ngoại thành.

## Acceptance Criteria

### Comprehensive Audit Document
- [ ] Báo cáo được lưu thành file `docs/audit_suburban_worker_families_fit.md`.
- [ ] Giọng văn chân thực, trực diện, không nói giảm nói tránh (Phùng Quán style), vạch trần các điểm "vẽ ra trên giấy" không phù hợp với con em công nhân.
- [ ] Chấm điểm độ phù hợp thực tế (Thang điểm 1 - 10) cho từng cụm tính năng chính: Auth/Onboarding, Map & Path, Lesson Player (Speaking/Phonics/Quiz), Parent Interface.
- [ ] Danh mục giải pháp kỹ thuật cụ thể (chỉ rõ file code cần sửa, giải pháp thay thế, kiến trúc đề xuất).
