# TÀI LIỆU YÊU CẦU HỆ THỐNG (SYSTEM REQUIREMENTS) - GREENLEAF MVP

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

### 2.2. Homework Writing (Bài tập viết) - Độ ưu tiên: P1 (Core)
- **Mô tả:** Tiết kiệm thời gian cho giáo viên, quản lý bài tập.
- **Luồng hoạt động:** Giáo viên giao đề -> Học sinh gõ bài trên hệ thống -> Nộp bài (Submit) -> Giáo viên chữa (có thể copy sang ChatGPT để hỗ trợ).
- **Ghi chú:** Không yêu cầu tích hợp AI chấm trực tiếp ngay trong giai đoạn này.

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
| Priority | Feature | Lý do |
| :--- | :--- | :--- |
| 🔥 P1 (Core) | AI Pronunciation | USP của GreenLeaf |
| 🔥 P1 (Core) | Homework Writing | Tiết kiệm thời gian giáo viên |
| 🔥 P1 (Core) | Reward System | Tăng động lực học |
| 🔥 P1 (Core) | Teacher Resource Library | Chuẩn hóa toàn bộ trung tâm |
| 🟡 P1 (Enhance) | Parent Dashboard & Learning Journey | Tăng trải nghiệm phụ huynh, đặc điểm thương hiệu |
| 🟢 P3 (Post-launch) | AI Writing, Reading, Listening, Vocabulary | Triển khai sau khi khai trương |
