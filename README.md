# GreenLeaf English Academy — Monorepo

Hệ thống phần mềm quản lý và hỗ trợ học tiếng Anh đa nền tảng cho học sinh, giáo viên, phụ huynh và quản trị viên của Trung tâm Anh ngữ **GreenLeaf** (*"Grow Beyond"*).

- **Web App (Next.js 14)**: [https://green-leaf-snowy.vercel.app](https://green-leaf-snowy.vercel.app)
- **Native Mobile App (Expo SDK 52 / React Native)**: Ứng dụng di động Native 100% cho iOS và Android
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Auth, Storage)
- **AI Services**: Azure AI Speech Service (chấm điểm phát âm phoneme-level, TTS) + Google Gemini (feedback sư phạm tiếng Anh) + Unsplash API (hình ảnh minh họa)

---

## 📌 Các nguyên tắc thiết kế quan trọng

1. **English Immersion (Nội dung & Giao diện ứng dụng)**: Toàn bộ giao diện học sinh, giáo viên, phụ huynh, phản hồi AI của Gemini và nghĩa từ vựng đều sử dụng **tiếng Anh 100%**. Đây là quyết định thiết kế cốt lõi đã được chốt (không tự ý đưa lại tiếng Việt vào app).
2. **Tài liệu kỹ thuật nội bộ bằng tiếng Việt**: Mọi tài liệu kỹ thuật dành cho nhóm phát triển (README, docs trong thư mục `docs/`, `CLAUDE_SESSION.md`) được viết bằng tiếng Việt để thuận tiện làm việc và bàn giao.
3. **Bảo mật điểm số và phần thưởng (Zero-Trust Client)**:
   - Client không thể tự gửi điểm số tùy ý để nhận thưởng. Điểm số phát âm từ Azure STT được ký số HMAC ở máy chủ (`signAssessResult`) và bắt buộc phải gửi kèm token hợp lệ khi gọi API hoàn thành bài học `/api/missions/complete`.
   - Bảng phần thưởng `greenleaf_rewards` bị chặn hoàn toàn quyền ghi trực tiếp từ client qua Supabase RLS. Mọi thao tác cộng/trừ Leaves đều chạy qua Service Role hoặc Database Transaction an toàn.
4. **Trải nghiệm học không độ trễ (Zero Latency Experience)**:
   - Web App áp dụng batch queries, in-memory caching và prefetch audio/bài học tiếp theo.
   - Mobile App chạy kiến trúc **Client-Driven State Machine** trên React Native thuần (không dùng WebView), nạp toàn bộ bài học vào RAM để chuyển câu và chấm phản hồi tức thì 0ms.

---

## 🏛️ Kiến trúc hệ thống & Cấu trúc thư mục

```
GreenLeaf/
├── app/                  # Web App Next.js 14 App Router + Capacitor iOS
│   ├── app/              # Routes: Student (/grades, /missions), Teacher, Parent, Admin
│   ├── components/       # UI Components (Leafy mascot, Recorder, JourneyTree, MysteryBox, ...)
│   ├── lib/              # Business logic: Azure STT, Gemini, Rewards, Journey, Auth, TTS
│   ├── supabase/         # Migrations (0001 -> 0018) và cấu hình Supabase
│   ├── scripts/          # Script điền ảnh minh họa Unsplash (populate-images.ts)
│   ├── ios/              # Dự án Capacitor iOS build từ Next.js
│   └── capacitor.config.ts
├── mobile/               # Native Mobile App (Expo SDK 52 / React Native 0.86)
│   ├── App.tsx           # Entry point điều hướng 4 tab và Modal Player
│   ├── src/
│   │   ├── screens/      # StudentHome, Journey, Homework, Profile, Login, LessonPlayer
│   │   ├── components/   # AudioRecorderButton, MysteryBox, ScoreDisplay, BottomTabBar
│   │   └── lib/          # Native Audio, Azure Assess client, Supabase client, Theme
│   └── ios/              # Mã nguồn Xcode iOS Native project (CocoaPods/Swift)
├── docs/                 # Tài liệu đặc tả hệ thống và yêu cầu nghiệp vụ
│   ├── Tài Liệu Mô Tả Hệ Thống - GreenLeaf MVP.md # Đặc tả hệ thống chi tiết
│   ├── requirements.md   # Yêu cầu chức năng và phi chức năng
│   ├── tasks.md          # Lộ trình và danh sách tác vụ 10 Phase
│   └── Proposal - Mystery Box Reward system_1.docx # Đề xuất hệ thống hộp quà bí mật
└── CLAUDE_SESSION.md     # Nhật ký theo dõi phiên làm việc và trạng thái dự án
```

