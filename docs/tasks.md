# DANH SÁCH TÁC VỤ PHÁT TRIỂN GREENLEAF (DEVELOPMENT TASKS BACKLOG)

Tài liệu này ghi lại chi tiết các giai đoạn và tác vụ phát triển của hệ thống GreenLeaf, phân định rõ những tính năng đã hoàn thành, quyết định kiến trúc và các hạng mục duy trì tiếp theo.

> **Cập nhật ngày:** 2026-09-30  
> **Trạng thái:** Toàn bộ Phase 1 đến Phase 10 đã hoàn thành, kiểm thử thành công và deploy trên Production (Web App trên Vercel, Native Mobile App trên Expo/iOS).

---

## Phase 1: Khởi tạo dự án & Kiến trúc cơ sở dữ liệu (Project Setup & Architecture)
- [x] **Task 1.1: Khởi tạo Repository & Cấu trúc mã nguồn**
  - Setup Next.js 14 App Router + TypeScript + Tailwind CSS tại thư mục `GreenLeaf/app`.
  - Cấu hình ESLint, PostCSS, Prettier.
- [x] **Task 1.2: Thiết kế Cơ sở dữ liệu & Phân quyền Supabase (Database Schema & RLS)**
  - Lựa chọn Supabase (PostgreSQL + Auth + Storage) với tiền tố bảng `greenleaf_` để dùng chung database an toàn.
  - Xây dựng schema ban đầu: `greenleaf_profiles`, `greenleaf_grades`, `greenleaf_lessons`, `greenleaf_missions`, `greenleaf_student_progress`, `greenleaf_rewards`, `greenleaf_reward_events`.
  - Thiết lập các chính sách Row Level Security (RLS) bảo vệ dữ liệu theo vai trò (Student, Teacher, Parent, Admin).
- [x] **Task 1.3: Cấu hình Xác thực (Authentication System)**
  - Tích hợp Supabase Auth với cơ chế middleware Next.js (`middleware.ts`) kiểm soát quyền truy cập theo role.

---

## Phase 2: Phát triển Tính năng Cốt lõi (Core MVP)
- [x] **Task 2.1: Module Chấm phát âm AI (AI Pronunciation Assessment)**
  - Kết nối Microsoft Azure AI Speech Service để chấm điểm phát âm chi tiết (Phoneme, Accuracy, Fluency, Completeness, Prosody).
  - Tích hợp Google Gemini Pro để sinh nhận xét sư phạm bằng tiếng Anh mang tính khích lệ học sinh.
  - Tích hợp Web Speech API và Azure Speech TTS để phát âm mẫu tự nhiên.
- [x] **Task 2.2: Module Bài tập viết (Homework Writing)**
  - Xây dựng Thư viện đề bài viết dùng lại nhiều lần (`greenleaf_writing_topics`).
  - Giao diện nộp bài viết cho học sinh và giao diện chấm bài/nhận xét cho giáo viên.
- [x] **Task 2.3: Module Hệ thống tích lũy lá (Reward System)**
  - Tính toán và tự động cộng Leaf (+1 mission, +5 perfect 100%, +20 streak 7 ngày, +3 bonus bài học).
  - Khắc phục lỗ hổng RLS: chuyển toàn bộ quyền ghi/cộng lá về Service Role an toàn.
- [x] **Task 2.4: Module Thư viện tài liệu giáo viên (Resource Library)**
  - Quản lý tài liệu phân cấp theo giáo trình trên Supabase Storage (`greenleaf-resources`).
- [x] **Task 2.5: Module Quản lý bài học động (Lesson Authoring)**
  - Giao diện cho phép giáo viên tự tạo mới và chỉnh sửa bài học (LessonForm) cho cả 4 cấp độ, không giới hạn số lượng bài.
- [x] **Task 2.6: Module Lịch sử học tập chi tiết (Student History)**
  - Bảng `greenleaf_mission_attempts` ghi nhận từng lần học sinh ghi âm với nhãn từ/câu cụ thể (`item_label`) để giáo viên và phụ huynh theo dõi tiến trình thực tế.
