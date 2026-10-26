# BÁO CÁO PHẢN BIỆN TOÀN DIỆN: WEB APP GREENLEAF VÀ ĐỘ LỆCH THỰC TẾ NGOẠI THÀNH

**Người thực hiện**: Explorer Web (`explorer_web_1`)  
**Đối tượng khảo sát**: Hệ thống Web (`app/`, `components/`, `lib/`, `public/`)  
**Môi trường thực tế đối chiếu**: Trẻ em 4-10 tuổi và phụ huynh công nhân khu công nghiệp (KCN Thăng Long, Quang Minh, Nội Bài) tại ngoại ô Hà Nội.

---

## 1. Observation (Quan sát thực tế trong mã nguồn)

Dưới đây là các bằng chứng trích xuất trực tiếp từ mã nguồn, đối chiếu với bối cảnh thiết bị giá rẻ (màn hình 360px, mạng 3G/4G chập chờn) và phụ huynh làm ca kíp:

### 1.1. Luồng xác thực & Khởi động (Auth & Onboarding)
- **Đăng nhập bắt buộc tài khoản văn bản**: `app/app/login/page.tsx:93-114`. Trẻ phải tự nhập `identifier` (username hoặc email) và `password`. Hệ thống ánh xạ ngầm `username@greenleaf.local` (dòng 108). Toàn bộ giao diện đăng nhập bằng tiếng Anh 100% ("I am a...", "Student", "Use the username your teacher gave you."). Không có cơ chế đăng nhập bằng mã QR thẻ học sinh, không có PIN hình ảnh (chọn hình con vật), không có token lưu vĩnh viễn trên máy của trẻ, không có chế độ dùng thử một chạm cho người học thật (chỉ có nút cứng cho dev `student.demo` ở dòng 244-258).
- **Màn hình chào ép buộc chờ đợi**: `app/app/login/page.tsx:29-87`. Khi đăng nhập thành công vai trò học sinh, hàm `WelcomeScreen` ép hẹn giờ `setTimeout 1500ms` và `2200ms` để hình ảnh Leafy trượt vào, sau đó bắt trẻ phải bấm thêm một nút `"🚀 Let's go!"` (dòng 73-82) mới được chuyển hướng vào bài học.
- **Tải tài sản nặng tại trang đăng nhập**: `app/public/leafy/hero_wave.webp` có dung lượng **1.0 MB** (`1,061,608 bytes`), được gọi qua thẻ `<img>` trần (`app/app/login/page.tsx:53-59`), không qua trình tối ưu ảnh của Next.js (`next/image`), ép thiết bị 3G tải 1MB chỉ để xem màn hình chào 2 giây.
- **Rào cản hướng dẫn 5 bước chắn màn hình**: `app/components/student/FirstTimeGuide.tsx:6-32`. Trẻ đăng nhập lần đầu bị chặn bởi cửa sổ pop-up 5 trang toàn chữ tiếng Anh ("Each lesson has 3 parts. Listen to the sample first, then tap the green button to record yourself..."). Trẻ 4-6 tuổi chưa biết chữ tiếng Việt, không thể đọc hiểu tiếng Anh, không biết tìm nút "Skip" hay "Next" để thoát.

### 1.2. Bản đồ học tập & Điều hướng trên màn hình nhỏ (360px)
- **Vỡ giao diện nghiêm trọng trên màn hình 360px**: `app/components/missions/StudentWorldMap.tsx:130-132`.
  ```tsx
  <div className="relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 bg-[#aed9a8] select-none">
    <div className="relative w-full aspect-[16/9] min-w-[760px] md:min-w-0 overflow-hidden">
  ```
  Bản đồ đặt chiều rộng tối thiểu `min-w-[760px]`, nhưng bọc ngoài bằng `overflow-hidden` không có thanh cuộn ngang `overflow-x-auto`. Trên điện thoại Android phổ thông (màn hình rộng 360px - 375px), hơn 400px bên phải bị cắt cụt hoàn toàn.
  - Vị trí Unit 1: `left: 44.8%` (ở mốc ~340px, sát mép phải màn hình).
  - Vị trí Unit 2: `left: 56.6%` (mốc ~430px, nằm ngoài màn hình).
  - Vị trí Unit 3: `left: 73.0%` (mốc ~554px, nằm ngoài màn hình).
  - Vị trí Unit 4: `left: 81.8%` (mốc ~621px, nằm ngoài màn hình).
  Trẻ dùng điện thoại dọc 360px hoàn toàn không thể nhìn thấy và không thể bấm vào các bài học từ Unit 2 đến Unit 4.
