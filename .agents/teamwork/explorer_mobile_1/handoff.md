# Handoff Report: Deep-Dive Audit of Mobile App (`mobile/`) for Low-End Devices & Suburban Industrial Families

**Agent**: Explorer Mobile (`explorer_mobile_1`)  
**Target Path**: `/Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/explorer_mobile_1/handoff.md`  
**Timestamp**: 2026-10-16T21:45:00Z  

---

## 1. Observation

### 1.1 App Entry, Splash & Auth Friction
* **Missing Splash Screen Configuration**:
  * File: `mobile/app.json` (lines 1-32).
  * Observation: Có file `mobile/assets/splash-icon.png` (17,547 bytes) nhưng trong `app.json` **hoàn toàn không khai báo key `"splash"`**. Trên thiết bị Android/iOS, Expo rơi vào màn hình trắng trơn (white screen flash) trong suốt thời gian nạp runtime và tải bundle.
* **Loading State đơn điệu**:
  * File: `mobile/App.tsx` (lines 47-53).
  * Code:
    ```typescript
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
        </View>
      );
    }
    ```
    Màn hình chỉ có vòng quay spinner trên nền màu kem `#F7F4EC`, không có hình ảnh linh vật hay thông điệp thân thiện với trẻ nhỏ.
* **Rào cản Đăng nhập bằng Chữ (100% English Text Input)**:
  * File: `mobile/src/screens/LoginScreen.tsx` (lines 89-112).
  * Bắt buộc học sinh phải gõ Account và Password bằng bàn phím ảo.
  * Toàn bộ nhãn, placeholder và nút bấm đều bằng tiếng Anh: `"Account"`, `"e.g. student.demo"`, `"Password"`, `"••••••••"`, `"Start Learning"`.
  * Không có mã PIN 4 số, không có chọn Avatar học sinh, không có quét thẻ QR (Camera QR Card) cho học sinh mầm non/tiểu học.
* **Nút Đăng xuất bẫy người dùng (Accidental Logout)**:
  * File: `mobile/src/screens/StudentHomeScreen.tsx` (lines 203-205).
  * Code:
    ```typescript
    <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.7}>
      <LogOut size={18} color="#64748B" />
    </TouchableOpacity>
    ```
  * Style: `logoutBtn` có kích thước ~38x38px (`padding: 10`, `borderRadius: 20`, icon size 18px), nằm ngay góc trên bên phải màn hình chính. Khi trẻ chạm tay vào góc trên này, ứng dụng gọi ngay `handleLogout` trong `App.tsx:41-45` mà **không hề có hộp thoại xác nhận (Confirmation Alert)**. Trẻ bị đá văng ra màn hình đăng nhập và không thể tự đăng nhập lại khi bố mẹ vắng nhà.

### 1.2 UX Tự học của Trẻ (0-click vs Đa chạm & Rào cản Chữ viết)
* **Luồng vào bài học đòi hỏi 5-6 lượt chạm (Không hề có 0-click / 1-click)**:
  1. Mở app -> Màn hình chính (`StudentHomeScreen`). Trẻ phải tự cuộn tìm đúng nấm bài học đang học (`isCurrent`).
  2. Bấm vào nấm bài học (Chạm 1).
  3. Màn hình chuyển sang Intro Screen (`LessonPlayerScreen.tsx:257-300`). Trẻ phải đọc khung thoại `"Hi! Let's practice ... together!"` và bấm nút `"GO! 🚀"` (Chạm 2).
  4. Vào câu hỏi (`WordsExplorer`), âm thanh TTS đọc từ sau 400ms. Trẻ phải bấm nút Mic (`AudioRecorderButton.tsx`) để bắt đầu thu âm (Chạm 3).
  5. Trẻ nói xong, máy **không tự ngắt**. Trẻ bắt buộc phải bấm tiếp vào nút vuông màu đỏ để DỪNG thu âm (Chạm 4).
  6. Sau khi AI chấm điểm, nếu đạt >= 80 điểm, trẻ phải bấm nút `"Great! Continue"` ở dưới đáy màn hình để sang từ tiếp theo (Chạm 5).
  * Tổng cộng: Một bài học có 3 từ + 3 câu chant + 1 câu speaking đòi hỏi từ **25 đến 35 thao tác chạm** liên tục.
