# **TÀI LIỆU MÔ TẢ HỆ THỐNG \- GREENLEAF MVP**

**Dự án:** Phần mềm Trung tâm Tiếng Anh GreenLeaf  
**Ý tưởng cốt lõi:** CAO (Chief Academic Officer)  
**Hỗ trợ:** ChatGPT (trained\_by\_Lyn)

## **I. TỔNG QUAN CÁC TÍNH NĂNG CỐT LÕI (MVP CORE)**

Các tính năng ưu tiên phát triển trong giai đoạn MVP tập trung vào trải nghiệm thực hành phát âm, hệ thống bài tập, và công cụ hỗ trợ giáo viên.

### **1\. AI Pronunciation (Thực hành phát âm với AI)**

Đây là USP (Unique Selling Proposition) của GreenLeaf, mang lại trải nghiệm luyện tập phát âm tức thời cho học sinh.

* **Đánh giá:** ⭐⭐⭐⭐⭐  
* **Luồng hoạt động (Workflow):** Giáo viên chọn bài ➔ Học sinh nghe mẫu ➔ Đọc theo ➔ AI chấm điểm ➔ Nếu \< 80%: Yêu cầu đọc lại ➔ Nếu \> 80%: Hoàn thành.

### **2\. Homework Writing (Bài tập viết)**

Tính năng giúp tiết kiệm thời gian cho giáo viên, quản lý bài tập dễ dàng.

* **Đánh giá:** ⭐⭐⭐⭐⭐  
* **Luồng hoạt động:** Giáo viên giao đề ➔ Học sinh gõ bài trên hệ thống ➔ Nộp bài (Submit) ➔ Giáo viên chữa (hoặc dùng ChatGPT hỗ trợ).  
* **Ghi chú:** Không yêu cầu tích hợp AI chấm trực tiếp ngay trong giai đoạn này.

### **3\. Reward System (Hệ thống phần thưởng)**

Tính năng bắt buộc phải có để tăng động lực học tập với chi phí phát triển thấp.

* Hoàn thành 1 nhiệm vụ (Mission): **\+1 Leaf**  
* Chuỗi liên tiếp 7 ngày (7-day streak): **\+20 Leaves**  
* Đạt điểm tuyệt đối 100%: **\+5 Leaves**  
* **Quy đổi:** Tích lũy "Leaf" để đổi quà trực tiếp tại trung tâm.

### **4\. Teacher Resource Library (Thư viện tài liệu Giáo viên)**

Hệ thống lưu trữ giúp chuẩn hóa tài liệu toàn trung tâm, không cần giao diện phức tạp (có thể mô phỏng Windows Explorer hoặc Google Drive).

* **Cấu trúc thư mục:** Phân cấp theo giáo trình (Cambridge ➔ Ready Steady Grow / Think / Prepare / IELTS ➔ Unit).  
* **Thành phần trong mỗi Folder:** Lesson Plan, Worksheet, Flashcard, Audio, Video, Test, Keys.  
* **Thao tác:** Giáo viên chỉ cần truy cập và tải xuống. Không yêu cầu AI.

## **II. TÍNH NĂNG NÂNG CAO TRẢI NGHIỆM (NÊN TÍCH HỢP CÙNG CORE MVP)**

### **1\. Parent Dashboard (Bảng điều khiển cho Phụ huynh)**

Giao diện trực quan, mở lên thấy ngay tiến độ để tăng trải nghiệm phụ huynh:

* **Speaking:** Hiển thị % hoàn thành (VD: 100%).  
* **Writing:** Trạng thái hoàn thành (Done / Not done).  
* **Reward:** Số lá tích lũy (VD: 120 Leaves).  
* **Streak:** Chuỗi ngày học liên tục (VD: 5 days).

### **2\. Learning Journey (Hành trình học tập)**

Hệ thống gamification trực quan với chi phí thấp, mang tính biểu tượng thương hiệu.

* **Tiến trình:** Hạt giống (Seed) ➔ Lá non (Young Leaf) ➔ Lá xanh (Green Leaf) ➔ Cây trưởng thành (Strong Tree) ➔ Khu vườn (Garden).  
* **Điều kiện thăng cấp:** Cây sẽ lớn lên sau mỗi lần học sinh đạt 100% Speaking, nộp bài Writing, và hoàn thành bài tập.