- **Ẩn chế độ xem danh thức dọc (List Mode)**: `app/app/grades/page.tsx:33`. Mặc định biến `viewMode` là `'map'`. Chế độ cuộn dọc thân thiện với điện thoại (`LessonPathList.tsx`) bị giấu sau nút bấm nhỏ dạng icon ở góc trên bên phải (dòng 271), trẻ nhỏ không tự phát hiện được.
- **Rào cản xác nhận qua từng bước bài học**: `app/app/missions/[gradeCode]/[lessonId]/page.tsx:246-265`.
  - Trước mỗi phần học (Words, Phonics, Speaking): Hiện cửa sổ `MissionIntro.tsx`, ép trẻ bấm nút "Let's Start! 🚀".
  - Sau mỗi phần học: Hiện màn hình chúc mừng `MissionCelebration.tsx`, ép trẻ bấm nút "Continue →".
  Một bài học 3 phần ép trẻ phải bấm thêm ít nhất 6 lần vào các cửa sổ trung gian chỉ để chuyển màn hình.

### 1.3. Đầu phát bài học, Công nghệ chấm phát âm & Rò rỉ tài nguyên
- **Rò rỉ nghiêm trọng đối tượng AudioContext gây đứng mic**:
  - `app/components/Recorder.tsx:52`: Mỗi lần bấm ghi âm tạo một đối tượng mới `const audioContext = new AudioContext();` nhưng trong hàm `stopRecording` (dòng 30-40) và hàm dọn dẹp (dòng 96-102) **hoàn toàn không gọi `audioContext.close()`**.
  - `app/lib/audio.ts:8`: Hàm chuyển đổi file ghi âm sang WAV tạo thêm một đối tượng `new AudioContext({ sampleRate: targetSampleRate })` nhưng cũng **không đóng**.
  Trên trình duyệt Safari iOS và Chrome Android, giới hạn phần cứng là 6 đối tượng `AudioContext` đồng thời. Sau 3 lần trẻ bấm thu âm thử lại, bộ nhớ trình duyệt chạm trần, trình duyệt từ chối cấp luồng ghi âm tiếp theo và ném lỗi. Hệ thống hiển thị thông báo lỗi tiếng Anh: *"Could not access the microphone. Please check your browser permissions."* (`Recorder.tsx:92`), đánh lừa người dùng rằng mic bị cấm, trong khi nguyên nhân gốc là rò rỉ bộ nhớ mã nguồn.
- **Chấm điểm Azure gắt gao, triệt tiêu động lực trẻ em**:
  - `app/components/missions/WordsExplorer.tsx:18`, `PhonicsChant.tsx:18`, `SpeakingChallenge.tsx:18`: Ngưỡng điểm đạt cứng là `const PASS_THRESHOLD = 80;`.
  - Đánh giá phát âm gọi trực tiếp Azure Speech STT `en-US` (`app/app/api/assess/route.ts:52-62`). Azure tính điểm phát âm theo chuẩn giọng người lớn bản xứ. Trẻ 4-6 tuổi tại ngoại ô phát âm tiếng Anh ngọng nghịu hoặc âm lượng nhỏ thường chỉ đạt 40-65 điểm.
  - Hậu quả: Trẻ bị chấm rớt liên tiếp lần 1, lần 2. Nút bỏ qua (`canSkip`) chỉ xuất hiện sau khi đã rớt 3 lần (`attempts >= MAX_ATTEMPTS`). Nếu trẻ nói câu dài trong `PhonicsChant` hoặc `SpeakingChallenge`, việc đạt 80 điểm gần như bất khả thi.