* **Cơ chế Thu âm Hai Chạm (Two-tap Recording) không có VAD hoặc Timeout**:
  * File: `mobile/src/components/AudioRecorderButton.tsx` (lines 48-93).
  * Bấm lần 1: `recorder.record(); setRecording(true);`
  * Bấm lần 2: `await recorder.stop(); setRecording(false);`
  * Không có Voice Activity Detection (VAD) để tự động nhận biết trẻ đã nói xong.
  * Không có Timer tự ngắt (ví dụ sau 5 giây). Nếu một đứa trẻ 5 tuổi nói xong và buông máy, mic sẽ tiếp tục thu âm vô tận, làm nóng máy, ngốn pin và tạo ra file âm thanh hàng megabyte.
* **Giao diện 100% tiếng Anh học thuật, thiếu hoàn toàn giọng dẫn tiếng Việt**:
  * Toàn bộ 5 màn hình (`LoginScreen`, `StudentHomeScreen`, `LessonPlayerScreen`, `JourneyScreen`, `HomeworkScreen`, `ProfileScreen`) không có lấy một chữ tiếng Việt.
  * `ScoreDisplay.tsx` (lines 53-97): Hiển thị các chỉ số phân tích người lớn: `"Accuracy 85%"`, `"Fluency 80%"`, `"AI Word-by-Word Analysis"`, `"Omission"`.
  * `LessonPlayerScreen.tsx` (line 175-179): Khi bấm vào bài bị khóa, app hiện Alert tiếng Anh:
    `Alert.alert('🔒 Lesson Locked', 'Your teacher will unlock "${lesson.title}" when your class is ready! Keep practicing your open lessons! 🍃', [{ text: 'Got it!' }])`.
* **Màn hình Bài tập về nhà (`HomeworkScreen.tsx`) phi thực tế**:
  * File: `mobile/src/screens/HomeworkScreen.tsx` (lines 142-167).
  * Yêu cầu học sinh gõ văn bản tiếng Anh vào `<TextInput multiline numberOfLines={4}>` trên bàn phím điện thoại màn hình nhỏ. Trẻ mẫu giáo / lớp 1-2 chưa thạo gõ phím tiếng Việt chứ chưa nói tiếng Anh.
  * Không có chức năng nộp bài bằng giọng nói (Voice Note) hay chụp ảnh trang vở viết tay (Camera snap).

### 1.3 Phần cứng Yếu & Tài nguyên (Low-End Hardware & Assets)
* **File ảnh nặng 1.04MB giải mã trực tiếp trên UI Thread**:
  * File: `mobile/assets/leafy/hero_wave.webp` dung lượng **1,039,049 bytes (~1.04 MB)**.
  * Được import và render bằng thẻ `Image` mặc định của React Native tại:
    * `mobile/src/screens/LoginScreen.tsx` (line 73)
    * `mobile/src/screens/StudentHomeScreen.tsx` (line 226)
  * Dự án không cài đặt `expo-image` (vốn hỗ trợ decoding background trên C++ thread và disk caching chuyên dụng). Việc giải mã 1MB WebP trên thiết bị Android RAM 2GB (chip MediaTek Helio/Snapdragon 4xx) gây khựng đơ giao diện (UI drop frame).
* **Quản lý Vòng đời & Render (Lifecycle & Re-render)**:
  * File: `mobile/App.tsx` (lines 85-97).
  * Điều hướng bằng render có điều kiện (`currentTab === 'learn' && <StudentHomeScreen />`). Không dùng React Navigation hay Expo Router.
  * Mỗi khi chuyển Tab hoặc thoát từ `LessonPlayerScreen` về màn hình chính, `StudentHomeScreen` bị unmount hoàn toàn. Khi mở lại, component phải chạy lại toàn bộ `loadData()` từ đầu, bắn lại 5 API request tuần tự tới Supabase.
  * Không sử dụng `useMemo` hay `useCallback` trong bất kỳ màn hình nào.
* **Cấu hình Nền tảng Android bị bỏ quên**:
  * Thư mục `mobile/ios/` tồn tại với đầy đủ file Xcode Project (`GreenLeaf.xcodeproj`, `Podfile`), nhưng **hoàn toàn không có thư mục `android/`**.
  * File: `mobile/app.json`:
    * Không khai báo `"package": "com.greenleaf.academy"` trong block `"android"` (chỉ khai báo `"bundleIdentifier"` ở `"ios"`).
    * Không khai báo quyền Android permissions (`RECORD_AUDIO`, `INTERNET`, `ACCESS_NETWORK_STATE`).
  * File: `mobile/src/components/AudioRecorderButton.tsx` (lines 19-23):
    ```typescript
    android: {
      extension: '.wav',
      outputFormat: 'default',
      audioEncoder: 'default',
    }
    ```
    Trên Android, `outputFormat: 'default'` và `audioEncoder: 'default'` của hệ thống tạo ra định dạng AMR/3GP/AAC chứ **không phải PCM WAV**, dù file được đặt đuôi `.wav`. Khi file này gửi lên Azure Speech qua Backend, Azure STT sẽ báo lỗi giải mã do sai codec.