- [x] **Task 2.7: Module Quản lý tài khoản không cần Email (Account Management)**
  - Giáo viên tạo tài khoản học sinh/phụ huynh bằng Username/Password tại `/teacher/accounts`.
  - Tự động quy đổi sang định danh nội bộ `<username>@greenleaf.local` với `email_confirm: true`.
  - Cho phép giáo viên gán phụ huynh ↔ học sinh, sửa tên, đặt lại mật khẩu và xóa tài khoản.

---

## Phase 3: Giao diện Luyện nói 3 Nhiệm vụ (Speaking Flow)
- [x] **Task 3.1: Giao diện Mission 1 — Words Explorer**
  - Hiển thị 5 từ vựng kèm hình ảnh thực tế/emoji và âm thanh bản xứ.
  - Ghi âm và kiểm tra phát âm từng từ, điều kiện hoàn thành ≥ 80%.
- [x] **Task 3.2: Giao diện Mission 2 — Phonics / Sentence Builder**
  - Hiển thị các câu trong bài chant hoặc đoạn văn bản ngữ cảnh, highlight âm tiết mục tiêu.
  - Chấm phát âm và lưu kết quả theo từng dòng câu.
- [x] **Task 3.3: Giao diện Mission 3 — Speaking Challenge**
  - Hiển thị kịch bản hoàn chỉnh, học sinh tự nói trọn vẹn một mạch.
  - Chấm điểm tổng hợp cả 4 tiêu chuẩn phát âm và hiển thị màn hình chúc mừng nhận lá thưởng.

---

## Phase 4: Tính năng Bổ trợ & Trải nghiệm Phụ huynh (Enhancements)
- [x] **Task 4.1: Bảng điều khiển cho Phụ huynh (Parent Dashboard)**
  - Theo dõi tỷ lệ luyện tập Speaking, bài Writing đã nộp, số Leaves, chuỗi Streak và lịch sử từng câu/từ của con.
- [x] **Task 4.2: Hành trình học tập (Learning Journey Gamification)**
  - Mô phỏng quá trình sinh trưởng của cây: Seed (0) ➔ Young Leaf (10) ➔ Green Leaf (30) ➔ Strong Tree (60) ➔ Garden (100).
- [x] **Task 4.3: Hướng dẫn sử dụng trực tiếp trong ứng dụng**
  - Trang `/teacher/guide` dành cho giáo viên và `/help` + modal `FirstTimeGuide` dành cho học sinh.

---

## Phase 5: Chuẩn bị Môi trường & Triển khai Đám mây (Deployment)
- [x] **Task 5.1: Cấu hình Môi trường Serverless trên Vercel**
  - Cấu hình biến môi trường kết nối Supabase, Azure Speech, Gemini và Unsplash.
  - Thiết lập Git integration trên Vercel: tự động build và deploy khi có commit mới trên nhánh `main`.
- [x] **Task 5.2: Tối ưu Cache Âm thanh TTS**
  - Tạo bucket `greenleaf-tts-cache` lưu trữ audio phát âm mẫu theo hash nội dung, giảm chi phí Azure TTS và tối ưu tốc độ tải.

---

## Phase 6: Thiết kế Lại Giao diện & Linh vật Thương hiệu Leafy (Design Refresh)
- [x] **Task 6.1: Nhận diện Thương hiệu & Typography**
  - Áp dụng font chữ **Nunito** thân thiện với trẻ em và bảng màu chuẩn thương hiệu GreenLeaf.
  - Thiết kế logo vector `LeafLogo.tsx` và chân trang thương hiệu `AppFooter.tsx`.
- [x] **Task 6.2: Linh vật Leafy (Official Mascot)**
  - Thay thế linh vật tạm thời Brave bằng linh vật **Leafy** chính thức (chú sóc thông minh).
  - Tích hợp bộ ảnh WebP chất lượng cao với các sắc thái biểu cảm: `hero_wave`, `emo_happy2`, `act_winner2`, `emo_thinking2`, `act_explore2`, `act_teamwork2`.
- [x] **Task 6.3: Trang chủ Học sinh Kiểu Duolingo**
  - Bản đồ bài học zigzag trực quan, thanh tiến độ %, chuỗi lửa Streak 🔥 và số lá 🍃 tích lũy.
  - Thanh điều hướng cố định dưới cùng (`BottomTabBar.tsx`) gồm 4 mục: Learn, Journey, Homework, Profile.