- **Phản hồi sư phạm xa rời lứa tuổi**: `app/components/ScoreDisplay.tsx:117-138`. Hiển thị 4 cột chỉ số kỹ thuật: `Accuracy`, `Fluency`, `Completeness`, `Prosody`. Kèm theo ký tự phiên âm quốc tế IPA dạng `toIPA(p.phoneme)` (như `/æ/`, `/θ/`, `/ʃ/`). Trẻ mầm non và tiểu học ngoại ô hoàn toàn không hiểu các thuật ngữ này.
- **Bài tập về nhà bắt gõ văn bản trên điện thoại**: `app/app/homework/page.tsx:142-156`. Trẻ phải nhập câu trả lời vào thẻ `<textarea rows={5}>` bằng bàn phím ảo điện thoại. Hoàn toàn không có tính năng chụp ảnh trang vở viết tay bằng camera điện thoại.
- **Gánh nặng đồ họa và hoạt họa tiêu tốn pin**: `app/app/globals.css:60-160`. Chạy liên tục 6 hoạt họa CSS vô tận (`gl-float`, `gl-sparkle`, `gl-glow-pulse`, `gl-bounce-jump`, `gl-wave`, `gl-pulse-ring`) cùng các lớp nền động (`FloatingDecor.tsx`, `SceneBackground.tsx`). Trên máy Android đời cũ pin chai, việc duy trì vẽ liên tục trên GPU làm máy nóng ran và tụt pin nhanh.

### 1.4. Điểm nghẽn mạng chập chờn & Cơ chế Offline
- **Phụ thuộc mạng 100%, không có Service Worker / PWA**: Không có tệp `sw.js`, `manifest.json` hay cơ chế lưu trữ đệm IndexedDB/localStorage cho nội dung bài học. Khi mạng 3G/4G tại phòng trọ chập chờn, tải trang trắng trơn (`ERR_INTERNET_DISCONNECTED`).
- **Gửi âm thanh dạng thô lên máy chủ**: `app/lib/azure.ts:27-45`. Thu âm xong chuyển thành WAV PCM 16kHz không nén rồi tải toàn bộ dữ liệu âm thanh lên máy chủ Next.js `/api/assess`, máy chủ tiếp tục gửi tiếp sang Azure. Khi đường truyền tải lên (uplink) bị nghẽn, yêu cầu bị timeout, ném lỗi *"Could not score your recording. Please try again."*. Biến `attempts` không tăng khi gặp lỗi mạng, khiến nút `canSkip` không bao giờ xuất hiện, trẻ bị kẹt cứng trong bài học.
- **Chính sách đóng gói Capacitor hình thức**: `app/capacitor.config.ts:9`. Thuộc tính `server.url` trỏ thẳng về `https://green-leaf-snowy.vercel.app`. Đây thực chất chỉ là một khung WebView tải web từ xa, không hề chứa mã nguồn hay tài sản offline cục bộ trong gói ứng dụng.

### 1.5. Giao diện phụ huynh (Parent Loop)
- **Đòi hỏi tài khoản riêng biệt**: `app/app/login/page.tsx:24`. Bắt phụ huynh đăng nhập bằng Email và Password. Phụ huynh công nhân làm ca kíp không dùng email hàng ngày và không nhớ mật khẩu tài khoản web.
- **Liên kết phụ huynh - học sinh thủ công**: `app/app/teacher/accounts/page.tsx:350-375`. Phụ huynh không thể tự quét mã QR hay nhập số điện thoại để nhận con. Giáo viên phải tự mở trang quản trị tài khoản, chọn phụ huynh từ danh sách và tích từng học sinh để cập nhật cột `parent_id`.
- **Nội dung báo cáo xa lạ, bằng tiếng Anh**: `app/app/parent/dashboard/page.tsx:68-154`.
  - Toàn bộ bằng tiếng Anh: "Speaking done", "Writing Submitted / Not yet", "Leaves earned", "Day streak", "Quick Tip: Practicing 10 minutes every day...".
  - Chi tiết lịch sử (`app/components/StudentHistory.tsx:118-152`): Liệt kê danh sách hàng chục dòng log kỹ thuật chấm điểm Azure kèm điểm số thô và dấu X đỏ/v tick xanh (`Words Explorer — "apple" | 78`, `Phonics — "The cat" | 64`).
  - Phụ huynh đi làm ca về mệt mỏi, nhìn vào bảng điểm thấy toàn số và chữ tiếng Anh cùng dấu gạch đỏ sẽ hoang mang, không biết con học được gì, không có file ghi âm giọng nói của con để nghe lại trong 5 giây.
