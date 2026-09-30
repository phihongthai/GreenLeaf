# GreenLeaf Mobile — Ứng dụng Di động Native (React Native / Expo SDK 52)

Ứng dụng di động Native 100% dành cho Học sinh Trung tâm Anh ngữ **GreenLeaf** (*"Grow Beyond"*), được xây dựng theo kiến trúc **Client-Driven State Machine** mượt mà chuẩn 60–120 FPS tương tự Duolingo (không sử dụng WebView).

- **Công nghệ nền tảng**: React Native 0.86, Expo SDK 52, TypeScript
- **Nền tảng mục tiêu**: iOS & Android
- **Kết nối Backend**: Supabase Cloud Production Database & Next.js API Services
- **Mã nguồn dự án Xcode**: `ios/GreenLeaf.xcodeproj`

---

## 🌟 Tính năng Cốt lõi & Trải nghiệm Người dùng

1. **Hiệu năng Native Tuyệt đối (Zero-WebView)**:
   - Toàn bộ giao diện được render trực tiếp thông qua chip GPU và hệ thống view native của iOS (UIKit) và Android, mang lại độ phản hồi mượt mà và tiết kiệm pin.
2. **Kiến trúc Client-Driven State Machine (0ms Latency)**:
   - Khi học sinh bấm vào bài học, toàn bộ dữ liệu 3 nhiệm vụ (Words Explorer, Phonics Chant, Speaking Challenge) được nạp vào bộ nhớ RAM trong 1 payload duy nhất.
   - Việc chuyển đổi giữa các câu hỏi, lật flashcard, và phát âm từ vựng phản hồi tức thì 0ms, không phụ thuộc vào tốc độ mạng hay độ trễ tải trang.
3. **Quy trình Luyện phát âm AI Native Chuẩn xác**:
   - **Ghi âm Native PCM 16kHz**: Sử dụng `expo-audio` kết hợp cấu hình `setAudioModeAsync` trên iOS, thu âm giọng nói với tần số lấy mẫu 16.000 Hz đơn kênh (mono) chuẩn yêu cầu của Microsoft Azure AI Speech Service.
   - **Chuyển đổi Base64 tương thích WinterCG**: Mã hóa file ghi âm sang chuỗi Base64 gửi trực tiếp đến API `/api/assess`.
   - **Bảo mật điểm số**: Nhận token HMAC từ server và gửi kèm khi hoàn thành bài học, chống gian lận điểm số.
4. **Phát âm Mẫu Chuẩn Bản xứ (Native TTS)**:
   - Tích hợp `expo-speech` điều khiển trực tiếp hệ thống tổng hợp giọng nói của hệ điều hành, đảm bảo âm thanh trong trẻo, không bị ngắt quãng hay xung đột phiên âm thanh với mic thu âm.
5. **Đầy đủ 4 Phân hệ Chức năng với Bottom Tab Bar**:
   - 🗺️ **Learn**: Bản đồ bài học Duolingo cuộn mượt mà, hiển thị cấp độ, ngọn lửa Streak 🔥, số lá tích lũy 🍃, linh vật Leafy tương tác sinh động và Hộp quà bí mật (Mystery Box).
   - 🌳 **Journey**: Bản đồ cây tăng trưởng theo 5 nấc phát triển (Seed ➔ Young Leaf ➔ Green Leaf ➔ Strong Tree ➔ Garden).
   - 📝 **Homework**: Danh sách bài tập viết được giao, gõ nội dung nộp bài và xem điểm số/nhận xét của giáo viên.
   - 👤 **Profile**: Hiển thị thông tin học sinh, cấp độ học, tổng thành tích và đăng xuất an toàn.
6. **Lưu phiên Đăng nhập Tự động (Session Persistence)**:
   - Sử dụng `@react-native-async-storage/async-storage` kết hợp Supabase Auth Client, tự động ghi nhớ phiên đăng nhập và tự làm mới access token mà không yêu cầu đăng nhập lại mỗi khi mở app.
   - Tự động hoàn thiện định danh username thành `<username>@greenleaf.local` giúp học sinh đăng nhập dễ dàng không cần nhớ cú pháp email.