- [x] **Task 6.4: Nhạc nền Tự động bằng Web Audio API**
  - Component `BackgroundMusic.tsx` sinh giai điệu nhẹ nhàng trực tiếp qua Web Audio API không tốn băng thông và tự tắt khi vào bài ghi âm.

---

## Phase 7: Tiếng Anh Toàn diện (English Immersion) & Mở rộng Dữ liệu
- [x] **Task 7.1: Bản địa hóa English Immersion 100%**
  - Chuyển đổi toàn bộ 64 file giao diện học sinh, giáo viên, phụ huynh sang tiếng Anh chuẩn mực.
  - Cập nhật prompt Google Gemini sinh phản hồi sư phạm hoàn toàn bằng tiếng Anh.
  - Migration `0017_word_meanings_english.sql`: Chuyển đổi 220 định nghĩa từ vựng sang tiếng Anh.
- [x] **Task 7.2: Tích hợp Kho Ảnh Minh họa Unsplash**
  - Tạo bucket `greenleaf-images` (Migration 0015) và vá bảo mật thắt chặt quyền ghi RLS (Migration 0016).
  - Phát triển script `scripts/populate-images.ts` tự động tìm kiếm và nạp ảnh chất lượng cao vào database.
- [x] **Task 7.3: Mở rộng 40 Bài học Mới**
  - Migration `0009_more_lessons.sql`: Bổ sung 40 bài học phong phú (10 bài/cấp độ) cho toàn hệ thống.
  - Migration `0014_kindergarten_phonics_one_syllable.sql`: Đơn giản hóa nội dung bài mầm non về từ 1 âm tiết.

---

## Phase 8: Hệ thống Hộp quà Bí mật & Vai trò Quản trị viên (Mystery Box & Admin)
- [x] **Task 8.1: Cơ sở dữ liệu & Vai trò Admin**
  - Migration `0018_mystery_box.sql`: Bổ sung role `admin`, bảng `greenleaf_mystery_box_requests` với unique index đảm bảo mỗi học sinh chỉ có tối đa 1 yêu cầu `pending`.
  - Viết hàm lưu trữ Postgres `greenleaf_confirm_mystery_box` kiểm tra số dư và trừ 100 Leaves nguyên tử (atomic transaction).
- [x] **Task 8.2: Giao diện Hộp quà trên Web & Mobile**
  - Component `MysteryBox.tsx` hiển thị trạng thái khóa dưới 100 Leaves, mở khóa và gửi yêu cầu đổi quà khi đủ lá.
  - Trang quản trị `/admin/mystery-box` dành riêng cho Admin tại quầy trung tâm kiểm tra và xác nhận đổi quà.
- [x] **Task 8.3: Bảo mật Điểm số bằng Mã hóa HMAC Server-Side**
  - Phát triển module `lib/assessToken.ts`: ký số cặp `(referenceText, overallScore)` khi Azure STT hoàn tất chấm điểm.
  - Xác thực token tại `/api/missions/complete` trước khi ghi nhận hoàn thành bài học, ngăn chặn gian lận điểm số.

---

## Phase 9: Phát triển Ứng dụng Di động Native (React Native / Expo SDK 52)
- [x] **Task 9.1: Khởi tạo Kiến trúc Di động Native**
  - Setup dự án `GreenLeaf/mobile` bằng Expo SDK 52 + React Native 0.86 + TypeScript.
  - Cấu hình kiến trúc **Client-Driven State Machine** nạp toàn bộ bài học vào RAM để chuyển câu với độ trễ 0ms.
- [x] **Task 9.2: Phát triển Hệ thống Màn hình Native**
  - `LoginScreen.tsx`: Đăng nhập bằng Username/Password, tự động ánh xạ `@greenleaf.local`, lưu phiên an toàn qua `AsyncStorage`.
  - `StudentHomeScreen.tsx`: Bản đồ bài học Duolingo mượt mà 60–120 FPS, Streak, Leaves, Leafy mascot, Mystery Box.
  - `LessonPlayerScreen.tsx`: Trình luyện nói 3 nhiệm vụ native hoàn chỉnh.
  - `JourneyScreen.tsx`, `HomeworkScreen.tsx`, `ProfileScreen.tsx`.