- **Thiếu vắng kết nối một chạm qua Zalo/SMS**: Không có webhook hay tích hợp thông báo qua Zalo ZNS / Zalo Bot.

### 1.6. Tuyên bố "English Immersion 100%" giáo điều
- `app/README.md:8`: *"Nguyên tắc English Immersion: Toàn bộ giao diện người dùng, nội dung bài học, feedback gợi ý của AI (Gemini), và nghĩa giải thích từ vựng đều sử dụng tiếng Anh 100%. Đây là quyết định sư phạm cốt lõi đã được chốt (không tự ý đưa lại tiếng Việt vào app)."*
- Migration `0017_word_meanings_english.sql`: Xóa toàn bộ nghĩa tiếng Việt của từ vựng đã seed ở migration `0011` ("con mèo", "con chó", "con thằn lằn") để thay bằng định nghĩa tiếng Anh dài dòng:
  - `lizard` -> *"a small animal with scaly skin"*
  - `rat` -> *"a small animal with a long tail"*
  - `bird` -> *"an animal that can fly"*
  Trẻ 5-6 tuổi không hiểu "scaly skin" là gì. Việc loại bỏ hoàn toàn tiếng mẹ đẻ biến việc học thành đọc vẹt âm thanh, mất hoàn toàn liên kết ngữ nghĩa thực tế.

---

## 2. Logic Chain (Lập luận từ quan sát đến đánh giá)

1. **Từ rào cản đăng nhập văn bản và pop-up tiếng Anh (`login/page.tsx`, `FirstTimeGuide.tsx`)**:
   - Trẻ 4-6 tuổi tại ngoại thành chưa thạo bảng chữ cái tiếng Việt, không thể nhớ chuỗi ký tự `username/password` và không thể đọc văn bản tiếng Anh.
   - Do không có cơ chế QR một chạm hoặc mã PIN con vật, trẻ bắt buộc phải nhờ bố mẹ đăng nhập hộ mỗi lần phiên làm việc hết hạn.
   - Bố mẹ làm việc theo ca, không có mặt ở nhà lúc trẻ rảnh. Kết quả: trẻ không thể tự giác mở máy học độc lập.

2. **Từ lỗi cắt cụt màn hình của bản đồ học tập (`StudentWorldMap.tsx:132`)**:
   - Bản đồ gán cứng `min-w-[760px]` nhưng cha bọc `overflow-hidden`. Màn hình điện thoại giá rẻ chỉ rộng 360px.
   - Các điểm học từ Unit 2 đến Unit 4 nằm ở tọa độ từ 430px đến 621px, rơi hoàn toàn ra ngoài phần nhìn thấy được và không cuộn ngang được.
   - Giao diện danh sách dọc (`LessonPathList.tsx`) có sẵn nhưng bị giấu sau nút bấm nhỏ. Trẻ bị chặn đứng hành trình học ngay trên màn hình chính.

3. **Từ rò rỉ đối tượng AudioContext và thuật toán ghi âm (`Recorder.tsx:52`, `audio.ts:8`)**:
   - `AudioContext` không được gọi hàm `.close()` khi dừng thu âm hoặc hủy component.
   - Trình duyệt di động giới hạn tối đa 6 bối cảnh âm thanh. Sau vài lần thu âm phát âm sai và thử lại, trình duyệt khóa luồng âm thanh.
   - Trẻ gặp lỗi mic bị chặn ảo, bài học treo đứng, không thể tiếp tục hoàn thành.