* **Phụ thuộc vào Native TTS của Hệ điều hành**:
  * File: `mobile/src/lib/audio.ts` (lines 27-31):
    ```typescript
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.05,
      rate,
    });
    ```
  * Trên các máy Android xách tay giá rẻ phổ biến ở Việt Nam (Xiaomi, Realme, Vivo nội địa), gói giọng đọc tiếng Anh Mỹ (`en-US`) của Google Text-to-Speech thường không được tải sẵn trong ROM. Khi gọi `Speech.speak()`, máy sẽ câm lặng hoặc cố gắng tải gói giọng từ Google Play trong nền (thất bại nếu không có mạng).
  * Không có cơ chế tải trước (pre-cache) file MP3 phát âm chuẩn từ giáo viên bản ngữ.

### 1.4 Khả năng Chịu lỗi Mạng Chập chờn & Cơ chế Offline (Network Resilience)
* **Không có Bộ nhớ đệm Cục bộ (Zero Offline Storage) cho Nội dung Học**:
  * `@react-native-async-storage/async-storage` chỉ được sử dụng duy nhất tại `mobile/src/lib/supabase.ts` (dòng 13) để lưu session token.
  * Không lưu cache danh sách bài học (`greenleaf_lessons`), nhiệm vụ (`greenleaf_missions`), cấp độ (`greenleaf_grades`) hay phần thưởng (`greenleaf_rewards`).
  * Nếu mạng 3G/4G chập chờn khi mở app: `StudentHomeScreen.tsx:141-144` bắt lỗi qua `console.warn` và để mảng `lessons` rỗng (`[]`). Trẻ sẽ thấy màn hình trắng kèm dòng chữ: `"No lessons available for your level yet."`.
* **Cơ chế Fake Điểm (Simulated Score) làm sai lệch việc học**:
  * File: `mobile/src/lib/assess.ts` (lines 104-114):
    ```typescript
    // Fallback score only when completely offline or backend unavailable
    const simulatedScore = Math.floor(Math.random() * 15) + 85;
    return {
      accuracyScore: simulatedScore,
      fluencyScore: Math.max(0, simulatedScore - 3),
      completenessScore: 100,
      prosodyScore: simulatedScore,
      overallScore: simulatedScore,
      token: `fallback-token-${Date.now()}`,
      words: [{ word: referenceText, accuracyScore: simulatedScore, errorType: 'None' }],
    };
    ```
  * Khi mạng 3G/4G tại phòng trọ bị rớt hoặc timeout khi gọi `/api/assess`, ứng dụng tự động sinh điểm ngẫu nhiên từ **85 đến 99 điểm**.
  * Vì ngưỡng đậu là 80 (`PASS_THRESHOLD = 80`), nên hễ rớt mạng là trẻ nói gì, hét to, hay để phòng trọ ồn ào tiếng tivi, quạt gió cũng đều được hệ thống chấm **85-99 điểm và tự động cho qua bài**!
* **Mất sạch Tiến độ khi Mạng rớt ở cuối bài học**:
  * File: `mobile/src/screens/LessonPlayerScreen.tsx` (lines 151-181):
    ```typescript
    try {
      // 1. Upsert progress vào Supabase
      await supabase.from('greenleaf_student_progress').upsert(progressRows, ...);
      // 2. Upsert rewards vào Supabase
      await supabase.from('greenleaf_rewards').upsert({...});
    } catch (err) {
      console.warn('Error saving progress:', err);
    } finally {
      setSaving(false);
      setStepIndex(missions.length + 1); // Vẫn chuyển sang màn hình Celebration!
    }
    ```
  * Nếu trẻ học xong bài lúc mạng 3G bị ngắt:
    * Lệnh `upsert` thất bại, lỗi bị catch và chỉ in ra console.
    * Ứng dụng **vẫn hiển thị màn hình chúc mừng** `"Awesome Job! +5 Leaves Earned"`.
    * Trẻ bấm `"Back to Learning Path"`, `StudentHomeScreen` tải lại dữ liệu từ Supabase -> Toàn bộ bài học vừa làm **vẫn ở trạng thái chưa hoàn thành, 0 lá được cộng thêm**.
    * Không có Offline Sync Queue (hàng đợi đồng bộ khi có mạng lại).