- [x] **Task 9.3: Native Audio Session & AI Speech Assessment**
  - Tích hợp `expo-speech` thay thế Web Speech để phát âm tiếng Anh chuẩn trên phần cứng iOS/Android.
  - Cấu hình session ghi âm native với `setAudioModeAsync` trên iOS.
  - Ghi âm chuẩn PCM 16kHz WAV đơn kênh qua `expo-audio` và chuyển đổi Base64 theo chuẩn WinterCG.
  - Hỗ trợ xác thực Bearer Token cho mobile app tại tất cả các API route server (`/api/assess`, `/api/missions/complete`).

---

## Phase 10: Tối ưu Hóa Hiệu năng & Xuất bản Ứng dụng (Performance & Publishing)
- [x] **Task 10.1: Tối ưu Hóa Nạp Dữ liệu Web**
  - Gộp các truy vấn database (Batch queries), áp dụng in-memory cache và kỹ thuật prefetch audio bài học tiếp theo.
- [x] **Task 10.2: Tích hợp Gói Capacitor iOS cho Web App**
  - Cấu hình `capacitor.config.ts` và thư mục `app/ios` hỗ trợ build nhanh gói ứng dụng iOS từ web khi cần thiết.
- [x] **Task 10.3: Biên dịch Native iOS Xcode Project**
  - Cấu hình `Podfile`, quyền micro `NSMicrophoneUsageDescription` trong `Info.plist` và tạo mã nguồn Xcode project thuần tại `mobile/ios/`.

---

## Phase 11: Việc cần thực hiện tiếp theo (cập nhật 23/10/2026)

### A. Hoàn tất triển khai (chặn bởi thao tác trên production)
- [ ] **Task 11.1: Áp dụng migration 0015 → 0016 → 0017 lên Supabase** (project `dcwzojgvahiqyrhvkdyh`, chạy đúng thứ tự). Hiện DB vẫn chưa có bucket `greenleaf-images` và nghĩa từ vựng còn tiếng Việt ("con mèo"). 0014 và 0018 đã áp dụng.
- [ ] **Task 11.2: Cấu hình `UNSPLASH_ACCESS_KEY` trên Vercel và chạy `scripts/populate-images.ts`** (sau 11.1). Hiện chưa mission nào có `imageUrl` thật, toàn bộ đang dùng emoji fallback.
- [ ] **Task 11.3: Test luồng Mystery Box thật trên production**: học sinh ≥100 lá bấm Request → admin Confirm ở `/admin/mystery-box` → Leaves giảm 100. (Admin đầu tiên đã tạo; logic DB đã test bằng transaction rollback, chưa test qua UI/API.)
- [ ] **Task 11.4: Test thật 2 cơ chế bảo mật đã deploy**: gọi `/api/missions/complete` với token giả phải nhận 400; gọi `/api/assess`, `/api/feedback`, `/api/tts` không đăng nhập phải nhận 401 (kiểm tra cả luồng Bearer token của mobile không bị chặn nhầm).

### B. Dọn thay đổi đang treo (chưa commit)
- [ ] **Task 11.5: Review và commit 13 file đang sửa dở** (web: `Recorder`, `ScoreDisplay`, `WordsExplorer`, `PhonicsChant`, `SpeakingChallenge`, `MissionIntro`, `StudentWorldMap`, trang `grades` + lesson, `lib/audio.ts`; mobile: `assess.ts`, `LessonPlayerScreen`, `StudentHomeScreen`, `wordEmoji.ts` mới). Không tạo bởi phiên review, cần chủ dự án xác nhận ý đồ trước khi gộp.
- [ ] **Task 11.6: Quyết định số phận `.agents/` và `docs/audit_suburban_worker_families_fit.md`** (đang untracked): commit hay đưa vào `.gitignore`.
- [x] **Task 11.7: Xoá dead code** `components/mascot/BraveMascot.tsx`, `components/missions/MissionTransition.tsx` — ĐÃ XOÁ (commit 92a6211) (không còn import ở đâu — kiểm tra lại trước khi xoá vì web đã redesign).