---

## 🌟 Các phân hệ & Tính năng cốt lõi

### 1. Phân hệ Học sinh (Student Experience)
- **Trang chủ học tập (Duolingo-style Path)**:
  - Bản đồ bài học trực quan dạng zigzag, hiển thị cấp độ hiện tại, chuỗi ngày học liên tục (Streak 🔥) và số lá tích lũy (Leaves 🍃).
  - Linh vật **Leafy** (chú sóc biểu tượng của GreenLeaf) với nhiều biểu cảm tương tác sinh động (happy, cheer, thinking, oops, winner).
  - Nhạc nền học tập tạo động lực sinh tự động bằng Web Audio API (không tốn băng thông tải file âm thanh).
- **Quy trình luyện nói 3 nhiệm vụ (Missions Workflow)**:
  - **Mission 1: Words Explorer**: 5 từ vựng kèm hình ảnh thực tế (hoặc emoji fallback) và phát âm mẫu chuẩn bản xứ. Ghi âm và chấm phát âm theo từng từ.
  - **Mission 2: Phonics / Sentence Builder**: Luyện đọc từng câu trong bài chant/đoạn văn, highlight âm mục tiêu, chấm phát âm từng dòng.
  - **Mission 3: Speaking Challenge**: Đọc toàn bộ bài chant hoặc đoạn văn bản dài một mạch, chấm điểm tổng hợp và nhận lời khen/thưởng thêm từ Leafy.
- **Hệ thống phần thưởng & Hộp quà bí mật (Mystery Box)**:
  - Tích lũy lá: +1 Leaf khi hoàn thành mission, +5 Leaves khi đạt 100%, +20 Leaves cho chuỗi 7 ngày, +3 Leaves bonus hoàn thành cả bài.
  - Đổi hộp quà bí mật: Khi đạt đủ **100 Leaves**, học sinh có thể gửi yêu cầu đổi Mystery Box trên app. Khi đến trung tâm, quản trị viên (Admin) duyệt yêu cầu trên hệ thống và cho học sinh bốc thăm phần quà thực tế.
- **Hành trình học tập (Learning Journey Tree)**:
  - Cây học tập tăng trưởng theo 5 giai đoạn: **Seed (0)** ➔ **Young Leaf (10)** ➔ **Green Leaf (30)** ➔ **Strong Tree (60)** ➔ **Garden (100)** dựa trên số bài Speaking và Writing hoàn thành.
- **Bài tập về nhà (Homework Writing)**:
  - Xem danh sách bài viết được giao, gõ nội dung bài nộp trực tiếp và xem nhận xét/chấm điểm của giáo viên.

### 2. Phân hệ Giáo viên (Teacher Management)
- **Lesson Authoring**: Tạo mới và chỉnh sửa không giới hạn số lượng bài học cho từng cấp độ (Kindergarten, Kids 1, Kids 2, Teens) với giao diện trực quan, hỗ trợ gắn link ảnh minh họa cho từng câu/từ.
- **Homework Assignment**: Thư viện đề bài viết dùng lại nhiều lần (`greenleaf_writing_topics`), giao bài theo lớp kèm hạn nộp và chấm bài trực tiếp.
- **Student & Parent Accounts**: Tạo trực tiếp tài khoản học sinh/phụ huynh bằng Username/Password không cần email thật (hệ thống tự ánh xạ `@greenleaf.local`), gán phụ huynh ↔ học sinh, đổi mật khẩu và quản lý hồ sơ học sinh.
- **Learning History**: Xem chi tiết lịch sử học tập từng ngày, điểm số từng câu/từ phát âm của từng học sinh.
- **Teacher Resource Library**: Thư viện giáo trình số hóa lưu trữ trên Supabase Storage.

### 3. Phân hệ Phụ huynh (Parent Dashboard)
- Theo dõi tiến độ học tập trực quan của con: tỷ lệ Speaking, bài Writing đã nộp, tổng số Leaves, chuỗi Streak và lịch sử luyện tập chi tiết.

### 4. Phân hệ Quản trị viên (Admin)
- Quản lý và phê duyệt các yêu cầu đổi Hộp quà bí mật (**Mystery Box**), trừ 100 Leaves tự động qua database transaction an toàn.

---

## 🗄️ Cơ sở dữ liệu & Database Migrations

