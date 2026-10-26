# Dispatch for Audit Report Refiner (worker_audit_refiner_1)

## Mission
Refine `/Users/phihongthai/tcbs/my-project/GreenLeaf/docs/audit_suburban_worker_families_fit.md` by addressing the exact feedback from Reviewer 2.

## Inputs to Read First
1. Target document: `/Users/phihongthai/tcbs/my-project/GreenLeaf/docs/audit_suburban_worker_families_fit.md`
2. Reviewer 2 Report: `/Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/reviewer_audit_2/handoff.md`
3. Mandatory Integrity Warning:
   > DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Exact Tasks
1. **Fix the 3 style violations (Anti-AI negative parallelism / 'không phải X mà là Y')**:
   - **Line 135 (or around there)**:
     - Replace: `Xóa bỏ tiếng mẹ đẻ trong các định nghĩa cơ bản này không phải là phương pháp giáo dục hiện đại. Đó là sự áp đặt phi lý, biến đứa trẻ thành con vẹt nhại lại âm thanh mà không hiểu bản chất sự vật.`
     - With: `Xóa bỏ tiếng mẹ đẻ trong các định nghĩa cơ bản này là sự áp đặt phi lý. Nó biến đứa trẻ thành con vẹt nhại lại âm thanh mà không hiểu bản chất sự vật.`
   - **Line 305 (or around there)**:
     - Replace: `Thay vì cảm thấy tự hào và yên tâm, họ rơi vào trạng thái hoang mang, tự ti và nghi ngờ năng lực của con mình.`
     - With: `Những con số thấp lè tè cùng hàng loạt dấu đỏ khiến người cha người mẹ hoang mang, tự ti và nghi ngờ năng lực của con mình.`
   - **Line 316 (or around there)**:
     - Replace: `Đó là sự gắn kết thực chất, không phải những bảng biểu số liệu vô hồn trên màn hình máy tính.`
     - With: `Đó là sự gắn kết thực chất, có da có thịt giữa gia đình và nhà trường.`

2. **Incorporate the 5 operational risk mitigations from Reviewer 2 into Part IV (Matrix) and Part V (Action Plan)**:
   - **Chi phí & quyền riêng tư Zalo**: Ghi rõ chi phí ZNS/Zalo OA; yêu cầu phụ huynh quét mã Zalo cấp quyền một lần tại trung tâm; mã hóa đường dẫn audio gửi qua Zalo bằng URL có chữ ký hết hạn sau 24 giờ (signed URL with 24h TTL) để bảo vệ quyền riêng tư của trẻ em.
   - **Thuật toán VAD trong phòng trọ ồn ào**: Bổ sung bộ lọc chống ồn phần cứng (`noiseSuppression: true`) khi mở audio stream; đặt thời gian ngắt cứng 4 giây để phòng trường hợp tiếng quạt cây và mưa gõ mái tôn fibro-xi măng làm tê liệt VAD.
   - **Chống điểm giả khi hạ ngưỡng Azure**: Yêu cầu kiểm tra khớp tối thiểu phụ âm chính của từ để tránh việc tạp âm phòng trọ hoặc tiếng tivi phòng bên đạt điểm 65 ảo.
   - **Nén ảnh bài tập về nhà**: Bắt buộc nén ảnh chụp trang vở xuống dưới 200KB (định dạng WebP/JPEG chất lượng 70%) trước khi nộp lên Supabase Storage; thiết kế giao diện chấm nhanh theo mẻ (batch review) cho giáo viên để không làm quá tải giáo viên và tránh cạn kiệt dung lượng storage.
   - **Đồng bộ ngoại tuyến tuần tự**: Bổ sung cơ chế đồng bộ tuần tự (Sequential Queue) có giãn cách (exponential backoff) để tránh nghẽn mạng cục bộ và tràn bộ nhớ máy rẻ khi có mạng trở lại.

Write your handoff report to:
`/Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/worker_audit_refiner_1/handoff.md`
And message the orchestrator when completed.

## 2026-10-16T22:01:52Z
You are Worker Audit Refiner (worker_audit_refiner_1).
Working directory: /Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/worker_audit_refiner_1/
Read dispatch instructions at: /Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/worker_audit_refiner_1/DISPATCH.md
Read the target document: /Users/phihongthai/tcbs/my-project/GreenLeaf/docs/audit_suburban_worker_families_fit.md
Read reviewer 2 report at: /Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/reviewer_audit_2/handoff.md

Your task:
Refine /Users/phihongthai/tcbs/my-project/GreenLeaf/docs/audit_suburban_worker_families_fit.md:
1. Fix the 3 style violations (lines ~135, ~305, ~316) using the exact replacements provided in DISPATCH.md.
2. Incorporate the 5 operational risk mitigations into Part IV (Matrix) and Part V (Action Plan).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. An auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

When finished, write your handoff report to:
/Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/worker_audit_refiner_1/handoff.md
and send a completion message to the orchestrator (conversation ID da0977c8-4c50-42f5-ae13-8492e62bdf27).
