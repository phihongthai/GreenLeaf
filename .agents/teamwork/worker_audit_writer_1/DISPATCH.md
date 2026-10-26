# Dispatch for Audit Report Author (worker_audit_writer_1)

## Mission
Author the comprehensive, master audit report and action plan for GreenLeaf at:
`/Users/phihongthai/tcbs/my-project/GreenLeaf/docs/audit_suburban_worker_families_fit.md`

## Input Sources to Read First
1. `/Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/ORIGINAL_REQUEST.md`
2. `/Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/explorer_web_1/handoff.md`
3. `/Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/explorer_mobile_1/handoff.md`
4. `/Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/explorer_player_1/handoff.md`
5. User Context & Style Rules:
   - Voice: Phùng Quán style ("ba phút sự thật", thà thô mà thật còn hơn bóng mà giả). Nhìn thẳng vào sự thật, không trịch thượng phán xét từ trên cao.
   - Nhịp điệu: Mở đầu bằng móc nối cụ thể (quan sát thực tế hoặc hành động cụ thể) -> lột tả cơ chế gốc -> dồn dập rồi chốt hạ bằng câu ngắn, dứt khoát để đóng đinh.
   - Chi tiết có da có thịt: Số liệu neo vào hình ảnh đời thường xóm trọ công nhân (Đông Anh, Kim Chung, Quang Minh, ca đêm 12 tiếng, điện thoại Android cũ 2GB vỡ màn hình, 3G chập chờn).
   - CẤM TUYỆT ĐỐI: Không bịa chuyện. CẤM "Không phải X, mà là Y", "Tuy nhiên, cũng cần lưu ý rằng...", "Một mặt... mặt khác...". CẤM từ ngữ guru/sáo rỗng ("chạm", "phiên bản tốt nhất", "lan tỏa năng lượng tích cực"). CẤM chêm tiếng Anh làm màu khi từ tiếng Việt đã rõ nghĩa. CẤM lên gân, sến súa, lạm dụng dấu "!". Kết thúc bằng dấu ".".

## Structure of `docs/audit_suburban_worker_families_fit.md`
1. **Lời mở đầu & Bối cảnh Hiện trường**:
   - Khắc họa bức tranh thực tế xóm trọ công nhân ngoại ô Hà Nội, ca kíp nhà máy, chiếc điện thoại thông minh cũ là công cụ học tập duy nhất của đứa trẻ.
2. **Bảng tổng kết Chấm điểm Thực tế (Thang điểm 1 - 10)**:
   - Bảng ma trận chấm điểm 4 cụm tính năng chính:
     1. Auth & Onboarding (Web & Mobile)
     2. Map & Path (Bản đồ & Lộ trình học)
     3. Lesson Player & Speech Evaluation (Bộ phát bài học, Speaking, Phonics, Quiz, Audio Engine)
     4. Parent Interface (Giao diện phụ huynh)
     - Điểm số trung bình toàn hệ thống: ~2.8/10.
3. **Phần I: Luồng tự học độc lập của trẻ (0-click / Zero Friction UX) — Ảo tưởng trên giấy vs Hiện thực phũ phàng**:
   - Phân tích rào cản đăng nhập chữ, pop-up 5 trang tiếng Anh, màn hình chào bắt chờ 2.2s.
   - Vỡ giao diện bản đồ trên màn hình 360px (`StudentWorldMap.tsx min-w-[760px]`), cắt cụt Unit 2, 3, 4.
   - Nghịch lý 34 cú chạm/bài học thay vì 0-click, thiếu auto-advance.
   - Mobile hoàn toàn không có ảnh minh họa từ vựng (chữ trần trụi), Web 404 ảnh seed.
   - Bài tập về nhà bắt gõ phím viết luận tiếng Anh trong `<textarea>` trên điện thoại.
   - Tuyên bố giáo điều "English Immersion 100%" (xóa tiếng Việt ở migration 0017, biến "lizard" thành "a small animal with scaly skin").
