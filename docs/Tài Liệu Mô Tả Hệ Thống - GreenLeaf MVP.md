# TÀI LIỆU MÔ TẢ HỆ THỐNG — GREENLEAF ENGLISH ACADEMY

**Dự án:** Phần mềm Quản trị & Học tiếng Anh Trung tâm GreenLeaf (*"Grow Beyond"*)  
**Ý tưởng cốt lõi:** CAO (Chief Academic Officer)  
**Trạng thái hệ thống:** Đã triển khai và hoạt động trên Web App (Next.js 14) & Native Mobile App (React Native/Expo SDK 52)  
**Cập nhật mới nhất:** 2026-09-30  

---

## I. TỔNG QUAN HỆ THỐNG & ĐỊNH HƯỚNG SẢN PHẨM

GreenLeaf English Academy là nền tảng công nghệ giáo dục hỗ trợ giảng dạy và thực hành tiếng Anh toàn diện cho học sinh ở nhiều độ tuổi (Mầm non đến THPT), kết nối chặt chẽ giữa **Học sinh**, **Giáo viên**, **Phụ huynh** và **Quản trị viên**.

### Các nguyên tắc thiết kế trọng tâm (Design Principles)
1. **English Immersion (Môi trường tiếng Anh 100%)**:
   - Toàn bộ giao diện học sinh, các bài học, phản hồi gợi ý của AI (Google Gemini), và nghĩa giải thích từ vựng đều được thể hiện hoàn toàn bằng tiếng Anh để tạo phản xạ ngôn ngữ tự nhiên.
   - Tài liệu kỹ thuật, hướng dẫn giáo viên và báo cáo cho phụ huynh hỗ trợ tiếng Việt để thuận tiện vận hành.
2. **AI Chấm phát âm chuẩn xác & Khách quan (Phoneme-level Scoring)**:
   - Sử dụng Microsoft Azure AI Speech Service để chấm phát âm đến từng âm vị (Phoneme), từng từ (Word) và toàn bài (Completeness, Fluency, Prosody).
   - Bảo mật điểm số nghiêm ngặt bằng cơ chế ký số mã hóa server-side (`signAssessResult`), chống việc client tự can thiệp gửi điểm giả.
3. **Gamification tạo động lực học tập (Dopamine Loop)**:
   - Học sinh được tích lũy **Leaves** (🍃), duy trì chuỗi học liên tục **Streak** (🔥), nuôi dưỡng cây **Learning Journey** tăng trưởng và đổi thưởng bằng **Mystery Box** (Hộp quà bí mật).
4. **Đa nền tảng mượt mà (Omnichannel Experience)**:
   - Web App tương thích mọi kích thước màn hình (Mobile Web & Desktop).
   - Native Mobile App (iOS & Android) tối ưu hóa thời gian phản hồi 0ms bằng cơ chế State Machine.

---

## II. CÁC PHÂN HỆ TÍNH NĂNG CỐT LÕI (CORE MODULES)

### 1. Phân hệ Luyện phát âm cùng AI (AI Pronunciation & Speaking)
* **Đánh giá:** ⭐⭐⭐⭐⭐ (Tính năng USP cốt lõi của GreenLeaf)
* **Cấu trúc 3 nhiệm vụ (3 Missions Workflow)** trong mỗi bài học:
  1. **Mission 1: Words Explorer (Khám phá từ vựng)**:
     - 5 từ vựng trọng tâm theo chủ đề.
     - Hiển thị hình ảnh minh họa thực tế (lấy từ Unsplash qua cache nội bộ) hoặc emoji trực quan.
     - Học sinh bấm nghe phát âm chuẩn bản xứ ➔ Bấm giữ/chạm để ghi âm ➔ Hệ thống Azure AI chấm điểm phoneme.
     - Quy tắc: Điểm < 80%: Nhắc nhở đọc lại (*Try again*); Điểm ≥ 80%: Đạt chuẩn (*Well done*).
     - Hoàn thành Mission 1: Nhận **+1 Leaf**.
  2. **Mission 2: Phonics / Sentence Builder (Luyện ngữ âm & Câu)**:
     - Bài chant gồm các câu ngắn (với Kindergarten/Kids) hoặc đoạn văn ngữ cảnh (với Teens).
     - Hệ thống highlight các từ chứa âm đang luyện tập và hiển thị hình ảnh theo từng câu.
     - Học sinh luyện đọc từng câu ➔ Ghi âm ➔ AI chấm điểm riêng cho từng câu.
     - Hoàn thành Mission 2: Nhận **+1 Leaf**.
  3. **Mission 3: Speaking Challenge (Thử thách tự nói trọn bài)**:
     - Toàn bộ kịch bản bài chant hoặc đoạn văn bản dài được hiển thị đầy đủ.
     - Học sinh tự đọc diễn cảm một mạch không dừng ➔ AI ghi âm toàn đoạn ➔ Chấm điểm tổng hợp cả 4 tiêu chí (Độ chính xác, Lưu loát, Đầy đủ, Ngữ điệu).
     - Hoàn thành Mission 3: Nhận **+1 Leaf**.
  4. **Bonus hoàn thành trọn vẹn Lesson**:
     - Khi hoàn thành cả 3 missions trong bài học: Linh vật **Leafy** chúc mừng cùng hiệu ứng rực rỡ và thưởng thêm **+3 Leaves**.

