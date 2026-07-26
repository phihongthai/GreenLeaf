# TÀI LIỆU YÊU CẦU HỆ THỐNG (SYSTEM REQUIREMENTS) - GREENLEAF MVP

> **Cập nhật 2026-07-26:** Webapp đã triển khai tại [`GreenLeaf/app`](../app) và deploy lên
> Vercel. Một số mục dưới đây được ghi chú ⚠️ ở chỗ hệ thống thực tế đã khác hoặc mở rộng so
> với đặc tả gốc, phát sinh trong quá trình dùng thử. Xem chi tiết task-by-task tại
> [`tasks.md`](tasks.md) và tài liệu kỹ thuật tại [`app/README.md`](../app/README.md).

## 1. TỔNG QUAN DỰ ÁN
- **Tên dự án:** Phần mềm Trung tâm Tiếng Anh GreenLeaf
- **Ý tưởng cốt lõi:** CAO (Chief Academic Officer)
- **Hỗ trợ:** ChatGPT (trained_by_Lyn)

## 2. CÁC TÍNH NĂNG CỐT LÕI (MVP CORE)

### 2.1. AI Pronunciation (Thực hành phát âm với AI) - Độ ưu tiên: P1 (Core)
- **Mô tả:** Đây là USP (Unique Selling Proposition) của GreenLeaf, mang lại trải nghiệm luyện tập phát âm tức thời cho học sinh.
- **Luồng hoạt động (Workflow):**
  1. Giáo viên chọn bài
  2. Học sinh nghe mẫu
  3. Học sinh đọc theo và ghi âm
  4. AI chấm điểm
  5. Nếu điểm < 80%: Yêu cầu đọc lại (Try again)
  6. Nếu điểm >= 80%: Hoàn thành (Well done)
- ⚠️ **Cập nhật "Giáo viên chọn bài":** không còn là 1 bộ Demo cố định/cấp độ — giáo viên tự
  tạo không giới hạn số bài học (**Lesson**) cho mỗi cấp độ qua form trong app, mỗi Lesson vẫn
  giữ đúng cấu trúc 3 Mission cố định bên dưới. Học sinh chọn Lesson muốn học trước khi vào
  luồng Mission 1-3. Xem chi tiết Task 2.5 trong `tasks.md`.

### 2.2. Homework Writing (Bài tập viết) - Độ ưu tiên: P1 (Core)
- **Mô tả:** Tiết kiệm thời gian cho giáo viên, quản lý bài tập.
- **Luồng hoạt động:** Giáo viên giao đề -> Học sinh gõ bài trên hệ thống -> Nộp bài (Submit) -> Giáo viên chữa (có thể copy sang ChatGPT để hỗ trợ).
- **Ghi chú:** Không yêu cầu tích hợp AI chấm trực tiếp ngay trong giai đoạn này.
- ⚠️ **Cập nhật:** "Giao đề" tách thành 2 bước — (1) tạo đề trong **Thư viện đề bài** 1 lần,
  tái sử dụng nhiều lần; (2) "giao bài" = chọn 1 đề có sẵn trong thư viện + hạn nộp. Tránh
  việc giáo viên phải gõ lại đề mới mỗi lần giao cho lớp khác/kỳ khác.

### 2.3. Reward System (Hệ thống phần thưởng) - Độ ưu tiên: P1 (Core)
- **Mô tả:** Hệ thống tạo động lực học tập (Bắt buộc phải có).
- **Quy tắc thưởng (Leaf):**
  - Hoàn thành 1 nhiệm vụ (Mission): +1 Leaf
  - Đạt điểm tuyệt đối (100%): +5 Leaf
  - Chuỗi liên tiếp 7 ngày (7-day streak): +20 Leaf
- **Quy đổi:** Tích lũy "Leaf" để đổi quà trực tiếp tại trung tâm.