* **Tải dữ liệu âm thanh dạng Base64 cực kỳ tốn băng thông 3G/4G**:
  * File: `mobile/src/lib/assess.ts` (lines 36-77): File WAV 16kHz ghi âm từ máy được chuyển đổi sang chuỗi Base64 bằng FileReader trong bộ nhớ JS, làm tăng kích thước dữ liệu lên thêm 33%.
  * Mỗi lần trẻ thử phát âm (trung bình 3 lần/từ x 5 từ = 15 lần/bài), dung lượng tải lên tốn khoảng 3MB - 5MB data. Với các gói cước 4G theo ngày của phụ huynh công nhân, chỉ học vài bài là cạn kiệt dung lượng tốc độ cao.

### 1.5 Tính năng Phụ huynh (Parent Features)
* Tìm kiếm từ khóa `parent` trong toàn bộ thư mục `mobile/src`:
  * Kết quả: **0 tính năng**. Từ khóa `parent` chỉ xuất hiện trong mã màu CSS `transparent`.
  * Không có màn hình phụ huynh, không có bảng điều khiển dành cho bố mẹ, không có mã PIN khóa chế độ phụ huynh, không có liên kết chia sẻ tiến độ học qua Zalo.

---

## 2. Logic Chain

1. **Từ Quan sát 1.1 (Auth & Logout)**: Bắt buộc gõ email/password tiếng Anh và nút Logout không có xác nhận -> Trên thực tế, trẻ em công nhân (5-8 tuổi) dùng điện thoại một mình vào buổi tối khi bố mẹ tăng ca sẽ bị kẹt ngay tại màn hình đăng nhập hoặc vô tình chạm nút Logout làm mất quyền truy cập vào app.
2. **Từ Quan sát 1.2 (UX & Ghi âm)**: Việc đòi hỏi 5-6 lượt chạm mỗi bài, cơ chế ghi âm 2 chạm không có VAD/timeout, và toàn bộ hướng dẫn bằng chữ tiếng Anh học thuật -> Trẻ em không thể tự giác học độc lập. Trẻ bấm thu âm xong sẽ để máy chạy mãi hoặc bỏ dở vì không hiểu chữ tiếng Anh trên màn hình. Màn hình bài tập viết (`HomeworkScreen`) bắt gõ tiếng Anh trên điện thoại hoàn toàn bất khả thi với lứa tuổi này.
3. **Từ Quan sát 1.3 (Phần cứng & Android)**: File ảnh 1.04MB decode trực tiếp trên main thread, không có `android/` native build, codec âm thanh Android bị cấu hình sai (`default` encoder gán đuôi `.wav`), và phụ thuộc hoàn toàn vào TTS hệ điều hành -> Ứng dụng chưa từng được kiểm thử thực tế trên thiết bị Android phổ thông. Khi cài lên điện thoại Android giá rẻ của phụ huynh công nhân, app sẽ giật lag, tốn pin, không phát được âm thanh mẫu và chấm điểm thất bại.
4. **Từ Quan sát 1.4 (Chịu lỗi mạng & Caching)**: Không có cơ chế lưu trữ offline bằng SQLite/AsyncStorage, tự bịa điểm 85-99 khi mất mạng, và nuốt lỗi khi lưu tiến độ -> Trong môi trường sóng 3G chập chờn tại các khu nhà trọ ngoại ô, học sinh sẽ nhận điểm giả (học dối mà vẫn qua bài), hoặc bị mất sạch kết quả học tập sau khi hoàn thành bài học, gây ức chế và triệt tiêu động lực học tập của trẻ.
5. **Từ Quan sát 1.5 (Tính năng phụ huynh)**: Ứng dụng mobile không có bất kỳ kênh thông tin nào dành cho phụ huynh -> Bố mẹ công nhân đi làm ca 12 tiếng về không có thời gian và không thể kiểm tra con đã học được gì, biến chiếc điện thoại thành thiết bị giải trí không kiểm soát được.

---

## 3. Caveats