4. **Từ áp đặt chuẩn chấm điểm người lớn 80 điểm và phụ thuộc mạng thô (`azure.ts`, `route.ts`)**:
   - Trẻ nhỏ phát âm ngọng líu lo theo phản xạ tự nhiên. Đặt ngưỡng 80 điểm trên engine Azure tiếng Anh chuẩn bản xứ khiến trẻ nhận liên tiếp thông báo thất bại ("Try again!").
   - Khi mạng yếu, file âm thanh WAV không nén tải lên bị đứt đoạn, hệ thống báo lỗi mạng nhưng không tăng số lần thử, triệt tiêu cơ chế bỏ qua bài (`canSkip`).
   - Trẻ bị ức chế tâm lý, cảm thấy bất lực và bỏ học.

5. **Từ quy chuẩn "English Immersion 100%" và bài tập viết văn (`homework/page.tsx`, `0017_word_meanings_english.sql`)**:
   - Giải thích từ "lizard" bằng cụm từ "a small animal with scaly skin" cho trẻ mầm non là tư duy giáo điều của người lớn ngồi phòng máy lạnh.
   - Bắt trẻ tiểu học gõ đoạn văn tiếng Anh vào `<textarea>` trên bàn phím cảm ứng nhỏ hẹp đi ngược lại kỹ năng vận động tinh của lứa tuổi (viết tay trên giấy ô ly).

6. **Từ mô hình Dashboard phụ huynh trên Web (`parent/dashboard/page.tsx`)**:
   - Phụ huynh công nhân sau 10-12 tiếng tăng ca mệt mỏi không có thời gian mở trình duyệt, đăng nhập email, dịch chữ tiếng Anh và soi từng dòng nhật ký chấm điểm.
   - Việc hiển thị các điểm số thấp kèm dấu chéo đỏ tạo ra áp lực tâm lý tiêu cực thay vì niềm vui thấy con tiến bộ.
   - Sự vắng mặt của kênh thông báo Zalo ngắn gọn (kèm trích đoạn âm thanh 5 giây giọng con nói) làm đứt gãy hoàn toàn vòng lặp gắn kết giữa trung tâm, học sinh và gia đình.

---

## 3. Caveats (Các điểm giới hạn & Giả định)

1. **Phạm vi khảo sát**: Báo cáo này tập trung rà soát mã nguồn ứng dụng Web (`app/`), chưa phân tích sâu mã nguồn native bên trong thư mục `mobile/` (React Native/Expo).
2. **Kiểm thử trên thiết bị thực tế**: Các số đo kích thước viewport 360px và hành vi `AudioContext` được phân tích dựa trên đặc tả kỹ thuật của trình duyệt Chromium/WebKit trên Android phổ thông và iOS; chưa trực tiếp chạy trên thiết bị vật lý có gắn SIM 3G tại hiện trường nhà trọ.
3. **Mục tiêu giáo dục**: Nguyên tắc English Immersion ban đầu được đặt ra với ý định tốt nhằm tạo môi trường đắm chìm ngôn ngữ, nhưng áp dụng máy móc lên toàn bộ vỏ giao diện (UI chrome), hệ thống chỉ dẫn vận hành và bảng tin phụ huynh đã tạo ra rào cản kỹ thuật nghiêm trọng.

---

## 4. Conclusion (Kết luận & Chấm điểm phù hợp thực tế)

Hệ thống Web GreenLeaf hiện tại được xây dựng với kỹ thuật hiện đại (Next.js 14, Tailwind, Supabase, Azure Speech), nhưng mang nặng tư duy thiết kế "trên giấy" dành cho học sinh thành thị dùng máy tính bảng hoặc laptop, có phụ huynh kèm cặp biết tiếng Anh. Đối với gia đình công nhân ngoại thành, hệ thống tồn tại nhiều điểm nghẽn kỹ thuật khiến trẻ không thể tự học và phụ huynh bị đẩy ra ngoài rìa.

### Bảng điểm mức độ phù hợp thực tế (Thang điểm 1 - 10)

