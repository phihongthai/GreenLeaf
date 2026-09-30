# TÀI LIỆU YÊU CẦU HỆ THỐNG (SYSTEM REQUIREMENTS) — GREENLEAF ENGLISH ACADEMY

> **Cập nhật ngày:** 2026-09-30  
> **Trạng thái triển khai:** Đã triển khai đầy đủ trên Web App ([`GreenLeaf/app`](../app)) và Native Mobile App ([`GreenLeaf/mobile`](../mobile)).  
> **Nguyên tắc ngôn ngữ:** Giao diện ứng dụng và nội dung học tập tuân thủ **English Immersion 100%**. Tài liệu kỹ thuật nội bộ dành cho đội ngũ phát triển được trình bày bằng tiếng Việt.

---

## 1. TỔNG QUAN DỰ ÁN

- **Tên dự án:** Nền tảng Công nghệ Giáo dục GreenLeaf English Academy (*"Grow Beyond"*)
- **Mục tiêu:** Cung cấp giải pháp số hóa toàn diện việc luyện nói tiếng Anh với công nghệ AI, quản lý bài tập viết, theo dõi tiến độ của học sinh và gắn kết phụ huynh với trung tâm.
- **Đối tượng người dùng:**
  1. **Học sinh (Student)**: Luyện phát âm cùng AI, làm bài tập về nhà, tích lũy lá đổi quà Mystery Box.
  2. **Giáo viên (Teacher)**: Soạn bài học, giao đề bài viết, chấm bài, tạo và quản lý tài khoản học sinh, theo dõi lịch sử học tập.
  3. **Phụ huynh (Parent)**: Xem bảng chỉ số và lịch sử luyện tập chi tiết của con.
  4. **Quản trị viên (Admin)**: Xác nhận và phê duyệt yêu cầu đổi Hộp quà bí mật (Mystery Box).

---

## 2. CÁC TÍNH NĂNG CỐT LÕI (CORE REQUIREMENTS)

### 2.1. AI Pronunciation Assessment (Luyện phát âm cùng AI) — P1 (Core)
- **Mô tả:** Tính năng quan trọng nhất (USP) giúp học sinh luyện phát âm và ngữ điệu chuẩn bản xứ với phản hồi tức thời.
- **Động cơ chấm điểm & Phân tích:**
  - Sử dụng **Microsoft Azure AI Speech Service (Pronunciation Assessment)**: Chấm điểm phoneme-level (từng âm vị), word-level (từng từ), và toàn câu gồm: Độ chính xác (Accuracy), Độ lưu loát (Fluency), Độ hoàn thiện (Completeness), và Ngữ điệu (Prosody).
  - Tích hợp **Google Gemini Pro**: Phân tích lỗi phát âm cụ thể và cung cấp phản hồi gợi ý bằng tiếng Anh ngắn gọn, thân thiện và mang tính khích lệ học sinh.
- **Bảo mật điểm số (Server-Side Verification)**:
  - Máy chủ tạo mã băm HMAC ký số kèm cặp giá trị `(referenceText, overallScore)` thông qua hàm `signAssessResult`.
  - Khi học sinh hoàn thành nhiệm vụ, API `/api/missions/complete` bắt buộc phải nhận được token hợp lệ mới ghi nhận điểm và cộng lá, ngăn chặn hoàn toàn việc client can thiệp sửa điểm.
- **Định dạng âm thanh hỗ trợ**:
  - Web: Web Audio API (MediaRecorder) xuất audio/webm hoặc wav.
  - Mobile: Native Audio Recording (PCM WAV 16kHz mono qua `expo-audio`), mã hóa Base64 tương thích chuẩn WinterCG.

### 2.2. Homework Writing (Bài tập viết) — P1 (Core)
- **Thư viện đề bài (`greenleaf_writing_topics`)**: Giáo viên tạo đề bài mẫu 1 lần (tiêu đề, yêu cầu, gợi ý theo cấp độ) và tái sử dụng khi giao bài cho nhiều lớp/thời điểm khác nhau.
- **Giao bài & Nộp bài (`greenleaf_homework_assignments` & `submissions`)**:
  - Giáo viên chọn đề từ thư viện, đặt hạn nộp (Deadline).
  - Học sinh gõ bài trực tiếp trên trình soạn thảo trong ứng dụng và bấm Submit.
  - Giáo viên xem danh sách bài đã nộp, chấm điểm, ghi nhận xét sư phạm chi tiết.

### 2.3. Reward System & Mystery Box (Hệ thống phần thưởng) — P1 (Core)
- **Quy tắc tích lũy Lá (Leaves 🍃)**:
  - Hoàn thành 1 mission: **+1 Leaf**
  - Đạt điểm tuyệt đối 100%: **+5 Leaves**
  - Chuỗi học liên tục 7 ngày (7-day streak): **+20 Leaves**
  - Hoàn thành trọn vẹn cả 3 mission trong 1 lesson: **+3 Leaves**