* **Phạm vi mã nguồn**: Đợt kiểm tra này tập trung chuyên sâu vào mã nguồn Native React Native/Expo trong thư mục `mobile/` và các endpoint backend liên quan trực tiếp (`app/app/api/assess/route.ts`).
* **Môi trường thử nghiệm thực tế**: Mã nguồn chưa có thư mục `android/` được prebuild sẵn, nên chưa thể đo đạc profiling chính xác FPS/RAM trên máy Android vật lý bằng Android Studio Profiler, mà suy luận từ cấu hình mã nguồn, phụ thuộc npm và kích thước tài nguyên tĩnh.

---

## 4. Conclusion & Actionable Recommendations

### Bảng Chấm điểm Độ phù hợp Thực tế (Thang điểm 1 - 10)

| Cụm tính năng | Điểm | Hiện trạng code | Thực tế hiện trường công nhân ngoại ô | Đánh giá trần trụi |
| :--- | :---: | :--- | :--- | :--- |
| **Auth & Onboarding** | **2/10** | Gõ text username/password tiếng Anh; nút Logout dễ bấm nhầm không xác nhận. | Bố mẹ tăng ca về muộn mệt mỏi; trẻ 5-7 tuổi không tự gõ được tài khoản. | Thiết kế cho người lớn có học thức gõ máy tính, không phải cho trẻ nhỏ tự học trên điện thoại. |
| **Map & Path (Bản đồ)** | **4/10** | Bản đồ nấm đẹp nhưng bắt bấm 3-4 lần mới vào bài; 5 truy vấn tuần tự; ảnh nặng 1.04MB; tiếng Anh 100%. | Trẻ cần mở app là vào bài ngay (0-click); mạng 3G phòng trọ tải 5 query dễ sập trắng màn hình. | Hình thức Duolingo học đòi nhưng thiếu tối ưu hiệu năng nền tảng; rớt mạng là hiện màn hình trắng. |
| **Lesson Player** | **3/10** | Thu âm 2 chạm không có VAD; TTS máy robot; mất mạng tự sinh điểm ảo 85-99; rớt mạng mất sạch tiến độ. | Trẻ nói xong ngồi đợi máy thu; sóng 3G yếu trẻ đọc sai vẫn 90 điểm; học xong mất bài vì không có offline sync. | "Học vẹt, điểm ảo". Cơ chế chấm điểm trở thành trò hề khi mạng chập chờn; triệt tiêu nỗ lực thật của trẻ. |
| **Parent Interface** | **0/10** | **Không có gì trên Mobile (0%)**. Chỉ có web dashboard phức tạp trên Next.js. | Bố mẹ công nhân không bao giờ mở máy tính vào web; chỉ dùng Zalo trên điện thoại. | Hoàn toàn bỏ rơi phụ huynh công nhân – đối tượng chi trả học phí chính cho trung tâm. |

---

### Danh mục Giải pháp Kỹ thuật Cần khắc phục (Action Plan)

#### Mức P0 (Khẩn cấp - Ảnh hưởng trực tiếp đến khả năng sống sót của app):
1. **Khắc phục lỗi Codec Âm thanh Android (`AudioRecorderButton.tsx`)**:
   * Sửa cấu hình Android recording preset sang chuẩn Linear PCM WAV hoặc đổi sang nén m4a/aac gửi lên API, không dùng `outputFormat: 'default'` với đuôi `.wav`.
2. **Loại bỏ cơ chế Fake Điểm khi Mất mạng (`assess.ts`)**:
   * Xóa bỏ đoạn mã tự sinh điểm ngẫu nhiên `Math.floor(Math.random() * 15) + 85`. Khi mất mạng, hiển thị thông báo trực quan bằng hình ảnh cho trẻ biết mạng đang yếu và cho phép lưu bản ghi âm vào máy để chấm lại sau.
3. **Thêm Hàng đợi Đồng bộ Ngoại tuyến (Offline Progress Queue)**:
   * Tích hợp `@react-native-async-storage/async-storage` hoặc `expo-sqlite` để lưu cục bộ toàn bộ tiến độ bài học và phần thưởng. Khi có kết nối mạng trở lại, một background sync worker sẽ tự động đẩy dữ liệu lên Supabase.
4. **Bảo vệ Nút Đăng xuất (`StudentHomeScreen.tsx`)**:
   * Chuyển nút Logout vào trong màn hình Profile hoặc thêm hộp thoại xác nhận kèm phép tính đơn giản (Parental Gate) để trẻ không vô tình bị đăng xuất.
