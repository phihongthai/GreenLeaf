# Trạng thái phiên làm việc — GreenLeaf English Academy

> File này ghi lại trạng thái tại thời điểm dừng, để phiên sau (người hoặc AI khác) tiếp tục mà không cần dò lại từ đầu.  
> Cập nhật lần cuối: **2026-09-30** (Commit mới nhất: `d26b58e` + cập nhật toàn bộ tài liệu kỹ thuật).

---

## 📌 Tổng quan Trạng thái Hiện tại

- Toàn bộ codebase hiện tại sạch sẽ, hoạt động ổn định trên cả 2 nền tảng:
  - **Web App**: Next.js 14 App Router, triển khai live trên Vercel tại [https://green-leaf-snowy.vercel.app](https://green-leaf-snowy.vercel.app).
  - **Native Mobile App**: Expo SDK 52 / React Native 0.86, hỗ trợ chạy trên Expo Go và biên dịch Native Xcode project (`mobile/ios/`).
- Toàn bộ 18 migrations của Supabase (`0001_init.sql` ➔ `0018_mystery_box.sql`) đã được hoàn thiện và triển khai.
- Đã rà soát và cập nhật đồng bộ toàn bộ tài liệu kỹ thuật trong repository:
  - Root [`README.md`](file:///Users/phihongthai/tcbs/my-project/GreenLeaf/README.md) (Tài liệu tổng quan hệ thống toàn dự án).
  - [`docs/Tài Liệu Mô Tả Hệ Thống - GreenLeaf MVP.md`](file:///Users/phihongthai/tcbs/my-project/GreenLeaf/docs/Tài%20Liệu%20Mô%20Tả%20Hệ%20Thống%20-%20GreenLeaf%20MVP.md) (Đặc tả chi tiết các phân hệ tính năng và cấp độ học tập).
  - [`docs/requirements.md`](file:///Users/phihongthai/tcbs/my-project/GreenLeaf/docs/requirements.md) (Yêu cầu chức năng, phi chức năng, bảo mật và đa nền tảng).
  - [`docs/tasks.md`](file:///Users/phihongthai/tcbs/my-project/GreenLeaf/docs/tasks.md) (Lộ trình 10 Phase phát triển và trạng thái từng tác vụ).
  - [`app/README.md`](file:///Users/phihongthai/tcbs/my-project/GreenLeaf/app/README.md) (Tài liệu kỹ thuật chi tiết phân hệ Web App Next.js 14 & Capacitor).
  - [`mobile/README.md`](file:///Users/phihongthai/tcbs/my-project/GreenLeaf/mobile/README.md) (Tài liệu kỹ thuật chi tiết phân hệ Native Mobile App Expo/React Native).
  - [`CLAUDE_SESSION.md`](file:///Users/phihongthai/tcbs/my-project/GreenLeaf/CLAUDE_SESSION.md) (Nhật ký phiên làm việc).

---

## ⚠️ Các Quyết định Thiết kế Cốt lõi Cần Nhớ

1. **English Immersion trong Ứng dụng**: Toàn bộ UI, nội dung bài học, feedback gợi ý của AI (Gemini) và nghĩa từ vựng đều là **tiếng Anh 100%**. Không tự ý dịch ngược lại tiếng Việt trong code giao diện hoặc prompt AI.
2. **Tài liệu Kỹ thuật bằng Tiếng Việt**: Tất cả tài liệu dành cho đội ngũ phát triển (README, docs, nhật ký) duy trì bằng tiếng Việt để dễ dàng bàn giao và làm việc.
3. **Bảo mật Điểm số & Phần thưởng (Zero-Trust Client)**:
   - Điểm số phát âm từ Azure AI được ký số bằng mã băm HMAC ở server (`lib/assessToken.ts`). Client gọi `/api/missions/complete` bắt buộc phải gửi kèm token hợp lệ.
   - Bảng `greenleaf_rewards` bị chặn quyền UPDATE từ client qua RLS. Thao tác cộng/trừ lá chạy hoàn toàn qua Service Role hoặc database transaction `greenleaf_confirm_mystery_box`.
4. **Xác thực Đa kênh (Unified Authentication)**:
   - Helper `lib/auth.ts` hỗ trợ đồng thời Cookie session (cho Web) và Bearer token (cho Mobile App).
   - Học sinh và phụ huynh đăng nhập bằng Username (không cần email thật), hệ thống tự ánh xạ `<username>@greenleaf.local`.

---

## 🔄 Tóm tắt Các Nhóm Thay đổi Lớn (Từ phiên 2026-09-14 đến 2026-09-30)

1. **Hệ thống Hộp quà Bí mật & Phân quyền Admin (`afccfe6`)**:
   - Migration `0018_mystery_box.sql`: Bổ sung role `admin`, bảng `greenleaf_mystery_box_requests` (tối đa 1 request pending/học sinh), hàm Postgres `greenleaf_confirm_mystery_box` trừ 100 lá trong transaction an toàn.
   - Thêm giao diện quản trị `/admin/mystery-box` cho admin tại quầy trung tâm xác nhận đổi quà.
   - Chặn quyền client tự cập nhật số lá và tự đổi vai trò của mình.
2. **Ký số Xác thực Điểm số Chống Gian lận (`512ca5c`)**:
   - Module `lib/assessToken.ts` sinh token HMAC đính kèm kết quả chấm Azure Speech.
   - Chặn client tự gửi số điểm cao tùy ý để nhận lá thưởng.
3. **Tối ưu Hóa Hiệu năng & Capacitor iOS (`3d31953`, `ee7372d`)**:
   - Batch queries và in-memory cache cho dữ liệu bài học và tiến trình.
   - Prefetch âm thanh và bài học tiếp theo.
   - Khắc phục hiện tượng audio overlap khi thao tác nhanh giữa các câu.
   - Cấu hình Capacitor 8 (`@capacitor/ios`) tại `app/capacitor.config.ts`.
4. **Xây dựng Ứng dụng Di động Native Hoàn chỉnh (`565896a` ➔ `d26b58e`)**:
   - Khởi tạo `mobile/` bằng React Native 0.86 và Expo SDK 52.
   - Kiến trúc **Client-Driven State Machine** nạp toàn bộ bài học vào RAM để chuyển câu với độ trễ 0ms.
   - Triển khai đầy đủ 4 tab: Learn (Bản đồ Duolingo, Streak, Leaves, Leafy, Mystery Box), Journey, Homework, Profile.
   - Cấu hình Native Audio: `setAudioModeAsync` cho iOS, ghi âm chuẩn PCM WAV 16kHz mono qua `expo-audio`, phát âm mẫu qua `expo-speech`.
   - Kết nối dữ liệu: Trỏ trực tiếp về Supabase Cloud Production, xác thực Bearer token, chuyển đổi âm thanh Base64 WinterCG an toàn.

5. **Rà soát Bảo mật Toàn diện Dự án (Commit & Push Audit)**:
   - Đã tạo root `.gitignore` ngăn chặn rò rỉ `.env`, `.DS_Store`, keystore, PEM và build files ở thư mục gốc.
   - Đã gỡ bỏ fallback hardcoded URL và Anon Key trong `mobile/src/lib/supabase.ts`, chuyển sang đọc hoàn toàn từ biến môi trường `EXPO_PUBLIC_...`.
   - Đã tạo `mobile/.env.example` làm mẫu cấu hình.
   - Đã xác nhận các API Keys nhạy cảm (`SUPABASE_SERVICE_ROLE_KEY`, `AZURE_SPEECH_KEY`, `GEMINI_API_KEY`, `UNSPLASH_ACCESS_KEY`) không bị hardcode trong source code hay commit history.

---

## 📋 Danh sách Công việc Đề xuất Tiếp theo

1. **Kiểm thử Tự động (Testing)**:
   - Viết Unit Test cho module tính lá và streak (`lib/rewards.ts`), xác thực token (`lib/assessToken.ts`).
2. **Tính năng Tự đổi Mật khẩu**:
   - Bổ sung form đổi mật khẩu cho học sinh/phụ huynh trên màn hình Profile (hiện tại giáo viên có thể đặt lại giúp tại `/teacher/accounts`).
3. **Dọn dẹp Mã nguồn Cũ**:
   - Xóa bỏ component `components/mascot/BraveMascot.tsx` (đã được thay thế hoàn toàn bởi `components/mascot/Leafy.tsx`).
4. **Theo dõi Hạn mức Cloud Services (Monitoring)**:
   - Theo dõi số lượng request Azure Speech Service, Google Gemini API và Supabase Database Storage trên production.
   - Nếu repo là Public, khuyến nghị rotate Supabase anon key trong dashboard do từng commit ở lịch sử cũ (`b68cbc4`).