### 2.4. Teacher Resource Library (Thư viện tài liệu Giáo viên) - Độ ưu tiên: P1 (Core)
- **Mô tả:** Kho lưu trữ tài liệu chuẩn hóa, giao diện đơn giản như Windows Explorer hoặc Google Drive. Không cần AI.
- **Cấu trúc thư mục dự kiến:** `Cambridge` -> `Ready Steady Grow / Think / Prepare / IELTS` -> `Unit 1, Unit 2...`
- **Nội dung mỗi Unit:** Lesson Plan, Worksheet, Flashcard, Audio, Video, Test, Keys.
- **Thao tác:** Giáo viên chỉ việc truy cập và tải xuống.

## 3. CÁC TÍNH NĂNG NÂNG CAO (Làm cùng Core MVP nếu có thể)

### 3.1. Parent Dashboard (Bảng điều khiển cho Phụ huynh) - Độ ưu tiên: P1 (Enhance)
- **Mô tả:** Giao diện trực quan cho phụ huynh theo dõi tiến độ.
- **Hiển thị:**
  - Speaking: % hoàn thành (VD: 100%)
  - Writing: Trạng thái (Done / Not done)
  - Reward: Số lá tích lũy (VD: 120 Leaves)
  - Streak: Chuỗi ngày học liên tục (VD: 5 days)
- ⚠️ **Bổ sung ngoài đặc tả gốc — Lịch sử học tập chi tiết:** phụ huynh (và giáo viên) xem
  được lịch sử đầy đủ, không chỉ số liệu tổng hợp: số lần học mỗi ngày, điểm số + kết quả
  từng lần luyện Speaking (kể cả các lần chưa đạt), danh sách bài Writing đã nộp. Lý do bổ
  sung: số liệu % tổng hợp không đủ để phụ huynh/giáo viên biết con đang học đều hay dồn vào
  1 ngày, hoặc đã thử bao nhiêu lần mới đạt.

### 3.2. Learning Journey (Hành trình học tập) - Độ ưu tiên: P1 (Enhance)
- **Mô tả:** Gamification trực quan, chi phí thấp nhưng giá trị cao mang đậm tính thương hiệu.
- **Tiến trình phát triển cây:** Hạt giống (Seed) -> Lá non (Young Leaf) -> Lá xanh (Green Leaf) -> Cây trưởng thành (Strong Tree) -> Khu vườn (Garden).
- **Điều kiện phát triển:** Mỗi lần học sinh đạt 100% Speaking, nộp bài Writing, và hoàn thành bài tập, cây sẽ lớn lên.

## 4. CẤU TRÚC VÀ TRẢI NGHIỆM HỌC TẬP SPEAKING (AI DEMO)

### Step 1: Khởi động & Đăng nhập
- Hiển thị linh vật chú mèo GreenLeaf (Brave).
- Câu chào: *"Hello, my name’s Brave. Welcome to GreenLeaf. Let’s have fun!"*

### Step 2: Chọn cấp độ Demo (Grades)
- **Kindergarten:** 2.5 – 6 tuổi
- **Kids 1:** Lớp 1 – 2 – 3
- **Kids 2:** Lớp 4 – 5
- **Teens:** THCS & THPT
- ⚠️ **Cập nhật:** học sinh chọn cấp độ **1 lần duy nhất lúc đăng ký tài khoản**, không hỏi lại
  mỗi lần mở app — trang chính hiển thị thẳng cấp độ đã chọn làm nút "Bắt đầu học". Vẫn giữ
  tuỳ chọn "Xem thử cấp độ khác" (ẩn mặc định) cho mục đích demo/khám phá.

### Step 3: Cấu trúc Nhiệm vụ (Missions)
- **Mission 1 (Words Explorer):**
  - 5 từ vựng theo chủ đề (có hình ảnh + audio).
  - Luồng: Nghe -> Ghi âm -> AI chấm (<80%: Try again; >=80%: Well done). Thưởng +1 Leaf.
- **Mission 2 (Phonics / Sentence Builder):**
  - Bài chant (4 câu) hoặc Câu dài. Xuất hiện lần lượt, highlight âm tiết luyện tập.
  - Luồng: Học sinh đọc theo từng câu -> Ghi âm -> Chấm điểm. Thưởng +1 Leaf.