### 2. Phân hệ Bài tập viết (Homework Writing)
* **Đánh giá:** ⭐⭐⭐⭐⭐
* **Thư viện đề bài viết (`greenleaf_writing_topics`)**: Giáo viên chỉ cần soạn đề bài 1 lần và có thể giao nhiều lần cho các lớp/học sinh khác nhau.
* **Quy trình nộp & chấm bài**:
  - Giáo viên giao đề bài kèm thời hạn nộp (Deadline).
  - Học sinh nhận thông báo trong mục Homework, soạn bài viết trực tiếp trên giao diện trình soạn thảo và bấm Submit.
  - Giáo viên xem danh sách bài nộp, cho điểm và viết lời nhận xét chi tiết (có thể sử dụng AI hỗ trợ chấm bài).

### 3. Hệ thống phần thưởng lá & Hộp quà bí mật (Reward System & Mystery Box)
* **Cơ chế tích lũy lá (Leaves 🍃)**:
  - Hoàn thành 1 mission: **+1 Leaf**
  - Đạt điểm tuyệt đối (100%): **+5 Leaves**
  - Chuỗi học liên tục 7 ngày (7-day streak): **+20 Leaves**
  - Hoàn thành xuất sắc cả bài học (3 missions): **+3 Leaves**
* **Cơ chế Hộp quà bí mật (Mystery Box)**:
  - Khi học sinh đạt tích lũy từ **100 Leaves**, biểu tượng Hộp quà bí mật chuyển từ trạng thái Khóa (🔒 *Unlock at 100 Leaves*) sang Mở khóa và cho phép gửi yêu cầu đổi quà (*Request Mystery Box*).
  - Học sinh đến trung tâm mang theo ứng dụng, quản trị viên (Admin) truy cập trang `/admin/mystery-box` kiểm tra và bấm xác nhận (Confirm).
  - Hệ thống tự động trừ 100 Leaves qua transaction an toàn, và học sinh được bốc thăm hộp quà vật lý tại trung tâm (chứa các phần thưởng hấp dẫn ngẫu nhiên).

### 4. Hành trình học tập (Learning Journey Gamification)
* Cây học tập đại diện cho sự phát triển của học sinh với 5 giai đoạn:
  1. **Hạt giống (Seed)**: 0 điểm
  2. **Lá non (Young Leaf)**: 10 điểm
  3. **Lá xanh (Green Leaf)**: 30 điểm
  4. **Cây trưởng thành (Strong Tree)**: 60 điểm
  5. **Khu vườn (Garden)**: 100 điểm
* Điểm tăng trưởng được tính lũy tiến dựa trên số lần hoàn thành nhiệm vụ Speaking và số bài tập Writing đã nộp.

### 5. Quản lý tài khoản không cần Email (Frictionless Account Management)
* Giải quyết triệt để vấn đề học sinh mầm non/tiểu học không có email riêng:
  - Giáo viên tạo trực tiếp tài khoản học sinh và phụ huynh tại `/teacher/accounts` chỉ bằng Tên + Username + Password.
  - Hệ thống tự động ánh xạ username thành định danh nội bộ `<username>@greenleaf.local` trên Supabase Auth với cờ `email_confirm: true`.
  - Giáo viên liên kết phụ huynh ↔ học sinh trực tiếp bằng giao diện chọn lựa đơn giản.
  - Giáo viên có toàn quyền hỗ trợ học sinh: đổi tên, đổi mật khẩu và xóa tài khoản khi cần thiết.