- **Bảo mật cơ sở dữ liệu**:
  - Bảng `greenleaf_rewards` bị thu hồi quyền `UPDATE` trực tiếp từ client. Việc cộng lá chỉ thực hiện qua Service Role tại `/api/missions/complete`.
- **Cơ chế Hộp quà bí mật (Mystery Box)**:
  - Mức kích hoạt: Tối thiểu **100 Leaves**.
  - Dưới 100 Leaves: Hộp quà ở trạng thái khóa (🔒 *Unlock at 100 Leaves*).
  - Đủ 100 Leaves: Hộp quà mở khóa, học sinh có thể bấm gửi yêu cầu (*Request Mystery Box*). Mỗi học sinh chỉ được có tối đa 1 yêu cầu ở trạng thái `pending`.
  - Quy trình đổi quà: Học sinh đến quầy lễ tân trung tâm ➔ Quản trị viên (Admin) vào `/admin/mystery-box` kiểm tra ➔ Bấm **Confirm** ➔ Hàm cơ sở dữ liệu `greenleaf_confirm_mystery_box` kiểm tra số dư và trừ 100 Leaves trong 1 transaction duy nhất ➔ Học sinh bốc thăm phần quà vật lý may mắn tại trung tâm.

### 2.4. Teacher Resource Library (Thư viện tài liệu giáo viên) — P1 (Core)
- Kho lưu trữ số hóa trên Supabase Storage (bucket `greenleaf-resources`).
- Cấu trúc thư mục chuẩn hóa: `Cambridge` ➔ `Giáo trình (Ready Steady Grow / Think / Prepare / IELTS)` ➔ `Unit`.
- Chứa tài liệu: Lesson Plan, Worksheet, Audio, Video, Flashcard, Test, Answer Keys.
- Kiểm soát quyền: Chỉ tài khoản có role `teacher` mới được tải lên và quản lý.

### 2.5. Quản lý tài khoản không cần Email (Account Management) — P1 (Core)
- **Vấn đề giải quyết:** Học sinh độ tuổi nhỏ không có email cá nhân; không cần trải qua bước xác nhận email phức tạp khi triển khai tại trung tâm.
- **Quy trình hoạt động:**
  1. Giáo viên vào `/teacher/accounts` tạo tài khoản học sinh/phụ huynh bằng **Username + Mật khẩu + Tên hiển thị + Cấp độ**.
  2. API phía máy chủ sử dụng Supabase Admin API với cờ `email_confirm: true`, tự động quy đổi username thành email nội bộ `<username>@greenleaf.local`.
  3. Học sinh/Phụ huynh đăng nhập chỉ cần điền Username (không cần gõ đuôi `@...`).
  4. Giáo viên có thể liên kết Phụ huynh ↔ Học sinh ngay trên giao diện web.
  5. Giáo viên có quyền sửa thông tin, đặt lại mật khẩu hoặc xóa tài khoản học sinh/phụ huynh khi cần thiết.

---

## 3. CÁC TÍNH NĂNG NÂNG CAO (ENHANCED REQUIREMENTS)

### 3.1. Parent Dashboard (Bảng điều khiển cho Phụ huynh)
- Giao diện trực quan cho phụ huynh nắm bắt tức thì tình hình học tập:
  - Tỷ lệ hoàn thành Speaking.
  - Trạng thái nộp bài tập Writing.
  - Tổng số lá Leaves đã tích lũy và chuỗi Streak ngày học liên tục.
  - **Lịch sử học tập chi tiết (Student History)**: Báo cáo từng ngày, chi tiết từng lượt thử phát âm (từ/câu luyện, điểm số đạt được, thời gian thực hiện).

### 3.2. Learning Journey (Hành trình học tập sinh động)
- Bản đồ tăng trưởng hình ảnh cây xanh theo 5 cấp độ:
  - **Seed**: 0 điểm
  - **Young Leaf**: 10 điểm
  - **Green Leaf**: 30 điểm
  - **Strong Tree**: 60 điểm
  - **Garden**: 100 điểm
- Giao diện bản đồ hiển thị dạng zigzag trực quan, tạo cảm giác chinh phục từng chặng đường học tập.

### 3.3. Ứng dụng Di động Native (Native Mobile Experience)
- **Công nghệ:** Xây dựng bằng React Native và Expo SDK 52 thuần túy (không WebView).
- **Trải nghiệm 0ms (Zero Latency):** Cơ chế State Machine tải trước toàn bộ bài học vào RAM, giúp học sinh luyện phát âm, chuyển câu và nhận phản hồi tức thì.
- **Âm thanh Native:**
  - Sử dụng `expo-speech` cho giọng đọc mẫu mượt mà.
  - Sử dụng `expo-audio` cấu hình chuẩn `setAudioModeAsync` cho iOS và Android, ghi âm 16kHz PCM WAV tối ưu cho AI Speech Recognition.