Hệ thống sử dụng **Supabase PostgreSQL** với tiền tố `greenleaf_` để dùng chung database an toàn với các dự án khác:

| Migration | Nội dung chính |
| :--- | :--- |
| `0001_init.sql` | Khởi tạo bảng Users/Profiles, Grades, Missions, Progress, Rewards và RLS ban đầu |
| `0002_seed_missions.sql` | Seed dữ liệu 4 bài học demo đầu tiên cho 4 cấp độ |
| `0003_storage.sql` | Tạo bucket Supabase Storage `greenleaf-resources` |
| `0004_lessons.sql` | Tách bảng `greenleaf_lessons`, cho phép giáo viên tạo nhiều bài học/cấp độ |
| `0005_writing_topics.sql` | Thư viện đề bài viết `greenleaf_writing_topics` tái sử dụng |
| `0006_mission_attempts.sql` | Log toàn bộ lịch sử các lần học sinh ghi âm vào `greenleaf_mission_attempts` |
| `0007_fix_rewards_rls.sql` | Thêm RLS policy cho bảng rewards |
| `0008_student_accounts.sql` | Thêm trường `username`, hỗ trợ giáo viên tạo tài khoản học sinh không cần email |
| `0009_more_lessons.sql` | Seed thêm 40 bài học mới (10 bài/cấp độ) cho toàn hệ thống |
| `0010_tts_audio_cache.sql` | Bucket `greenleaf-tts-cache` lưu cache âm thanh phát âm mẫu |
| `0011_word_meanings.sql` | Thêm trường `meaning` giải thích nghĩa từ vựng |
| `0012_mission_attempt_item_label.sql` | Lưu nhãn từ/câu cụ thể trong từng lượt ghi âm |
| `0013_phonics_line_images.sql` | Nâng cấp cấu trúc câu Phonics thành object có hình ảnh minh họa riêng |
| `0014_kindergarten_phonics_one_syllable.sql` | Đơn giản hóa nội dung bài học mầm non về từ 1 âm tiết |
| `0015_image_cache_bucket.sql` | Bucket `greenleaf-images` lưu cache ảnh tải từ Unsplash |
| `0016_fix_images_bucket_policy.sql` | Vá bảo mật: chặn quyền ghi công khai vào bucket `greenleaf-images` |
| `0017_word_meanings_english.sql` | Chuyển đổi 220 định nghĩa từ vựng sang tiếng Anh chuẩn (English Immersion) |
| `0018_mystery_box.sql` | Role `admin`, bảng `greenleaf_mystery_box_requests`, hàm transaction trừ lá an toàn |

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### 1. Cấu hình biến môi trường (`.env.local` trong `app/`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
AZURE_SPEECH_KEY=<your-azure-speech-key>
AZURE_SPEECH_REGION=southeastasia
GEMINI_API_KEY=<your-gemini-api-key>
UNSPLASH_ACCESS_KEY=<your-unsplash-access-key>
```

### 2. Chạy Web App (`app/`)
```bash
cd app
npm install
npm run dev
```
Truy cập tại `http://localhost:3000`.

### 3. Chạy Mobile App (`mobile/`)
```bash
cd mobile
npm install

# Cách 1: Chạy qua Expo Go trên iPhone/Android
npx expo start

# Cách 2: Chạy Native iOS build (cần máy Mac có Xcode)
npx expo run:ios
```

---

## 📚 Tài liệu chi tiết tham khảo

- [Đặc tả hệ thống GreenLeaf MVP](file:///Users/phihongthai/tcbs/my-project/GreenLeaf/docs/Tài%20Liệu%20Mô%20Tả%20Hệ%20Thống%20-%20GreenLeaf%20MVP.md)
- [Yêu cầu hệ thống (System Requirements)](file:///Users/phihongthai/tcbs/my-project/GreenLeaf/docs/requirements.md)
- [Danh sách tác vụ 10 Phase phát triển (Tasks Backlog)](file:///Users/phihongthai/tcbs/my-project/GreenLeaf/docs/tasks.md)
- [Hướng dẫn kỹ thuật Web App](file:///Users/phihongthai/tcbs/my-project/GreenLeaf/app/README.md)
- [Hướng dẫn kỹ thuật Native Mobile App](file:///Users/phihongthai/tcbs/my-project/GreenLeaf/mobile/README.md)
- [Nhật ký phiên làm việc (Session Tracking)](file:///Users/phihongthai/tcbs/my-project/GreenLeaf/CLAUDE_SESSION.md)