### C. Lỗi/rủi ro đã biết, chưa xử lý
- [ ] **Task 11.8: Rò `AudioContext` trong `Recorder.tsx`** — tạo mới mỗi lần ghi âm nhưng không `.close()`; ảnh hưởng máy Android yếu khi bấm "Try again" nhiều lần. (Kiểm tra lại sau khi chốt thay đổi Recorder ở 11.5.)
- [x] **Task 11.9: Race condition khi cộng Leaf/streak** (`lib/rewards.ts`: đọc-rồi-ghi không atomic) — double-tap/retry có thể cộng 2 lần. ĐÃ LÀM: migration `0020_atomic_leaves.sql` + `lib/rewards.ts` gọi RPC, test local 6 request song song chỉ cộng 1 lần (commit 92a6211, ĐÃ nằm trên origin/main). Production chưa có 0020 nên cộng Leaf/ghi tiến độ trên site live đang lỗi cho đến khi chạy 0020.
- [ ] **Task 11.10: Migration 0014 ghi đè toàn bộ `content`** của 7 lesson Kindergarten → mất `imageUrl`/`imageDescription` giáo viên đã nhập tay (nếu có).
- [ ] **Task 11.11: Cân nhắc lại giới hạn ghi âm 60s** (tăng từ 20s) với học sinh mạng yếu — kiểm tra kích thước upload thực tế.
- [ ] **Task 11.12: Rà lại phân quyền giáo viên**: `/register` cho tự đăng ký role teacher; teacher reset mật khẩu/xoá tài khoản bất kỳ học sinh nào. Cần siết trước khi Leaves đổi quà thật (cân nhắc chuyển các quyền này sang role admin hoặc cần duyệt tài khoản teacher).

### D. Điều chỉnh sản phẩm theo báo cáo audit
- [ ] **Task 11.13: Xử lý các điểm nghẽn trong `docs/audit_suburban_worker_families_fit.md`** (bản đồ web co cụm trên màn 360px, mobile khoá cứng bài từ bài số 2, onboarding bắt đọc tiếng Anh, thiết bị RAM 2GB/mạng yếu...). Cần đối chiếu từng nhận định với code hiện tại trước khi làm, vì báo cáo viết trước các commit redesign bản đồ.

- [ ] **Task 11.15 (KHẨN): Áp dụng `0019_teacher_controlled_lessons.sql` lên production.** Kiểm tra 30/10/2026: production chưa có cột `greenleaf_lessons.is_unlocked`, nhưng code đã deploy dùng nó. Hậu quả: nút mở/khoá bài của giáo viên lỗi, học sinh chỉ học được bài số 1 (fallback theo `order_index`). Cần áp dụng ngay: 0019 và 0020 (code của cả hai đã deploy); 0015 → 0017 cũng còn thiếu.
- [ ] **Task 11.16: Nhãn "Locked (Khóa)" / tooltip tiếng Việt ở `teacher/lessons`** — trái với quyết định English immersion; xác nhận có chủ đích song ngữ cho giáo viên hay không.
- [ ] **Task 11.17: Cài runtime container nhẹ (Colima/OrbStack) thay Docker Desktop** để chạy lại `supabase start` và test thao tác ghi thật (tạo/xoá tài khoản, reset mật khẩu, Mystery Box qua UI).

### E. Tài liệu
- [ ] **Task 11.14: Cập nhật `README.md`/`CLAUDE_SESSION.md`** cho khớp thư mục `mobile/`, Bearer auth, Mystery Box (migration 0018) và trạng thái migration thực tế trên production.

---

## Hạng mục Duy trì & Nâng cấp Tương lai (Future Roadmap)
- [ ] Bổ sung kiểm thử tự động (Unit Test / E2E Test) cho các luồng nghiệp vụ quan trọng.
- [ ] Tính năng tự đổi mật khẩu cho học sinh/phụ huynh trên màn hình Profile cá nhân.
- [ ] Giám sát hạn mức (Quota Usage) của Azure Speech, Google Gemini và Unsplash API trên production.
- [ ] Mở rộng các phân hệ kỹ năng AI nâng cao: AI Writing Evaluation, AI Listening Comprehension (Kế hoạch P3 Post-launch).