---

## 🏛️ Cấu trúc Thư mục Mã nguồn (`mobile/`)

```
mobile/
├── App.tsx                      # Điều hướng chính: Kiểm tra phiên, quản lý 4 Tab & Màn hình bài học
├── app.json                     # Cấu hình Expo, Bundle ID, Permissions (Microphone)
├── index.ts                     # Entry point khởi chạy ứng dụng Expo
├── package.json                 # Khai báo phụ thuộc Expo SDK 52, React Native 0.86
├── tsconfig.json                # Cấu hình kiểm tra kiểu TypeScript
├── assets/                      # Tài nguyên tĩnh: icon, splash screen và bộ ảnh mascot Leafy
│   └── leafy/                   # Bộ ảnh WebP cảm xúc linh vật Leafy
├── src/
│   ├── screens/                 # Các màn hình chính của ứng dụng
│   │   ├── LoginScreen.tsx      # Đăng nhập học sinh bằng Username/Password
│   │   ├── StudentHomeScreen.tsx# Bản đồ bài học Duolingo, Streak, Leaves, Mystery Box
│   │   ├── LessonPlayerScreen.tsx # Trình luyện nói 3 nhiệm vụ (State Machine 0ms)
│   │   ├── JourneyScreen.tsx    # Cây tiến trình học tập
│   │   ├── HomeworkScreen.tsx   # Danh sách và trình soạn bài tập về nhà
│   │   └── ProfileScreen.tsx    # Hồ sơ học sinh và đăng xuất
│   ├── components/              # Các thành phần giao diện tái sử dụng
│   │   ├── AudioRecorderButton.tsx # Nút chạm/giữ ghi âm native kèm thanh sóng âm
│   │   ├── MysteryBox.tsx       # Giao diện hộp quà bí mật (khóa/mở khóa/gửi yêu cầu)
│   │   ├── ScoreDisplay.tsx     # Bảng hiển thị điểm số phát âm trực quan kèm biểu cảm Leafy
│   │   └── BottomTabBar.tsx     # Thanh điều hướng 4 Tab cố định dưới cùng
│   └── lib/                     # Các module nghiệp vụ và tích hợp dịch vụ
│       ├── assess.ts            # Kết nối API chấm phát âm Azure AI qua Base64 Audio
│       ├── audio.ts             # Cấu hình âm thanh iOS/Android, phát âm mẫu expo-speech
│       ├── supabase.ts          # Supabase Client kết nối Cloud DB với AsyncStorage
│       ├── theme.ts             # Bảng màu thương hiệu GreenLeaf, font chữ, icon
│       └── types.ts             # Định nghĩa kiểu dữ liệu TypeScript đồng bộ với Backend
└── ios/                         # Thư mục Native iOS Project (Xcode / Swift / CocoaPods)
    ├── GreenLeaf.xcodeproj
    ├── Podfile
    └── GreenLeaf/
        ├── Info.plist           # Khai báo quyền Micro (NSMicrophoneUsageDescription)
        └── AppDelegate.swift
```

---

## ⚙️ Cấu hình Môi trường (Environment Variables)

Ứng dụng đọc các biến môi trường thông qua tiền tố `EXPO_PUBLIC_`. Các giá trị mặc định đã được thiết lập sẵn trỏ trực tiếp đến máy chủ Production trên Cloud:

- `EXPO_PUBLIC_SUPABASE_URL`: URL của Supabase Cloud instance (`https://<your-project>.supabase.co`)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Anon Key của Supabase Cloud
- `EXPO_PUBLIC_API_URL`: URL của API Backend Vercel (`https://green-leaf-snowy.vercel.app`)

Nếu muốn kiểm thử với máy chủ cục bộ trong mạng LAN, có thể tạo file `.env` tại thư mục `mobile/`:
```env
EXPO_PUBLIC_API_URL=http://<IP_MAY_TINH_CUA_BAN>:3000
```

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### 1. Cài đặt phụ thuộc
```bash
cd mobile
npm install
```