5. **Nén lại toàn bộ Ảnh Linh vật Leafy**:
   * Nén file `mobile/assets/leafy/hero_wave.webp` từ **1.04MB xuống dưới 60KB** và chuyển sang dùng thư viện `expo-image` để decode đa luồng, tránh giật lag UI trên chip yếu.

#### Mức P1 (Quan trọng - Tối ưu UX 0-click & Mạng chập chờn):
1. **Chế độ Tự học 0-Click (Zero-Click Launch)**:
   * Khi mở app, nếu học sinh có bài học dở dang, ứng dụng tự động nhảy thẳng vào bài học đó mà không bắt cuộn tìm trên bản đồ nấm và không cần qua màn hình Intro thừa thãi.
2. **Thu âm 1 Chạm với Auto-Stop Timeout & VAD**:
   * Trẻ chỉ cần bấm 1 lần để nói, hệ thống tự động đếm ngược 4 giây và tự ngắt thu âm, gửi đi chấm điểm.
3. **Bổ sung Ngôn ngữ Tiếng Việt & Giọng dẫn Thân thiện**:
   * Thêm tệp cấu hình song ngữ. Toàn bộ nút bấm, thông báo động viên chuyển sang tiếng Việt gần gũi. Thay thế TTS máy bằng các file audio tiếng Việt ngắn gọn của cô giáo trung tâm (ví dụ: *"Bé nhắc lại theo cô nhé!"*).
4. **Cơ chế Đăng nhập 1 Chạm cho Trẻ**:
   * Bổ sung tính năng chọn ảnh đại diện hoặc mã PIN 4 số to rõ, hỗ trợ quét mã QR in trên thẻ học sinh bằng camera.
5. **Cấu hình chuẩn hóa Android (`app.json`)**:
   * Bổ sung `"package": "com.greenleaf.academy"`, `"splash"` configuration, và các quyền `android.permission.RECORD_AUDIO`.

#### Mức P2 (Nâng cao - Kết nối Phụ huynh Công nhân):
1. **Tích hợp Zalo Notification / Zalo Mini App**:
   * Thay vì bắt phụ huynh mở app kiểm tra, sau khi trẻ hoàn thành bài học, backend tự động gửi 1 tin nhắn Zalo kèm hình ảnh huy hiệu và tiến độ học: *"Hôm nay bé Nam đã luyện phát âm 3 từ mới đạt 3 sao 🌟"*. Bố mẹ liếc qua 5 giây là yên tâm.
2. **Cải tiến Màn hình Bài tập Viết (`HomeworkScreen.tsx`)**:
   * Hỗ trợ trẻ nộp bài tập bằng cách bấm nút ghi âm một câu nói ngắn (Voice Note) hoặc bấm chụp ảnh bài viết trong vở tập viết giấy gửi cho cô giáo.

---

## 5. Verification Method

Để kiểm chứng độc lập các quan sát và đánh giá trong báo cáo này:

1. **Kiểm chứng dung lượng file ảnh Leafy**:
   ```bash
   ls -lh /Users/phihongthai/tcbs/my-project/GreenLeaf/mobile/assets/leafy/hero_wave.webp
   ```
   *Kết quả thực tế: `1.0M` (1,039,049 bytes).*
2. **Kiểm chứng cấu hình Android trong `app.json`**:
   ```bash
   cat /Users/phihongthai/tcbs/my-project/GreenLeaf/mobile/app.json
   ```
   *Quan sát: Không có block `"splash"`, không có `"package"` trong block `"android"`.*
3. **Kiểm chứng cơ chế chấm điểm ảo khi mất mạng trong `assess.ts`**:
   Kiểm tra dòng 104-114 trong `mobile/src/lib/assess.ts`:
   *Xác nhận: Có đoạn code tự sinh điểm ngẫu nhiên 85 - 99 khi gặp lỗi mạng.*
4. **Kiểm chứng việc lưu tiến độ không có offline queue trong `LessonPlayerScreen.tsx`**:
   Kiểm tra dòng 143-181 trong `mobile/src/screens/LessonPlayerScreen.tsx`:
   *Xác nhận: Block catch chỉ có `console.warn`, block finally luôn gọi `setStepIndex(missions.length + 1)` bất chấp lưu thất bại.*
5. **Kiểm chứng sự thiếu vắng tính năng phụ huynh trên mobile**:
   ```bash
   grep -ri "parent" /Users/phihongthai/tcbs/my-project/GreenLeaf/mobile/src/
   ```
   *Kết quả: Chỉ khớp với chuỗi màu `transparent`.*
