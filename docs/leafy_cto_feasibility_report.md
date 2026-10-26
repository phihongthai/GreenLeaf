# BÁO CÁO PHẢN HỒI KỸ THUẬT & ĐÁNH GIÁ TÍNH KHẢ THI (LEAFY EDTECH)

- **Người gửi:** Kan / Thái (Technical Lead)
- **Người nhận:** Lyn (CEO / Product & Commercial)
- **Dự án:** GreenLeaf English Academy Monorepo
- **Thời điểm:** 24/10/2026
- **Trang HTML xem trực quan / In PDF:** [`docs/leafy_cto_feasibility_report.html`](file:///Users/phihongthai/tcbs/my-project/GreenLeaf/docs/leafy_cto_feasibility_report.html) hoặc [`Downloads/leafy_cto_feasibility_report.html`](file:///Users/phihongthai/Downloads/leafy_cto_feasibility_report.html)

---

## 00. Tóm lược điều hành (Executive Summary)

1. **Gate 1 đã hoàn thành 95% trong codebase thực tế:** Khác với bảng dự thảo để ngỏ tiến độ, hệ thống Web Next.js 14 đã chạy live trên Vercel ([green-leaf-snowy.vercel.app](https://green-leaf-snowy.vercel.app)), Native Mobile App (React Native Expo 52) đã tích hợp đầy đủ LMS, bản đồ Duolingo, cây tiến trình, đổi hộp quà Mystery Box và ký số HMAC bảo mật.
2. **Chi phí hạ tầng cứng tối thiểu là ~17,6 triệu ₫/năm:** Không thể tính bằng 0₫. Supabase Pro ($25/tháng) và Vercel Pro ($20/tháng) là bắt buộc để không bị pause database và đảm bảo SLA. Cộng thêm Apple Developer ($99/năm), Google Play Console ($25) và Domain.
3. **Chi phí biến đổi AI Speaking khoảng ~28 ₫ / lượt chấm (Azure Speech):** 1 học sinh luyện 20 ngày/tháng tốn ~9.000 – 12.000 ₫. Bắt buộc đặt trần Hard Quota 20 lượt/ngày để chặn việc học sinh spam làm âm lợi nhuận.
4. **Bẫy hòa vốn "30 tài khoản × 1 triệu = 30 triệu/năm":** Số tiền này chỉ vừa đủ trả tiền thuê server và API bên thứ ba (~22 triệu). Hoàn toàn chưa có 1 đồng nào trả công lập trình, sản xuất bài giảng hay vận hành.

---

## 01. Bảng đối chiếu: Giả định Dashboard vs. Codebase Thực tế

| Phân hệ / Nghiệp vụ | Giả định trong Dashboard của CEO | Thực tế trong Codebase GreenLeaf | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Web App Quản lý & Học tập** | Chưa rõ tiến độ, cần demo xác nhận | Next.js 14 App Router, live trên Vercel. Đầy đủ LMS giáo viên, phụ huynh, học sinh. | **Done (Live)** |
| **Mobile App Học sinh** | Chờ quyết định phạm vi | Native 100% (React Native / Expo 52), State Machine nạp RAM độ trễ 0ms, đã có Xcode project. | **Done (Native)** |
| **AI Speaking & Feedback** | Tùy chọn tương lai (Gate 2) | Đã tích hợp xong Azure Speech (chấm phoneme) + Gemini (feedback) + ký số HMAC. | **Tích hợp xong** |
| **Thưởng Lá & Mystery Box** | Chưa đề cập chi tiết | Đã xong logic tích lá, chuỗi Streak, đổi quà an toàn qua Database Transaction & Admin duyệt. | **Done** |
| **Mầm non (Preschool B2B)** | Dùng chung nền tảng lõi | Chưa có UI cảm ứng kéo thả riêng cho trẻ 3-5 tuổi, chưa có kiến trúc Multi-tenant tách trường. | **Chưa làm** |
| **B2C (IELTS / SAT / HSA)** | Dùng chung nền tảng lõi | Chưa có cổng thanh toán, chưa có module thi thử tính giờ (Mock test) và quản lý gói mua. | **Chưa làm** |

---

## 02. Phản hồi dứt điểm 8 câu hỏi Checklist giao CTO

### 1. Kiến trúc hiện tại và module đã hoàn thành
- **Frontend:** Web App (Next.js 14) + Mobile App Native (React Native 0.86 / Expo 52).
- **Backend:** Supabase Cloud (PostgreSQL 20 migrations, Row Level Security, Auth tài khoản học sinh không cần email thật).
- **Cơ chế chống gian lận (Zero-Trust):** Kết quả chấm điểm Azure AI được ký số HMAC SHA-256 từ server, client không thể sửa điểm gửi lên để nhận thưởng.

### 2. Chi phí Cloud / Database thực tế (Bắt buộc phải tính)
- **Supabase Pro Tier:** 25 USD/tháng (~625.000 ₫/tháng = **7,5 triệu ₫/năm**). Gói Free tự động pause database sau 7 ngày không dùng, bắt buộc lên Pro khi chạy pilot.
- **Vercel Pro Tier:** 20 USD/tháng (~500.000 ₫/tháng = **6,0 triệu ₫/năm**) để đảm bảo SLA và băng thông.
- **Apple Developer:** 99 USD/năm (**~2,5 triệu ₫/năm**) để đưa app lên TestFlight/App Store.
- **Google Play Console:** 25 USD một lần (**~630.000 ₫**).
- **Domain & SSL:** **~500.000 ₫/năm**.
- **Tổng chi phí hạ tầng cứng năm đầu:** **17.630.000 ₫/năm** (khoảng ~1,47 triệu ₫/tháng cố định).

### 3. Giả định tài nguyên theo quy mô (MAU)
- **100 – 1.000 MAU (Pilot nội bộ):** Nằm trọn trong gói Supabase Pro ($25) + Vercel Pro ($20). Chi phí hạ tầng cứng ~1,15 triệu ₫/tháng.
- **10.000 MAU (B2B 10-20 trường):** Nâng cấp Compute DB Postgres (thêm $60/tháng) + chi phí băng thông tải ảnh/audio. Tổng hạ tầng cứng: ~3,5 – 4,5 triệu ₫/tháng.
- **50.000 MAU (B2C đại trà):** Cần kiến trúc Read-Replica, CDN riêng Cloudflare R2 cho audio/ảnh và Redis cache cho Leaderboard/Streak. Tổng hạ tầng cứng: ~15 – 25 triệu ₫/tháng.

### 4. Chi phí AI Speaking theo phút/lượt & Quota kiểm soát
- **Đơn giá Azure Speech:** ~1,00 USD / giờ audio. Một câu nói 3-5 giây tốn ~0,0011 USD = **~28 ₫ / lượt chấm**.
- **Đơn giá Google Gemini:** **~5 ₫ / lần** phân tích và nhận xét sư phạm.
- **Mức tiêu thụ 1 học sinh:** 1 bài (15 lượt thu âm) = ~450 ₫. Học 20 ngày/tháng = **~9.000 – 12.000 ₫ / học sinh / tháng**.
- **Quy tắc kỹ thuật:** Bắt buộc áp dụng trần trần **20 lượt chấm AI/ngày/tài khoản** để tránh học sinh spam làm đội chi phí.

### 5. Chi phí lưu trữ và truy xuất Audio / Video
- **Giải pháp hiện tại:** File ghi âm gửi lên Azure AI dạng luồng nhị phân (in-memory stream) rồi giải phóng RAM, **không lưu file âm thanh thô vào ổ cứng**. Chi phí lưu trữ âm thanh hiện tại là **0 ₫**.
- **Nếu bắt buộc lưu audio để phụ huynh nghe lại:** 1.000 học sinh × 15 câu/ngày = 450.000 file audio/tháng (~22 GB/tháng). Bắt buộc áp dụng chính sách: **Tự động xóa file audio sau 30 ngày**.

### 6. Ước tính giờ công phát triển & Bảo trì
- **Gate 1 (Hoàn thiện Pilot trung tâm):** **40 – 60 giờ** (test thực tế trên máy học sinh, đóng gói bản build TestFlight).
- **Gate 2 (Mầm non / Engine mới):** **120 – 160 giờ** (thiết kế UX kéo thả, âm thanh một chạm cho trẻ 3-5 tuổi).
- **Gate 3 (B2B Multi-tenancy & B2C Payment):** **250 – 350 giờ** (viết lại cấu trúc database tách trường, tích hợp cổng thanh toán).
- **Bảo trì định kỳ:** **15 – 20 giờ / tháng** (nâng cấp SDK iOS/Android, vá bảo mật, theo dõi uptime).

### 7. Phân tách phần dùng chung (Core) và phần riêng cho B2B / B2C
- **Dùng chung 100%:** Engine chấm điểm Azure AI, Token ký số HMAC, hạ tầng Auth & Quản lý User cơ bản, luồng bài học (Missions), hạ tầng Vercel & Supabase.
- **Bắt buộc viết riêng:**
  - *Mầm non:* Toàn bộ giao diện chạm/kéo thả, loại bỏ bài tập gõ chữ (Writing).
  - *B2B Mầm non:* Kiến trúc Multi-tenancy (cô lập dữ liệu giữa các trường), dashboard báo cáo cho hiệu trưởng.
  - *B2C:* Cổng thanh toán tự động, phòng thi thử IELTS/SAT tính giờ (Mock test).

### 8. Đề xuất Scope tối thiểu (MVP) & Tiêu chí nghiệm thu Pilot
- **Scope Pilot:** Thử nghiệm 100% trong nội bộ học sinh và giáo viên thật của **Trung tâm GreenLeaf**. Chưa mở bán bên ngoài.
- **Tiêu chí nghiệm thu Gate 1:**
  1. Tỷ lệ hoàn thành bài tập về nhà đạt **≥ 70%**.
  2. Tỷ lệ lỗi kỹ thuật (không ghi âm được, rớt mạng) **< 2%**.
  3. Đo lường chính xác chi phí AI thực tế trên đầu học sinh duy trì **< 15.000 ₫/tháng**.
  4. Giáo viên xác nhận app giúp giảm ít nhất **50% thời gian** nghe chấm phát âm thủ công.

---

## 03. Ba điểm bẫy kinh doanh cần thống nhất dứt điểm

1. **Bẫy hòa vốn "30 tài khoản × 1 triệu = 30 triệu/năm":**  
   Tiền thuê server cứng (Apple, Google, Supabase, Vercel, Domain) đã là 17,6 triệu ₫. Thêm tiền API AI cho 30 học sinh tốn ~4 triệu ₫. Doanh thu 30 triệu chỉ vừa khít bù tiền trả cho nhà cung cấp điện toán đám mây. Chưa có 1 đồng nào tính cho công phát triển phần mềm, sản xuất giáo trình bài giảng, marketing hay chăm sóc khách hàng.
2. **Cạm bẫy "Một nền tảng ôm tất cả" (In-house + Mầm non B2B + B2C IELTS):**  
   Học sinh mầm non 3-5 tuổi cần giao diện chạm, âm thanh lớn; còn người luyện thi IELTS/SAT cần phân tích ngữ pháp, đọc hiểu văn bản dài và thi áp lực thời gian. Cố gom cả 3 vào một ứng dụng ngay lúc này sẽ làm phình to scope và khiến app trở nên nửa vời.
3. **Thứ tự ưu tiên chuẩn mực:**  
   Chạy mượt tại chính trung tâm GreenLeaf để lấy dữ liệu thực tế chứng minh cho phụ huynh và đối tác trước khi đem đi chào bán B2B.

---

## 04. Kế hoạch hành động 30 ngày tới (Action Plan)

- **Việc của Lyn (Product & Vận hành):**
  1. Nhập liệu 20 bài học mẫu trên giao diện giáo viên.
  2. Chọn ra 1 - 2 lớp học thật tại trung tâm (15 – 30 học sinh) để chạy thử nghiệm.
  3. Đăng ký pháp nhân doanh nghiệp để mở tài khoản Apple Developer Organization (cần mã số D-U-N-S).
- **Việc của Kan (Kỹ thuật):**
  1. Nâng cấp Supabase lên gói Pro ($25) để bật sao lưu hàng ngày và chống pause database.
  2. Cài đặt Hard Quota trần 20 lượt gọi AI Speaking/ngày/học sinh.
  3. Xuất file cài đặt TestFlight iOS / APK Android nội bộ cho 30 học sinh tham gia pilot.