### 2. Cách 1: Chạy thử tức thì trên iPhone/Android bằng Expo Go (Khuyên dùng)
1. Tải ứng dụng miễn phí **Expo Go** trên App Store (iOS) hoặc Google Play (Android).
2. Kết nối điện thoại và máy tính cùng chung một mạng Wi-Fi.
3. Chạy lệnh:
   ```bash
   npx expo start
   ```
4. Terminal sẽ in ra một mã **QR Code**. Dùng ứng dụng Camera trên điện thoại để quét mã QR và chọn mở bằng Expo Go.

### 3. Cách 2: Biên dịch Native iOS Xcode Project (`ios/`)
Dành cho việc chạy trên máy ảo iOS Simulator hoặc nạp trực tiếp qua cáp Lightning/Type-C vào iPhone:
```bash
# Cài đặt CocoaPods (nếu chưa có)
cd ios && pod install && cd ..

# Khởi chạy bản build Native
npx expo run:ios
```
Lệnh này sẽ tự động mở Xcode và biên dịch mã nguồn Swift/Objective-C trực tiếp sang thiết bị.

---

## 🎤 Kiến trúc Xử lý Âm thanh & Chấm Điểm Phát Âm (Audio Pipeline)

### 1. Cấu hình Audio Session trên iOS (`src/lib/audio.ts`)
Để tránh tình trạng ghi âm bị ngắt quãng hoặc không thu được tiếng trên thiết bị iOS thật, ứng dụng thiết lập Audio Mode chuẩn ngay khi khởi động:
```typescript
import { Audio } from 'expo-audio';

await Audio.setAudioModeAsync({
  allowsRecordingIOS: true,
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
});
```

### 2. Ghi âm định dạng PCM WAV 16kHz
- Tần số lấy mẫu: **16,000 Hz**
- Kênh âm thanh: **1 kênh (Mono)**
- Độ sâu bit: **16-bit PCM Linear**
- Định dạng xuất: File `.wav` tối ưu hóa chính xác cho Azure Cognitive Services Speech SDK.

### 3. Quy trình Gửi dữ liệu & Nhận Điểm số (`src/lib/assess.ts`)
1. Ứng dụng đọc file âm thanh từ bộ nhớ cục bộ bằng `fetch(audioUri)` và chuyển đổi sang `Blob`.
2. `FileReader` chuyển đổi Blob thành chuỗi Base64 an toàn.
3. Gửi request POST tới `/api/assess` kèm header `Authorization: Bearer <user_access_token>`.
4. Nhận kết quả chi tiết từng từ, từng âm vị (Phoneme) và token xác thực điểm số từ server.

---

## 🔧 Xử lý Sự cố Thường gặp (Troubleshooting)

| Vấn đề | Nguyên nhân | Cách khắc phục |
| :--- | :--- | :--- |
| **Không mở được mic trên iPhone** | Chưa cấp quyền micro trong iOS Settings | Vào *Settings* ➔ *Expo Go* (hoặc *GreenLeaf*) ➔ Bật mục *Microphone*. Đảm bảo `Info.plist` đã có `NSMicrophoneUsageDescription`. |
| **Không có tiếng phát âm mẫu** | Điện thoại đang ở chế độ gạt rung im lặng | `expo-speech` và `setAudioModeAsync` đã bật cờ `playsInSilentModeIOS: true`. Kiểm tra lại âm lượng đa phương tiện trên máy. |
| **Lỗi mạng khi gọi /api/assess** | Máy tính và điện thoại khác mạng Wi-Fi hoặc tường lửa chặn cổng 3000 | Mặc định app trỏ thẳng vào Vercel production URL. Nếu chạy local, dùng cờ tunnel: `npx expo start --tunnel`. |
| **Timeout kết nối cơ sở dữ liệu** | Trỏ vào địa chỉ LAN IP cũ | Kiểm tra `src/lib/supabase.ts`, ứng dụng đã được cấu hình trỏ thẳng vào Supabase Cloud Production. |