| Cụm tính năng | Điểm | Điểm nghẽn cốt tử |
|---|:---:|---|
| **1. Auth & Onboarding** | **3 / 10** | Bắt nhập username/password bằng chữ; ép chờ màn hình chào 2.2s; hướng dẫn 5 trang tiếng Anh chắn màn hình; thiếu đăng nhập 1 chạm QR/PIN hình ảnh. |
| **2. Map & Path (Bản đồ & Lộ trình)** | **2 / 10** | Bản đồ gán cứng `min-w-[760px]` kèm `overflow-hidden` làm vỡ giao diện trên màn hình 360px, cắt cụt Unit 2, 3, 4; ẩn danh sách dọc; quá nhiều cửa sổ trung gian (6 click/bài). |
| **3. Lesson Player (Bộ phát bài học)** | **4 / 10** | Rò rỉ `AudioContext` gây tê liệt mic sau 3 lần thử; ngưỡng điểm Azure 80 quá khắt khe với trẻ 4-6 tuổi; định nghĩa từ vựng tiếng Anh đánh đố; bài tập viết bắt gõ bàn phím ảo. |
| **4. Parent Interface (Giao diện phụ huynh)** | **2 / 10** | Web Dashboard 100% tiếng Anh; bắt đăng nhập email; bảng điểm liệt kê chi tiết gây áp lực; không có kết nối Zalo một chạm sau ca làm việc. |
| **Tổng thể trải nghiệm ngoại ô** | **2.8 / 10** | **Không phù hợp cho trẻ tự học độc lập và phụ huynh công nhân.** |

---

## 5. Verification Method & Action Plan (Phương pháp kiểm chứng & Kế hoạch hành động)

### 5.1. Phương pháp kiểm chứng độc lập (Verification Method)
1. **Kiểm chứng vỡ giao diện bản đồ trên màn hình 360px**:
   - Mở Chrome DevTools, chọn chế độ mô phỏng thiết bị di động, đặt kích thước màn hình `360 x 640` (chuẩn Galaxy A series phổ thông).
   - Truy cập trang `/grades`.
   - *Kết quả dự kiến*: Bản đồ học tập bị cắt mất hơn nửa bên phải, không thể cuộn ngang để bấm vào Unit 2, Unit 3, Unit 4.
2. **Kiểm chứng rò rỉ AudioContext làm đứng microphone**:
   - Vào bài học `/missions/kids1/demo-lesson-1`.
   - Thực hiện thao tác: Bấm nút Ghi âm -> Nói -> Bấm Dừng. Lặp lại thao tác này 6 lần liên tiếp.
   - Quan sát Console trong DevTools.
   - *Kết quả dự kiến*: Trình duyệt xuất hiện cảnh báo/lỗi vượt quá giới hạn phần cứng AudioContext; việc ghi âm ở lần thứ 7 thất bại hoặc bị mất tiếng.
3. **Kiểm chứng dung lượng ảnh đăng nhập**:
   - Chạy lệnh kiểm tra kích thước tệp: `ls -lh app/public/leafy/hero_wave.webp`.
   - *Kết quả thực tế*: Kích thước tệp là `1.0M`.
4. **Kiểm chứng định nghĩa từ vựng đánh đố**:
   - Tra cứu trong migration `app/supabase/migrations/0017_word_meanings_english.sql` dòng 24.
   - *Kết quả thực tế*: Từ `lizard` được định nghĩa bằng chuỗi `"a small animal with scaly skin"`.

---

### 5.2. Danh mục giải pháp kỹ thuật cụ thể (Action Plan)

#### Ưu tiên P0 (Khẩn cấp - Sửa lỗi tê liệt tự học & vỡ màn hình)
1. **Sửa rò rỉ AudioContext trong bộ thu âm**:
   - *Tệp cần sửa*: `app/components/Recorder.tsx`, `app/lib/audio.ts`.
   - *Giải pháp*: Lưu `AudioContext` vào `useRef`, gọi lệnh `audioContext.close()` ngay khi dừng thu âm và khi component unmount. Đóng `AudioContext` sau khi hoàn tất hàm `audioToWav`.
2. **Sửa lỗi hiển thị bản đồ trên màn hình 360px**:
   - *Tệp cần sửa*: `app/app/grades/page.tsx`, `app/components/missions/StudentWorldMap.tsx`.
   - *Giải pháp*: Trên màn hình di động (`< 640px` hoặc kiểm tra user-agent), mặc định chuyển ngay sang chế độ xem danh sách dọc `LessonPathList.tsx` thay vì `StudentWorldMap.tsx`. Nếu giữ bản đồ, phải hỗ trợ cuộn ngang mượt mà (`overflow-x-auto`) hoặc bố trí lại các điểm mốc theo tỷ lệ tương đối dọc.