### 6. Linh vật thương hiệu — Chú sóc Leafy
* Linh vật chính thức của GreenLeaf là **Leafy** (chú sóc thông minh, yêu thiên nhiên, tràn đầy năng lượng), thay thế cho mascot tạm thời trước đó.
* Leafy sở hữu bộ nhận diện cảm xúc đa dạng chuẩn bị sẵn bằng định dạng webp chất lượng cao:
  - `hero_wave.webp`: Chào đón học sinh tại trang chủ.
  - `emo_happy2.webp`: Khen ngợi khi hoàn thành bài tập tốt.
  - `act_winner2.webp`: Ăn mừng chiến thắng khi hoàn thành bài học.
  - `emo_thinking2.webp`: Động viên học sinh suy nghĩ khi gặp câu hỏi khó.
  - `act_explore2.webp`: Khích lệ khám phá từ vựng mới.
  - `act_teamwork2.webp`: Hướng dẫn tương tác nhóm và kết nối.

---

## III. CÁC CẤP ĐỘ ĐÀO TẠO & NỘI DUNG MẪU

Hệ thống được cấu trúc sẵn 4 cấp độ với hơn 40 bài học (120 nhiệm vụ):

1. **Kindergarten (2.5 – 6 tuổi)**:
   - Từ vựng cơ bản, ngắn, kèm hình ảnh sinh động (Animals, Colors, Toys, Family, Food, Weather...).
   - Bài chant ngắn với âm vị cơ bản (ví dụ âm `/a/`: *Pat has a cat*), các từ đơn âm tiết dễ phát âm.
2. **Kids 1 (Lớp 1 – 2 – 3)**:
   - Các chủ đề mở rộng (School, Clothes, Hobbies, Actions).
   - Phonics luyện các nguyên âm đôi (VD `/ai/`: *Fly, fly, kite! Ride, ride, bike!*).
3. **Kids 2 (Lớp 4 – 5)**:
   - Chủ đề đời sống và cộng đồng (Places, Jobs, Transportation, Nature).
   - Bài chant dài hơn, nâng cao độ lưu loát và ngữ điệu câu.
4. **Teens (THCS & THPT)**:
   - Các chủ đề thực tế, học thuật và tư duy phản biện (City Life, Technology, Environment, Global Citizens).
   - Sentence Builder & Speech Challenge: Học sinh đọc và trình bày đoạn văn luận ngắn, luyện ngữ điệu, trọng âm câu và độ trôi chảy tự nhiên.

---

## IV. KIẾN TRÚC KỸ THUẬT VÀ NỀN TẢNG TRIỂN KHAI

### 1. Web Application (`app/`)
- **Framework**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS.
- **Triển khai**: Serverless trên Vercel với cơ chế CI/CD tự động khi push nhánh `main`.
- **Hỗ trợ thiết bị di động**: Tích hợp Capacitor (`@capacitor/ios`, `@capacitor/cli`) cho phép xuất gói ứng dụng iOS mở trực tiếp bằng Xcode.

### 2. Native Mobile Application (`mobile/`)
- **Framework**: React Native 0.86, Expo SDK 52, TypeScript.
- **Kiến trúc State Machine**: Toàn bộ dữ liệu của bài học được nạp đồng thời vào bộ nhớ khi bắt đầu, điều hướng giữa các câu hỏi với độ trễ 0ms không phụ thuộc mạng.
- **Audio Pipeline**:
  - Ghi âm chuẩn PCM 16kHz WAV đơn kênh (mono) thông qua `expo-audio` và thiết lập `setAudioModeAsync` cho iOS Audio Session.
  - Chuyển đổi file âm thanh sang chuẩn Base64 WinterCG và gửi đến `/api/assess`.
  - Phát âm mẫu bản xứ tự nhiên bằng `expo-speech` tương thích phần cứng iOS và Android.

### 3. Backend & Cloud Infrastructure
- **Database & Auth**: Supabase PostgreSQL với 18 migrations bảo mật RLS nghiêm ngặt.
- **Storage Buckets**:
  - `greenleaf-resources`: Tài liệu giáo trình của giáo viên.
  - `greenleaf-tts-cache`: Cache file âm thanh đọc mẫu.
  - `greenleaf-images`: Cache hình ảnh Unsplash của từ vựng và câu học.
- **AI Integrations**:
  - **Azure AI Speech Services**: Pronunciation Assessment (Phoneme, Accuracy, Fluency, Completeness, Prosody).
  - **Google Gemini Pro**: Phân tích lỗi sai và đưa ra lời khuyên sư phạm cá nhân hóa bằng tiếng Anh.
  - **Unsplash Developers API**: Tự động tìm kiếm và nạp hình ảnh chất lượng cao cho kho từ vựng.
