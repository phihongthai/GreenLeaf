# GreenLeaf Mobile (React Native / Expo)

Ứng dụng di động Native 100% dành cho Học sinh GreenLeaf, được xây dựng theo kiến trúc **Client-Driven State Machine** mượt mà như Duolingo (chạy 60–120 FPS, không dùng WebView).

## 🌟 Tính năng chính
- **Native 100%:** Dựng hình bằng chip GPU qua React Native / iOS UIKit, loại bỏ hoàn toàn độ trễ của trình duyệt web.
- **Duolingo-style Lesson Path:** Bản đồ bài học cuộn mượt mà, hiển thị thanh tiến độ %, chuỗi ngày Streak lửa 🔥, và số lá 🍃 tích lũy.
- **Client State Machine:** Toàn bộ nội dung bài học (Words Explorer, Phonics Chant, Speaking Challenge) được tải vào RAM trong 1 payload duy nhất. Chuyển câu hỏi, phát âm từ vựng phản hồi tức thì 0ms.
- **Lưu phiên đăng nhập:** Tự động ghi nhớ tài khoản bằng `AsyncStorage`.
- **Mascot Leafy:** Tích hợp ảnh và hoạt hình của chú sóc Leafy cùng hệ thống phát âm tiếng Anh chuẩn.

## 🚀 Hướng dẫn chạy thử trên iPhone ngay lập tức (Không cần Xcode)

### Cách 1: Chạy bằng Expo Go (Khuyên dùng - Nhanh nhất)
1. Tải ứng dụng miễn phí **Expo Go** trên App Store về iPhone của bạn.
2. Đảm bảo iPhone và máy tính cùng kết nối chung một mạng Wi-Fi.
3. Trên máy tính, mở terminal tại thư mục `mobile`:
   ```bash
   cd mobile
   npx expo start
   ```
4. Terminal sẽ hiện ra một mã **QR Code**.
5. Mở ứng dụng **Camera** trên iPhone quét mã QR -> Chọn mở bằng **Expo Go**.
   * App GreenLeaf Native sẽ khởi chạy ngay lập tức trên iPhone của bạn với tốc độ 120Hz siêu mượt!

---

### Cách 2: Biên dịch Native Xcode Project (`ios/`)
Nếu bạn muốn tạo file dự án Xcode thuần để cắm cáp nạp vào iPhone:
```bash
cd mobile
npx expo run:ios
```
Lệnh này sẽ tự động sinh thư mục `ios/` chứa mã nguồn Swift / Objective-C và mở trực tiếp trong Xcode.