- **Điều hướng 4 Tab:** Learn (Học tập) | Journey (Hành trình) | Homework (Bài tập) | Profile (Hồ sơ).
- **Lưu phiên đăng nhập:** Lưu trữ phiên an toàn qua `AsyncStorage`, tự động đăng nhập khi mở lại app.

---

## 4. BẢN SẮC THƯƠNG HIỆU & LINH VẬT LEAFY

- **Linh vật chính thức:** Chú sóc **Leafy** — thông minh, nhanh nhẹn, hiếu học và thân thiện.
- **Bộ hình ảnh cảm xúc Leafy (WebP chất lượng cao):**
  - Chào mừng và định hướng: `hero_wave.webp`
  - Động viên, khen ngợi: `emo_happy2.webp`
  - Hân hoan chiến thắng: `act_winner2.webp`
  - Khám phá từ vựng: `act_explore2.webp`
  - Suy nghĩ, hỗ trợ câu khó: `emo_thinking2.webp`
  - Hoạt động nhóm: `act_teamwork2.webp`
- **Bộ nhận diện thương hiệu:**
  - Slogan: *"GreenLeaf English Academy — Grow Beyond"*
  - Font chữ chủ đạo: **Nunito** (tròn trịa, thân thiện, dễ đọc cho trẻ em).
  - Màu sắc thương hiệu: Xanh lá chủ đạo (Emerald `#10b981`, Forest `#059669`), cam tạo điểm nhấn (`#f59e0b`), vàng sao thưởng (`#eab308`).

---

## 5. MA TRẬN YÊU CẦU THEO CẤP ĐỘ ĐÀO TẠO

| Cấp độ | Độ tuổi | Chủ đề từ vựng (Mission 1) | Ngữ âm & Cấu trúc câu (Mission 2) | Thử thách tự nói (Mission 3) |
| :--- | :--- | :--- | :--- | :--- |
| **Kindergarten** | 2.5 – 6 tuổi | Đơn giản, từ 1 âm tiết (Animals, Colors, Toys...) | Bài chant ngắn với nguyên âm cơ bản (VD: /a/) | Đọc diễn cảm cả bài chant |
| **Kids 1** | Lớp 1 – 3 | Trường học, đồ chơi, gia đình, sở thích | Phonics nguyên âm đôi và phụ âm kép (/ai/, /ee/...) | Đọc trọn vẹn bài chant |
| **Kids 2** | Lớp 4 – 5 | Địa điểm, nghề nghiệp, giao thông, môi trường | Phonics câu phức tạp, nối âm và ngữ điệu câu | Đọc bài chant dài hoặc đoạn văn ngắn |
| **Teens** | THCS – THPT | Đời sống thành thị, công nghệ, tư duy phản biện | Sentence Builder: Cấu trúc câu ghép, câu phức | Trình bày đoạn văn nêu quan điểm mạch lạc |

---

## 6. BẢNG TRẠNG THÁI TÍNH NĂNG (FEATURE STATUS)

| Hạng mục | Mức độ ưu tiên | Trạng thái hiện tại | Ghi chú kỹ thuật |
| :--- | :--- | :--- | :--- |
| **AI Pronunciation** | P1 (Core) | ✅ Hoàn thành xuất sắc | Azure AI Speech Service + Server-side HMAC Signing + 16kHz PCM WAV |
| **Lesson Authoring** | P1 (Core) | ✅ Hoàn thành xuất sắc | Giáo viên tự tạo/sửa Lesson, hỗ trợ ảnh minh họa Unsplash |
| **Homework Writing** | P1 (Core) | ✅ Hoàn thành | Thư viện đề bài viết + nộp bài trực tuyến + chấm bài |
| **Reward System** | P1 (Core) | ✅ Hoàn thành | Cơ chế tính lá tự động, chặn client sửa điểm qua RLS |
| **Mystery Box** | P1 (Core) | ✅ Hoàn thành | Đổi 100 lá lấy hộp quà bí mật, Admin duyệt tại trung tâm |
| **Account Management** | P1 (Core) | ✅ Hoàn thành | Đăng nhập Username/Password không cần email thật |
| **Resource Library** | P1 (Core) | ✅ Hoàn thành | Lưu trữ tài liệu trên Supabase Storage (`greenleaf-resources`) |
| **Parent Dashboard** | P1 (Enhance) | ✅ Hoàn thành | Xem tiến độ, lá, streak và lịch sử từng câu/từ |
| **Learning Journey** | P1 (Enhance) | ✅ Hoàn thành | Bản đồ cây 5 chặng theo số nhiệm vụ hoàn thành |
| **Native Mobile App** | P1 (Enhance) | ✅ Hoàn thành | React Native/Expo SDK 52, 4 tabs, State Machine 0ms |
| **English Immersion** | P1 (Core) | ✅ Hoàn thành | 100% UI, feedback Gemini và nghĩa từ vựng bằng tiếng Anh |
| **AI Writing/Listening** | P3 (Post-launch)| ⏳ Dự kiến tương lai | Sẽ phát triển sau khi hệ thống trung tâm mở rộng |