- **Mission 3 (Speaking Challenge):**
  - Hiển thị toàn bộ script bài chant/đoạn văn.
  - Luồng: Học sinh tự đọc một mạch -> AI ghi âm -> Chấm điểm tổng hợp. Thưởng +1 Leaf.
- **Bonus:** Hoàn thành xuất sắc 3 Nhiệm vụ -> Mèo Brave khen ngợi ("Awesome") -> Thưởng thêm +3 Leaves.

## 5. CHI TIẾT NỘI DUNG DEMO THEO TỪNG CẤP ĐỘ

> ⚠️ Nội dung dưới đây hiện là **Lesson "Demo" mặc định** của mỗi cấp độ (seed sẵn trong DB
> lúc khởi tạo) — không còn là nội dung cố định duy nhất. Giáo viên tạo thêm Lesson mới với
> nội dung khác qua tab Lessons trong app.

### 5.1. Kindergarten
- **Mission 1 (Animals):** cat, dog, bird, rat, lizard (kèm hình ảnh).
- **Mission 2 (Phonics /a/):**
  - *Pat has a cat*
  - *The cat has a hat*
  - *Pat taps the cat*
  - *Ha ha ha (laugh)*
- **Mission 3:** Đọc toàn bộ bài chant trên.

### 5.2. Kids 1
- **Mission 1 (Toys):** car, train, robot, bike, kite (kèm hình ảnh).
- **Mission 2 (Phonics i_e /ai/):**
  - *Fly, fly, kite!*
  - *Ride, ride, bike!*
  - *Smile, smile, smile!*
  - *What a happy sight!*
- **Mission 3:** Đọc toàn bộ bài chant trên.

### 5.3. Kids 2
- **Mission 1 (Places):** cinema, post office, supermarket, police station, swimming pool (kèm hình ảnh).
- **Mission 2 (Phonics /a/):**
  - *Post office, post office, post my letter.*
  - *Police station, keep us better.*
  - *Supermarket, buy some pears.*
  - *Swimming pool, see you there!*
- **Mission 3:** Đọc toàn bộ bài chant trên.

### 5.4. Teens
- **Mission 1 (City Life):** downtown, public transport, traffic congestion, rush hour, concrete jungle (kèm hình ảnh).
- **Mission 2 (Sentence Builder):**
  - *Living in a downtown isn’t always easy.*
  - *First, the living cost is very high.*
  - *Second, there is usually traffic congestion in rush hour.*
  - *Moreover, much of the urban landscape is turned into concrete jungle.*
  - *These drawbacks make the city life less appealing nowadays.*
- **Mission 3:** Talk about the disadvantages of the city life.

## 6. LỘ TRÌNH PHÁT TRIỂN (PRODUCT BACKLOG)
| Priority | Feature | Lý do | Trạng thái |
| :--- | :--- | :--- | :--- |
| 🔥 P1 (Core) | AI Pronunciation | USP của GreenLeaf | ✅ Xong (cần Azure Speech key hợp lệ để chấm điểm chạy thật) |
| 🔥 P1 (Core) | Homework Writing | Tiết kiệm thời gian giáo viên | ✅ Xong + Thư viện đề bài |
| 🔥 P1 (Core) | Reward System | Tăng động lực học | ✅ Xong |
| 🔥 P1 (Core) | Teacher Resource Library | Chuẩn hóa toàn bộ trung tâm | ✅ Xong |
| 🟡 P1 (Enhance) | Parent Dashboard & Learning Journey | Tăng trải nghiệm phụ huynh, đặc điểm thương hiệu | ✅ Xong + Lịch sử học tập chi tiết |
| 🟡 (mới) | Lesson Authoring (giáo viên tự tạo bài học) | Kế hoạch gốc chỉ có 1 bộ Demo cố định/cấp độ, không đủ dùng thật | ✅ Xong |
| 🟢 P3 (Post-launch) | AI Writing, Reading, Listening, Vocabulary | Triển khai sau khi khai trương | ⏳ Chưa làm, đúng kế hoạch |