3. **Cơ chế đăng nhập 1 chạm (Zero-Friction Auth)**:
   - *Tệp cần sửa*: `app/app/login/page.tsx`, `app/middleware.ts`.
   - *Giải pháp*: Bổ sung cơ chế quét thẻ học sinh chứa mã QR (dùng camera) hoặc mã PIN 4 số/hình ảnh con vật đơn giản. Lưu Refresh Token dài hạn vào thiết bị, không bắt đăng nhập lại sau mỗi phiên. Bỏ qua màn hình chào 2.2 giây, đưa thẳng trẻ vào bài học đang dở dang.

#### Ưu tiên P1 (Quan trọng - Tối ưu trải nghiệm trẻ em & mạng yếu)
1. **Hạ ngưỡng điểm Azure & Thay đổi phản hồi phát âm**:
   - *Tệp cần sửa*: `app/components/missions/WordsExplorer.tsx`, `PhonicsChant.tsx`, `SpeakingChallenge.tsx`, `app/components/ScoreDisplay.tsx`.
   - *Giải pháp*:
     - Hạ ngưỡng đạt cho lứa tuổi mầm non xuống `PASS_THRESHOLD = 50 - 60`. Chỉ cần trẻ phát âm có phát ra tiếng và khớp âm đầu là cho qua.
     - Thay thế 4 chỉ số kỹ thuật (Accuracy, Prosody...) và bảng ký tự IPA bằng thang đánh giá 3 ngôi sao vui nhộn, lời khen bằng giọng nói tiếng Việt/tiếng Anh thân thiện từ Leafy.
     - Tự động dừng thu âm khi phát hiện im lặng (Voice Activity Detection cơ bản qua AnalyserNode) thay vì bắt trẻ tự bấm nút đỏ.
2. **Khôi phục song ngữ trực quan & Bỏ rào cản pop-up**:
   - *Tệp cần sửa*: `app/components/student/FirstTimeGuide.tsx`, `app/supabase/migrations/`, `app/components/missions/WordsExplorer.tsx`.
   - *Giải pháp*:
     - Bỏ cửa sổ chắn màn hình 5 slide văn bản. Thay bằng hướng dẫn chỉ tay bằng hoạt họa âm thanh 3 giây khi vào bài lần đầu.
     - Khôi phục nghĩa tiếng Việt ngắn gọn cho từ vựng ("lizard" -> "con thằn lằn") kết hợp hình ảnh minh họa lớn.
3. **Tối ưu tài nguyên thiết bị & Nén ảnh**:
   - *Tệp cần sửa*: `app/app/login/page.tsx`, `app/app/globals.css`.
   - *Giải pháp*: Nén `hero_wave.webp` từ 1.0MB xuống dưới 60KB hoặc dùng SVG. Tắt bớt các hiệu ứng CSS lặp vô tận trên thiết bị di động bằng media query `@media (prefers-reduced-motion)` hoặc lớp CSS nhẹ để bảo vệ pin máy yếu.

#### Ưu tiên P2 (Nâng cao - Kênh gắn kết phụ huynh công nhân)
1. **Thiết kế lại luồng báo cáo phụ huynh "1 chạm 5 giây"**:
   - *Tệp cần sửa*: `app/app/parent/dashboard/page.tsx`, bổ sung dịch vụ thông báo Zalo.
   - *Giải pháp*:
     - Không ép phụ huynh công nhân dùng Web Dashboard.
     - Tích hợp Zalo Bot / ZNS gửi tin nhắn tự động khi trẻ hoàn thành bài: *"Hôm nay bé Lyn đã đọc đúng 3 từ tiếng Anh về Đồ chơi. Bấm để nghe giọng con nói 5s: [Link Audio]. Bố mẹ hãy khen con nhé!"*.
     - Bổ sung tính năng chụp ảnh bài tập viết trong vở gửi cho giáo viên thay cho việc gõ văn bản trên bàn phím điện thoại.
