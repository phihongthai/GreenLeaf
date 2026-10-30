# GreenLeaf English Academy — Web App

Phần mềm quản trị và học tiếng Anh của Trung tâm Anh ngữ GreenLeaf (*"Grow Beyond"*): AI Pronunciation, Homework Writing, Reward System & Mystery Box, Teacher Resource Library, Parent Dashboard, Learning Journey. Xem tài liệu yêu cầu gốc tại [`../docs`](../docs).

- **Production URL**: [https://green-leaf-snowy.vercel.app](https://green-leaf-snowy.vercel.app)
- **Repo**: [github.com/hongthaiphi/GreenLeaf](https://github.com/hongthaiphi/GreenLeaf)

⚠️ **Nguyên tắc English Immersion**: Toàn bộ giao diện người dùng, nội dung bài học, feedback gợi ý của AI (Gemini), và nghĩa giải thích từ vựng đều sử dụng **tiếng Anh 100%**. Đây là quyết định sư phạm cốt lõi đã được chốt (không tự ý đưa lại tiếng Việt vào app). Tài liệu nội bộ dành cho team lập trình (README này, `CLAUDE_SESSION.md`, `docs/`) được duy trì bằng tiếng Việt.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

- **Frontend & Server**: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS
- **Cơ sở dữ liệu & Xác thực**: Supabase (PostgreSQL + Row Level Security + Supabase Auth + Supabase Storage)
- **AI Chấm phát âm**: Microsoft Azure AI Speech Service (Pronunciation Assessment phoneme-level, Speech-to-Text, Text-to-Speech)
- **AI Sư phạm**: Google Gemini Pro (phân tích lỗi phát âm và tạo gợi ý học tập bằng tiếng Anh)
- **Hình ảnh từ vựng**: Unsplash Developers API (cache nội bộ vào Supabase Storage)
- **Đóng gói ứng dụng di động**: Capacitor 8 (`@capacitor/ios`, `@capacitor/cli`) hỗ trợ xuất gói native iOS từ web build

---

## 🚀 Cài đặt & Khởi chạy (Local Development)

### 1. Cấu hình biến môi trường (`.env.local`)

Tạo file `.env.local` từ mẫu `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

AZURE_SPEECH_KEY=<your-azure-speech-key>
AZURE_SPEECH_REGION=southeastasia

GEMINI_API_KEY=<your-gemini-api-key>
UNSPLASH_ACCESS_KEY=<your-unsplash-access-key>

# Tuỳ chọn URL server cho Capacitor (mặc định trỏ về Vercel production)
CAPACITOR_SERVER_URL=https://green-leaf-snowy.vercel.app
```

### 2. Cài đặt thư viện & Chạy dev server

```bash
cd app
npm install
npm run dev
```

Server sẽ lắng nghe tại `http://localhost:3000` (hoặc `http://0.0.0.0:3000` để các thiết bị trong mạng LAN truy cập thử nghiệm).

### 3. Build & Kiểm tra lỗi kiểu dữ liệu

```bash
rm -rf .next && npx tsc --noEmit
npm run build
```

---

## 🗄️ Supabase Migrations (0001 → 0020)

Toàn bộ bảng, hàm và storage bucket của GreenLeaf sử dụng tiền tố `greenleaf_` để không bị trùng lặp khi chia sẻ chung Supabase project:

1. `supabase/migrations/0001_init.sql` — Schema khởi tạo (`greenleaf_profiles`, `greenleaf_grades`, `greenleaf_missions`, `greenleaf_rewards`...) + RLS cơ bản.
2. `supabase/migrations/0002_seed_missions.sql` — Dữ liệu demo ban đầu cho 4 cấp độ.
3. `supabase/migrations/0003_storage.sql` — Bucket `greenleaf-resources` lưu tài liệu giáo viên.
4. `supabase/migrations/0004_lessons.sql` — Bảng `greenleaf_lessons` (1 cấp độ có nhiều bài học, mỗi bài có 3 nhiệm vụ cố định), cấp quyền ghi cho giáo viên.
5. `supabase/migrations/0005_writing_topics.sql` — Thư viện đề bài viết `greenleaf_writing_topics` dùng lại nhiều lần.
6. `supabase/migrations/0006_mission_attempts.sql` — Bảng `greenleaf_mission_attempts` log toàn bộ lịch sử thử bài của học sinh (INSERT-only).
7. `supabase/migrations/0007_fix_rewards_rls.sql` — Cập nhật policy RLS cho bảng phần thưởng.
8. `supabase/migrations/0008_student_accounts.sql` — Thêm cột `username` vào `greenleaf_profiles` để hỗ trợ tạo tài khoản học sinh không cần email.
9. `supabase/migrations/0009_more_lessons.sql` — Seed thêm 40 bài học phong phú (10 bài/cấp độ), an toàn khi chạy lại (idempotent).
10. `supabase/migrations/0010_tts_audio_cache.sql` — Bucket `greenleaf-tts-cache` lưu cache âm thanh phát âm mẫu theo hash nội dung.
11. `supabase/migrations/0011_word_meanings.sql` — Bổ sung cột nghĩa từ vựng `meaning`.
12. `supabase/migrations/0012_mission_attempt_item_label.sql` — Thêm cột `item_label` lưu chi tiết từ/câu luyện tại thời điểm ghi âm.
13. `supabase/migrations/0013_phonics_line_images.sql` — Nâng cấp các dòng câu Phonics thành mảng object chứa hình ảnh riêng cho từng câu.
14. `supabase/migrations/0014_kindergarten_phonics_one_syllable.sql` — Đơn giản hóa nội dung bài học mầm non về từ đơn âm tiết.
15. `supabase/migrations/0015_image_cache_bucket.sql` — Bucket `greenleaf-images` cache ảnh từ Unsplash.
16. `supabase/migrations/0016_fix_images_bucket_policy.sql` — **Vá bảo mật**: gỡ bỏ policy INSERT công khai trên bucket `greenleaf-images`.
17. `supabase/migrations/0017_word_meanings_english.sql` — Bản địa hóa nghĩa của 220 từ vựng sang tiếng Anh chuẩn mực (English immersion).
18. `supabase/migrations/0018_mystery_box.sql` — **Mystery Box**: Role `admin`, bảng `greenleaf_mystery_box_requests` (tối đa 1 request pending/học sinh), hàm transaction `greenleaf_confirm_mystery_box` trừ 100 lá an toàn, thu hồi quyền update trực tiếp leaf từ client.
19. `supabase/migrations/0019_teacher_controlled_lessons.sql` — cột `greenleaf_lessons.is_unlocked`: giáo viên chủ động mở/khoá từng bài (mặc định chỉ bài số 1 mở).
20. `supabase/migrations/0020_atomic_leaves.sql` — các hàm SQL atomic (`greenleaf_add_leaves`, `greenleaf_update_streak`, `greenleaf_record_progress`, `greenleaf_claim_lesson_bonus`, chỉ `service_role` gọi được) chống cộng Leaf trùng khi request đến song song. ⚠️ **Phải chạy 0020 trước/đồng thời với deploy code** vì `lib/rewards.ts` gọi các hàm này.

⚠️ **Lưu ý triển khai**: Bắt buộc chạy đầy đủ các migration từ `0001` đến `0020` theo đúng thứ tự.

---

## 🔒 Cơ chế Bảo mật & Xác thực (Unified Auth & Anti-Cheat)

### 1. Xác thực Hợp nhất (Unified Auth Helper - `lib/auth.ts`)
Hệ thống API backend hỗ trợ song song 2 cơ chế xác thực:
- **Web App**: Xác thực phiên dựa trên cookie phiên của Supabase (`@supabase/ssr`).
- **Mobile App & API Clients**: Xác thực qua Bearer Token trên header `Authorization: Bearer <access_token>`.

### 2. Chống Gian lận Điểm số (Score Signing - `lib/assessToken.ts`)
- Khi Azure AI hoàn thành chấm điểm phát âm tại `/api/assess`, máy chủ sẽ tạo chữ ký HMAC chứa cặp giá trị `(referenceText, overallScore)` và đính kèm vào trường `token`.
- Khi client gọi `/api/missions/complete`, máy chủ giải mã và xác thực token. Nếu điểm số bị client sửa đổi, yêu cầu cộng lá sẽ bị từ chối ngay lập tức.

### 3. Bảo vệ Số dư Lá (Leaf Protection)
- Client không có quyền `UPDATE` trực tiếp bảng `greenleaf_rewards` (đã thu hồi tại migration `0018`).
- Mọi thao tác cộng/trừ lá đều được thực hiện qua Service Role hoặc stored procedure có kiểm soát transaction nghiêm ngặt.

---

## 📱 Đóng gói Ứng dụng Di động bằng Capacitor (iOS)

Ngoài phiên bản Native Mobile thuần (ở thư mục `mobile/`), thư mục `app/` còn được cấu hình sẵn **Capacitor 8** để xuất gói iOS cho web app:

```bash
# Đồng bộ thay đổi web sang dự án iOS Capacitor
npm run cap:sync

# Mở dự án trong Xcode để chạy máy ảo hoặc cắm cáp nạp vào iPhone
npm run cap:open
```

File cấu hình [`capacitor.config.ts`](file:///Users/phihongthai/tcbs/my-project/GreenLeaf/app/capacitor.config.ts) trỏ trực tiếp đến production URL trên Vercel, đảm bảo trải nghiệm đồng nhất với phiên bản web mới nhất.

---

## ⚡ Tối ưu Hóa Hiệu năng & Trải nghiệm Người dùng

- **Batch Queries & Caching**: Tối ưu hóa các lượt truy vấn danh sách bài học và tiến độ học tập bằng cách gom truy vấn và sử dụng in-memory cache tạm thời.
- **TTS Audio Caching**: Âm thanh phát âm mẫu được lưu trữ trong bucket `greenleaf-tts-cache` theo mã hash `(text + rate + voice)`, giảm thiểu số lần gọi API của Azure và giảm độ trễ khi học sinh nghe lại từ.
- **Audio Overlap Fix**: Xử lý triệt để hiện tượng âm thanh phát đè lên nhau khi học sinh thao tác nhanh giữa các câu hoặc khi bật ghi âm.
- **Procedural Background Music**: Nhạc nền trang chủ học sinh được tổng hợp trực tiếp bằng Web Audio API với dung lượng 0KB, tự động ngắt khi học sinh rời trang hoặc mở mic thu âm.

---

## 📂 Danh mục Thành phần Chính (Key Components)

- `components/missions/`: Giao diện 3 nhiệm vụ luyện phát âm (`WordsExplorer`, `PhonicsChant`, `SpeakingChallenge`) và các màn giới thiệu, chuyển tiếp, chúc mừng nhận thưởng.
- `components/mascot/Leafy.tsx`: Linh vật chú sóc Leafy chính thức với trọn bộ biểu cảm sinh động bằng ảnh WebP.
- `components/student/MysteryBox.tsx`: Giao diện hộp quà bí mật trên trang chủ học sinh (khóa/mở khóa/gửi yêu cầu đổi quà).
- `components/student/BottomTabBar.tsx`: Thanh điều hướng cố định 4 mục (Learn, Journey, Homework, Profile) cho học sinh.
- `components/tree/LearningJourneyTree.tsx`: Bản đồ tăng trưởng cây học tập 5 chặng.
- `components/teacher/LessonForm.tsx`: Trình tạo và biên tập bài học trực quan cho giáo viên.
- `app/admin/mystery-box/page.tsx`: Giao diện dành riêng cho quản trị viên tại trung tâm duyệt đổi quà.

---

## 📋 Hạng mục Cần Lưu ý & Hoàn thiện Tiếp theo

- **Dọn dẹp mã nguồn cũ**: `components/mascot/BraveMascot.tsx` đã được thay thế hoàn toàn bằng `Leafy.tsx`, có thể xoá bỏ an toàn.
- **Tự đổi mật khẩu**: Bổ sung tính năng cho phép học sinh/phụ huynh tự đổi mật khẩu cá nhân tại màn hình Profile (hiện giáo viên có thể đặt lại giúp tại `/teacher/accounts`).
- **Giám sát Quota**: Thiết lập cảnh báo chủ động khi mức tiêu thụ Azure Speech hoặc Google Gemini tiến gần đến hạn mức dịch vụ.
- **Viết kiểm thử tự động**: Bổ sung Unit Test cho logic cộng lá (`lib/rewards.ts`) và xác thực HMAC token (`lib/assessToken.ts`).
