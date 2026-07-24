# DANH SÁCH TÁC VỤ PHÁT TRIỂN GREENLEAF MVP (DÀNH CHO CLAUDE CODE)

Tài liệu này chia nhỏ các yêu cầu hệ thống thành các task cụ thể, tuần tự để Claude Code có thể đọc, hiểu và thực thi từng bước trong quá trình lập trình.

## Phase 1: Khởi tạo dự án & Kiến trúc cơ bản (Project Setup & Architecture)
- [ ] **Task 1.1: Khởi tạo Repository**
  - Setup một project fullstack (khuyến nghị Next.js + TypeScript + Tailwind CSS).
  - Cấu hình các công cụ chuẩn hóa code: ESLint, Prettier.
- [ ] **Task 1.2: Thiết kế & Khởi tạo Cơ sở dữ liệu (Database Schema)**
  - Cài đặt ORM (Prisma hoặc Drizzle) và kết nối với cơ sở dữ liệu (PostgreSQL/MySQL).
  - Tạo bảng `Users` với các role: `Student`, `Teacher`, `Parent`.
  - Tạo bảng `Grades` (Kindergarten, Kids 1, Kids 2, Teens).
  - Tạo bảng `Missions` và `Lessons`.
  - Tạo bảng `Student_Progress` lưu trữ điểm số, file ghi âm, trạng thái hoàn thành.
  - Tạo bảng `Rewards` lưu trữ số "Leaf" và số ngày học liên tiếp (Streak).
- [ ] **Task 1.3: Cấu hình Authentication**
  - Setup hệ thống đăng nhập/đăng ký cho các Role khác nhau.

## Phase 2: Phát triển Core MVP (Tính năng cốt lõi)
- [ ] **Task 2.1: Module AI Pronunciation (Quan trọng nhất)**
  - Tích hợp Web Audio API để thu âm giọng nói của học sinh trên trình duyệt.
  - Viết API kết nối với dịch vụ Speech-to-Text / Pronunciation Assessment (VD: OpenAI Audio API hoặc SpeechSuper).
  - Viết logic xử lý kết quả: tính điểm %, trả về phản hồi ("Try again" nếu < 80%, "Well done" nếu >= 80%).
  - Xây dựng UI hiển thị Audio player để học sinh nghe mẫu và nút "Hold to Record".
- [ ] **Task 2.2: Module Homework Writing**
  - Viết API cho phép giáo viên tạo bài tập viết (Assign Task).
  - Xây dựng UI cho học sinh nhập văn bản (Text Editor cơ bản) và nút "Submit".
  - Xây dựng UI cho giáo viên xem danh sách bài nộp và cập nhật trạng thái đã chấm.
- [ ] **Task 2.3: Module Reward System**
  - Viết logic (Service) cập nhật "Leaf": 
    - Cộng 1 Leaf khi xong 1 mission.
    - Cộng 5 Leaf khi đạt 100% điểm.
    - Cộng 20 Leaf khi đạt 7 ngày streak.
  - Viết cron job hoặc middleware kiểm tra và cập nhật Streak hằng ngày của học sinh.
- [ ] **Task 2.4: Module Teacher Resource Library**
  - Thiết kế UI quản lý file dạng cây thư mục (giống Windows Explorer).
  - Cấu trúc tĩnh hiển thị các folder: `Cambridge` -> `Ready Steady Grow / Think / Prepare / IELTS` -> `Unit...`
  - Tích hợp dịch vụ lưu trữ (AWS S3 hoặc tương đương) để upload/download các file Lesson Plan, Worksheet, Audio, Video.

## Phase 3: Xây dựng Trải nghiệm Speaking Demo (Giao diện Học sinh)
- [ ] **Task 3.1: UI Khởi động & Chọn cấp độ**
  - Tạo màn hình Welcome với hình ảnh chú mèo Brave và text: *"Hello, my name’s Brave. Welcome to GreenLeaf. Let’s have fun!"*.
  - Tạo luồng chọn cấp độ: Kindergarten, Kids 1, Kids 2, Teens.
- [ ] **Task 3.2: Giao diện Mission 1 (Words Explorer)**
  - Render danh sách từ vựng dạng flashcard có hình ảnh.
  - Tích hợp tính năng phát âm thanh mẫu và ghi âm kiểm tra.
- [ ] **Task 3.3: Giao diện Mission 2 (Phonics / Sentence Builder)**
  - Render các dòng chant/câu.
  - Xây dựng hiệu ứng highlight các từ vựng chứa âm đang luyện tập.
  - Cho phép học sinh đọc và thu âm từng dòng.
- [ ] **Task 3.4: Giao diện Mission 3 (Speaking Challenge)**
  - Hiển thị toàn bộ Script.
  - Thu âm toàn bộ bài đọc và trả về kết quả tổng hợp.
  - Xây dựng màn hình "Bonus" khi học sinh hoàn thành cả 3 nhiệm vụ (Hiển thị mèo Brave khen "Awesome" + hiệu ứng nhận 3 Leaves).

## Phase 4: Phát triển Tính năng Nâng cao (Enhance)
- [ ] **Task 4.1: Parent Dashboard**
  - Xây dựng trang Dashboard dành riêng cho Role `Parent`.
  - Fetch và hiển thị các chỉ số của con: % Speaking, tiến độ Writing, Tổng số Leaf, Chuỗi Streak.
- [ ] **Task 4.2: Learning Journey (Gamification)**
  - Thiết kế UI hiển thị cây học tập của học sinh.
  - Viết logic thay đổi trạng thái hình ảnh cây dựa trên điều kiện: Seed -> Young Leaf -> Green Leaf -> Strong Tree -> Garden (Dựa vào số bài tập hoàn thành).

## Phase 5: Testing & Deployment (Dành cho Infra/Deploy Team)
- [ ] **Task 5.1: Viết Unit Test**
  - Viết test cho các logic tính điểm, cộng Leaf, cập nhật Streak.
- [ ] **Task 5.2: Chuẩn bị môi trường Production**
  - Đóng gói ứng dụng (Dockerize) với `Dockerfile` và `docker-compose.yml`.
  - Cấu hình biến môi trường (ENV) cho Database, API Keys (OpenAI, S3...).
- [ ] **Task 5.3: Deploy lên Server**
  - Thiết lập CI/CD pipeline để tự động build và deploy.
  - Triển khai ứng dụng lên production server, thiết lập Nginx, SSL/HTTPS.