4. **Phần II: Phần cứng yếu, Mạng chập chờn & Khả năng sinh tồn (Hardware & Network Resilience)**:
   - File ảnh 1.04MB decode trực tiếp trên main thread của máy 2GB RAM.
   - Lỗi rò rỉ AudioContext (`new AudioContext()` không đóng) gây liệt mic sau 3-6 lần thử.
   - Thu âm 2 chạm không có VAD/timeout, ép React re-render 60fps làm nóng máy và ngốn pin.
   - Chuỗi trễ phát âm 5 chặng (2.5 - 5.0 giây/từ).
   - Treo chết (Deadlock) HTTP 422 của Azure STT khi phòng trọ ồn ào (không tăng attempts, giam lỏng trẻ không cho Skip).
   - Cơ chế chấm điểm ảo ru ngủ (fake score 85-99 điểm `Math.random()`) trên Mobile khi rớt mạng.
   - Mất sạch tiến độ bài học khi mạng rớt ở cuối bài (lỗi bị nuốt bởi console.warn, không có offline queue).
   - Lỗi logic khoá vĩnh viễn bài học Lesson 2+ trên Mobile (`is_unlocked ?? order_index === 1`).
5. **Phần III: Kênh kết nối phụ huynh công nhân (Parent Loop) — Vòng lặp bị bỏ rơi**:
   - Mobile: 0% tính năng phụ huynh.
   - Web: Dashboard tiếng Anh phức tạp, bắt đăng nhập email, bảng điểm chi tiết kèm dấu X đỏ gây áp lực tâm lý.
   - Mô hình đề xuất "1 chạm 5 giây" qua Zalo Bot / tin nhắn trực quan ngắn gọn kèm trích đoạn âm thanh giọng con đọc.
6. **Phần IV: Bảng ma trận Gap Analysis (Hiện trạng code vs Thực tế hiện trường vs Giải pháp kỹ thuật)**:
   - Bảng đối chiếu toàn diện từng tính năng, chỉ rõ file code, dòng code, hành vi hiện tại, thực tế hiện trường và giải pháp.
7. **Phần V: Kế hoạch hành động kỹ thuật (Action Plan & Prioritization)**:
   - **P0 (Khẩn cấp)**: Sửa ngay để cứu sống trải nghiệm và tránh tê liệt app (AudioContext leak, 422 deadlock & skip fix, bỏ fake score, fix bug khoá bài mobile, sửa vỡ layout bản đồ 360px, thêm ảnh cho mobile player, bảo vệ nút logout).
   - **P1 (Quan trọng)**: Tự động chuyển bài (0-click auto-advance), VAD auto-stop 3s, hạ ngưỡng điểm Azure và bỏ Prosody/Fluency cho trẻ nhỏ, Việt hóa chỉ dẫn & audio hướng dẫn tiếng Việt, nén ảnh 1MB xuống <40KB, offline queue.
   - **P2 (Nâng cao)**: Tích hợp Zalo Bot 1 chạm 5s, đổi hình thức bài tập viết sang chụp ảnh vở ô ly / voice note, tối ưu animation trên máy yếu.
8. **Lời kết & Tuyên ngôn hành động**.

## Output Path
Save the report directly to:
`/Users/phihongthai/tcbs/my-project/GreenLeaf/docs/audit_suburban_worker_families_fit.md`

Then write your handoff report to:
`/Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/worker_audit_writer_1/handoff.md`
And message the orchestrator when completed.


## 2026-10-16T21:49:54Z
You are Worker Audit Author (worker_audit_writer_1).
Working directory: /Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/worker_audit_writer_1/
Read dispatch instructions at: /Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/worker_audit_writer_1/DISPATCH.md
Read the authoritative user request at: /Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/ORIGINAL_REQUEST.md

Read the 3 explorer reports:
1. /Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/explorer_web_1/handoff.md
2. /Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/explorer_mobile_1/handoff.md
3. /Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/explorer_player_1/handoff.md

Your exclusive task:
Author the comprehensive master audit report and action plan for GreenLeaf and save it to:
/Users/phihongthai/tcbs/my-project/GreenLeaf/docs/audit_suburban_worker_families_fit.md