## **III. CẤU TRÚC VÀ TRẢI NGHIỆM HỌC TẬP SPEAKING (AI DEMO)**

### **1\. Khởi động & Đăng nhập**

Xuất hiện linh vật chú mèo GreenLeaf với lời chào: *“Hello, my name’s Brave. Welcome to GreenLeaf. Let’s have fun\!”*

### **2\. Phân loại Cấp độ (Grades)**

* **Kindergarten:** 2.5 – 6 tuổi  
* **Kids 1:** Lớp 1 – 2 – 3  
* **Kids 2:** Lớp 4 – 5  
* **Teens:** THCS & THPT

### **3\. Cấu trúc Nhiệm vụ (Missions)**

| Nhiệm vụ | Mô tả & Luồng thực hiện | Phần thưởng   |
| :---- | :---- | :---- |
| **Mission 1: Words Explorer** | 5 từ vựng theo chủ đề (hình ảnh \+ audio). Học sinh nghe ➔ Ghi âm ➔ AI chấm. Dưới 80%: *Try again*. Trên 80%: *Well done*. | \+ 1 Leaf |
| **Mission 2: Phonics / Sentence Builder** | Bài chant (4 câu) / Câu dài. Highlight âm tiết. Đọc từng câu ➔ Ghi âm ➔ Chấm điểm theo từng dòng. | \+ 1 Leaf |
| **Mission 3: Speaking Challenge** | Hiển thị toàn bộ script bài chant/đoạn văn. Học sinh tự đọc một mạch ➔ AI ghi âm ➔ Chấm điểm tổng hợp. | \+ 1 Leaf |
| **Bonus hoàn thành xuất sắc 3 Nhiệm vụ (Mèo Brave khen ngợi: "Awesome")** |  | **\+ 3 Leaves** |

## **IV. CHI TIẾT NỘI DUNG DEMO THEO TỪNG CẤP ĐỘ**

| Cấp độ | M1: Words Explorer | M2: Phonics / Sentence Builder | M3: Speaking Challenge   |
| :---- | :---- | :---- | :---- |
| **Kindergarten** | **Animals:** cat, dog, bird, rat, lizard | **Phonics /a/:** Pat has a cat The cat has a hat Pat taps the cat Ha ha ha (laugh) | Đọc toàn bộ bài chant |
| **Kids 1** | **Toys:** car, train, robot, bike, kite | **Phonics i\_e /ai/:** Fly, fly, kite\! Ride, ride, bike\! Smile, smile, smile\! What a happy sight\! | Đọc toàn bộ bài chant |
| **Kids 2** | **Places:** cinema, post office, supermarket, police station, swimming pool | **Phonics:** Post office, post office, post my letter. Police station, keep us better. Supermarket, buy some pears. Swimming pool, see you there\! | Đọc toàn bộ bài chant |
| **Teens** | **City Life:** downtown, public transport, traffic congestion, rush hour, concrete jungle | **Sentence Builder:** Living in a downtown isn’t always easy. First, the living cost is very high. Second, there is usually traffic congestion in rush hour. Moreover, much of the urban landscape is turned into concrete jungle. These drawbacks make the city life less appealing nowadays. | Talk about the disadvantages of the city life. |

## **V. LỘ TRÌNH PHÁT TRIỂN (PRODUCT BACKLOG)**

| Mức ưu tiên | Tính năng (Feature) | Lý do / Mục tiêu   |
| :---- | :---- | :---- |
| 🔥 P1 (Core) | AI Pronunciation | USP của GreenLeaf |
| 🔥 P1 (Core) | Homework Writing | Tiết kiệm thời gian giáo viên |
| 🔥 P1 (Core) | Reward System | Tăng động lực học, chi phí phát triển thấp |
| 🔥 P1 (Core) | Teacher Resource Library | Chuẩn hóa toàn bộ trung tâm |
| 🟡 P1 (Enhance) | Parent Dashboard & Learning journey | Tăng trải nghiệm phụ huynh, đặc điểm thương hiệu |
| 🟢 P3 (Post-launch) | AI Writing, Reading, Listening, Vocabulary | Triển khai sau khi khai trương |

