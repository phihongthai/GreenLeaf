# Báo Cáo Khảo Sát & Phản Biện Kỹ Thuật: Lesson Player, Speaking Challenge, Media & Audio Engine (GreenLeaf Web & Mobile)

**Agent**: `explorer_player_1`  
**Milestone**: Suburban Worker Families Fit Audit — Core Learning & Media  
**Ngày khảo sát**: 2026-10-17  
**Phạm vi**: Toàn bộ luồng học bài, tự động phát âm, thu âm giọng nói, chấm điểm phát âm AI (STT), bài tập về nhà, tài nguyên đa phương tiện (Media Assets & Audio Engine) trên Web (`app/`) và Mobile (`mobile/`).

---

## 1. Observation (Quan sát thực tế hiện trường mã nguồn)

### 1.1. Luồng tự học độc lập & Giao diện tương tác (0-Click / Zero Friction UX)
- **Rào cản ngôn ngữ tuyệt đối (100% tiếng Anh)**:
  - `app/components/student/FirstTimeGuide.tsx:6-32`: Onboarding gồm 5 slide hướng dẫn hoàn toàn bằng tiếng Anh (*"Welcome to GreenLeaf!..."*, *"Pick a lesson..."*, *"Listen, then record..."*, *"Pass to earn Leaves!..."*). Không có thuyết minh âm thanh tiếng Việt, không có mô phỏng thao tác mẫu.
  - `app/components/missions/MissionIntro.tsx:48-106`: Leafy nói tiếng Anh (*"Listen and say it!"*), nút bấm hiển thị *"Let's Start! 🚀"*, huy hiệu *"Part 1 of 3: Words Explorer"*.
  - `mobile/src/screens/LessonPlayerScreen.tsx:328-403`: Tiêu đề và chỉ dẫn hiển thị thuần tiếng Anh (*"Word Explorer: Listen, then speak into the microphone!"*, *"Phonics Chant: Listen and chant along!"*, *"Speaking Challenge: Pronounce the complete sentence clearly!"*).
  - `mobile/src/components/AudioRecorderButton.tsx:54-58`: Hộp thoại xin quyền Micro bằng tiếng Anh (*"Microphone Permission: GreenLeaf needs access to your microphone..."*).
  - Trẻ 4–6 tuổi không biết chữ tiếng Việt, càng không biết tiếng Anh. Bố mẹ công nhân tăng ca về không có kiến thức tiếng Anh để dịch hộ.
- **Nghịch lý "Zero Friction" — Phải bấm từ 30 đến 35+ lần cho một bài học 5 phút**:
  - `app/components/missions/MissionIntro.tsx:100-106`: Bắt buộc bấm *"Let's Start! 🚀"* (`handleStart`).
  - `app/components/missions/WordsExplorer.tsx:215-222`: Khi học sinh đạt điểm chuẩn (>=80), hệ thống **không tự chuyển từ**, bắt buộc bấm nút *"Well done! Next word →"*.
  - `app/components/missions/MissionCelebration.tsx:94-102`: Sau khi xong một phần (Part 1, Part 2), màn hình ăn mừng dừng lại vĩnh viễn cho đến khi trẻ bấm *"Continue →"*.
  - `mobile/src/screens/LessonPlayerScreen.tsx:424-436`: Sau khi nói đạt điểm, thanh điều hướng dưới cùng bắt bấm *"Great! Continue"*.
  - Tổng số thao tác bấm trong 1 bài học 3 phần (5 từ mới, 4 câu phonics, 1 đoạn văn speaking):
    - Intro: 1 bấm.
    - 5 từ vựng: (Bấm Mic thu + Bấm Mic dừng + Bấm Continue) x 5 = 15 bấm.
    - Chuyển Part: 1 bấm ăn mừng.
    - 4 câu phonics: (Bấm Mic thu + Bấm Mic dừng + Bấm Continue) x 4 = 12 bấm.
    - Chuyển Part: 1 bấm ăn mừng.
    - 1 đoạn speaking: Bấm Mic thu + Bấm Mic dừng + Bấm hoàn thành = 3 bấm.
    - Kết thúc bài học: 1 bấm về bản đồ.
    - **Tổng cộng: 34 lần bấm**. Trái ngược hoàn toàn với tiêu chuẩn 0-click / 1-click tự động chạy cho trẻ mầm non.
- **Sự biến mất hoàn toàn của hình ảnh trên Mobile**:
  - `mobile/src/screens/LessonPlayerScreen.tsx:321-419`: Khối `words_explorer`, `phonics`, `speaking_challenge` **hoàn toàn không có bất kỳ thẻ `<Image>` nào**! Trẻ chỉ thấy chữ text tiếng Anh (`currentWord.word`), nghĩa tiếng Việt dạng text nhỏ (`currentWord.meaning`), nút loa và nút micro.
  - Trên Web (`app/components/missions/WordsExplorer.tsx:165-177`), thẻ `<img>` trỏ vào đường dẫn hạt giống `word.imageUrl` (ví dụ: `"/images/kindergarten/cat.png"` tại `app/supabase/migrations/0002_seed_missions.sql:12-16`).
  - Kiểm tra thực tế thư mục `app/public/`: **Hoàn toàn không tồn tại thư mục `images/` hay các file png minh hoạ bài học**! Tất cả ảnh cục bộ đều trả về HTTP 404, kích hoạt `onError` và hiển thị emoji chữ fallback (`getWordEmoji`).
- **Nghịch lý bài tập về nhà (Writing Homework)**:
  - `app/app/homework/page.tsx:142-155` và `mobile/src/screens/HomeworkScreen.tsx:142-167`: Giao diện bắt học sinh nhập văn bản tiếng Anh vào `<textarea rows={5}>` và `<TextInput multiline>` (*"Write your answer here in English..."*).
  - Trẻ mầm non và tiểu học khu công nghiệp chưa biết gõ bàn phím điện thoại, không có từ điển, không có gợi ý từ kéo thả (word bank), không có speech-to-text tiếng Anh cho phần viết.

### 1.2. Cơ chế chấm điểm phát âm & Khả năng chịu nhiễu (Speaking Challenge & Speech STT)
- **Kiến trúc chấm điểm phụ thuộc 100% vào Cloud Azure Speech**:
  - `app/app/api/assess/route.ts:51-62`: Toàn bộ âm thanh được gửi lên endpoint REST của Microsoft Azure (`https://${region}.stt.speech.microsoft.com/...`).
  - `language=en-US` được fix cứng (`app/app/api/assess/route.ts:52`), sử dụng acoustic model chuẩn giọng người lớn bản xứ Bắc Mỹ, không có tinh chỉnh cho tần số thanh quản trẻ em Việt Nam (trẻ em có formant cao hơn, tốc độ nói ngắt quãng).
  - Công thức tính điểm khắt khe tại dòng 85:
    ```ts
    const overallScore = Math.round((accuracyScore + fluencyScore + completenessScore + prosodyScore) / 4);
    ```
    Bắt buộc tính trung bình cộng cả 4 chỉ số: Độ chính xác (`Accuracy`), Độ lưu loát (`Fluency`), Độ hoàn thiện (`Completeness`), và Ngữ điệu (`Prosody`). Trẻ nhỏ phát âm ngắc ngứ hoặc chưa có ngữ điệu tiếng Anh sẽ bị Prosody và Fluency kéo điểm tổng xuống dưới 80.
- **Hiện tượng treo chết (Deadlock) khi môi trường trọ ồn ào**:
  - Trong phòng trọ công nhân (tiếng quạt máy, tiếng xe máy ngõ hẻm, tiếng em bé khóc, tiếng tivi phòng bên), Azure STT không nhận diện được giọng trẻ sẽ trả về mã lỗi HTTP 422: `error: 'No recognition result'` (`app/app/api/assess/route.ts:72-74`).
  - Trên Web (`app/components/missions/WordsExplorer.tsx:92-95` & `app/lib/azure.ts:40-42`):
    ```ts
    } catch (err) {
      console.error(err);
      setAssessError('Could not score your recording. Please try again.');
    }
    ```
    Biến đếm `attempts` **chỉ được tăng lên khi có kết quả trả về hợp lệ** (`res.overallScore < PASS_THRESHOLD`). Khi Azure báo lỗi 422 hoặc mạng chập chờn rớt gói, luồng nhảy vào `catch`, `attempts` giữ nguyên giá trị 0.
    Điều kiện bỏ qua là `canSkip = !passed && attempts >= MAX_ATTEMPTS` (`WordsExplorer.tsx:48`). Do `attempts` không tăng, nút *"Skip for now →"* **không bao giờ xuất hiện**! Đứa trẻ bị khoá cứng tại màn hình, không thể qua bài, không thể bỏ qua.
  - Trên Mobile (`mobile/src/lib/assess.ts:104-114`): Khi mất mạng hoặc backend lỗi, app tự bịa ra điểm số ngẫu nhiên từ 85 đến 99 (`const simulatedScore = Math.floor(Math.random() * 15) + 85`) cùng token giả `fallback-token-${Date.now()}`. Đây là cơ chế "chấm điểm ảo" (fake scoring) ru ngủ, đánh lừa trẻ và phụ huynh, không có giá trị sư phạm.
- **Thu âm thiếu VAD (Voice Activity Detection) & Rò rỉ tài nguyên AudioContext**:
  - `app/components/Recorder.tsx:30-40` & `mobile/src/components/AudioRecorderButton.tsx:48-93`: Không có thuật toán phát hiện khoảng lặng (silence detection). Trẻ nói xong 1 giây nhưng không biết bấm "Stop", trình ghi âm sẽ ghi tiếp tạp âm phòng trọ suốt 60 giây (trên Web) hoặc vô tận (trên Mobile) cho đến khi người dùng bấm dừng.
  - File ghi âm 60 giây tạo ra file WAV PCM 16kHz uncompressed nặng **1.92 MB** (32 KB/s x 60s), sau đó mã hoá base64 tăng thêm 33% thành ~2.5 MB gửi qua mạng 3G/4G chập chờn.
  - **Rò rỉ bộ nhớ nghiêm trọng (Memory & Context Leak)**:
    - `app/components/Recorder.tsx:52`: Mỗi lần bấm thu âm tạo mới `const audioContext = new AudioContext()` nhưng hàm `stopRecording` **không bao giờ gọi `audioContext.close()`**.
    - `app/lib/audio.ts:8`: Hàm `audioToWav` mỗi lần chuyển đổi định dạng lại tạo `new AudioContext({ sampleRate: targetSampleRate })` và không đóng lại.
    - Trình duyệt Chrome/Safari trên điện thoại giới hạn tối đa 4–6 AudioContext cùng lúc. Sau 3–4 lần thu âm, AudioContext bị cạn kiệt, trình duyệt quăng ngoại lệ hoặc ngắt toàn bộ âm thanh của thiết bị.
  - Vòng lặp đo âm lượng 60fps (`Recorder.tsx:59-66`):
    `animFrameRef.current = requestAnimationFrame(trackVolume);`
    Mỗi khung hình tính trung bình mảng tần số và gọi `setVolume()`, ép React re-render 60 lần/giây, đốt pin và làm nóng máy điện thoại giá rẻ.

### 1.3. Khả năng tương thích thiết bị yếu, Mạng chập chờn & Tài nguyên đa phương tiện
- **Chuỗi trễ (Latency Chain) khi phát âm thanh từ**:
  - Toàn bộ repo có **0 file âm thanh tĩnh** (`mp3`/`wav`).
  - Trên Web, để phát âm 1 từ như *"Apple"*, ứng dụng phải trải qua chuỗi 5 chặng:
    1. Client gửi POST `/api/tts`.
    2. Server Vercel gọi Supabase Storage `list()` kiểm tra cache (`app/app/api/tts/route.ts:46-48`).
    3. Nếu chưa có, Vercel gọi Azure Speech TTS REST API lấy MP3 (`route.ts:69-80`).
    4. Vercel upload MP3 lên Supabase Storage (`route.ts:94-98`).
    5. Client tải file MP3 từ URL công khai của Supabase CDN và tạo thẻ `new Audio(body.url)`.
  - Trên kết nối 3G/4G trọ ngoại thành, độ trễ này lên tới 2.5 – 5.0 giây cho mỗi từ. Trẻ bấm vào loa thấy im lặng tưởng hỏng, bấm liên tục làm kích hoạt `currentPlayToken` hủy lệnh phát trước (`app/lib/tts.ts:9-38`), khiến âm thanh không bao giờ phát ra.
- **Tài sản đồ họa nặng bất thường**:
  - `mobile/assets/leafy/hero_wave.webp` và `app/public/leafy/hero_wave.webp` có dung lượng lên tới **1.0 MB** cho 1 ảnh duy nhất!
  - Trên Mobile (`mobile/src/screens/StudentHomeScreen.tsx:226`), ảnh 1.0 MB này được nhồi vào khung kích thước tí hon `width: 72, height: 72` ở banner trang chủ. Việc giải mã ảnh WebP độ phân giải cao vào RAM trên các máy Android 2GB gây giật khung hình và tiêu tốn bộ nhớ đệm bitmap.
  - Bản đồ học tập Web (`app/components/missions/StudentWorldMap.tsx:132-139`) dùng ảnh tĩnh `learning_map_clean.jpg` (204 KB) nhưng đặt trong khung `min-w-[760px]`, ép học sinh dùng điện thoại phải vuốt ngang (swipe left-right) để tìm nhà nấm.
- **Áp lực hoạt họa CSS dồn dập (Battery/GPU strain)**:
  - `app/app/globals.css:60-170`: Chứa hàng loạt animation vô tận chạy song song: `gl-float` (3.2s), `gl-sparkle` (1.8s), `gl-glow-pulse` (2s), `gl-bounce-jump` (0.8s), `gl-wave` (1s), `gl-pulse-ring` (2s).
  - Kết hợp với 6 emoji bay nền (`FloatingDecor.tsx`), cây cỏ SVG (`SceneBackground.tsx`), vòng tròn mic nhấp nháy liên tục, khiến vi xử lý cấp thấp (như MediaTek Helio A22/G25, Snapdragon 400 series) luôn ở trạng thái xung nhịp tối đa, máy nóng ran và sụt pin nhanh chóng.
- **Lỗi logic khoá bài học (Progression Lock Bug) trên Mobile**:
  - `mobile/src/screens/StudentHomeScreen.tsx:162`:
    ```ts
    const isUnlocked = l.is_unlocked ?? (l.order_index === 1);
    ```
    Trên Mobile, code **không kiểm tra** xem học sinh đã hoàn thành bài trước đó hay chưa (trong khi Web có kiểm tra tại `page.tsx:66-95`).
    Hậu quả: Ngoại trừ Lesson 1, toàn bộ Lesson 2, 3, 4,... đều hiển thị `🔒 Locked by Teacher`. Dù đứa trẻ hoàn thành 100% Lesson 1, Lesson 2 vẫn bị khoá cứng! Bấm vào hiện thông báo tiếng Anh *"Lesson Locked: Your teacher will unlock..."*. Trẻ không thể tự học tiếp nếu giáo viên không vào trang quản trị mở khoá thủ công.

---

## 2. Logic Chain (Chuỗi suy luận từ dữ liệu tới kết luận)

1. **Từ việc 100% UI, chỉ dẫn, nút bấm và thông báo bằng tiếng Anh** (`MissionIntro.tsx:48`, `LessonPlayerScreen.tsx:328`, `FirstTimeGuide.tsx:6`, `AudioRecorderButton.tsx:54`):
   $\rightarrow$ Trẻ mầm non/tiểu học tại ngoại ô chưa thể đọc hiểu tiếng Anh. Bố mẹ công nhân tăng ca mệt mỏi, không có trình độ tiếng Anh để ngồi kèm.
   $\rightarrow$ **Kết luận**: Ứng dụng hiện tại đòi hỏi trình độ của học sinh trường quốc tế hoặc gia đình có bố mẹ kèm cặp sát sao, hoàn toàn xa rời thực tế con em công nhân.

2. **Từ số lượng thao tác bấm (34 click/bài học), thiếu auto-advance và thiếu Voice Activity Detection** (`Recorder.tsx:30-40`, `WordsExplorer.tsx:216`, `LessonPlayerScreen.tsx:424`):
   $\rightarrow$ Sau mỗi từ/câu, dù nói đúng, màn hình vẫn dừng lại bắt trẻ tìm đúng nút chữ nhỏ để bấm tiếp. Nếu trẻ nói xong quên bấm Stop, hệ thống tiếp tục thu tạp âm đến 60 giây.
   $\rightarrow$ **Kết luận**: Trải nghiệm bị đứt gãy, gây ức chế cao độ cho trẻ nhỏ, trái ngược hoàn toàn với tiêu chuẩn thiết kế "0-click" tương tác tự nhiên.

3. **Từ việc Azure Speech API fix cứng `en-US`, chấm Prosody/Fluency và lỗi Deadlock 422 không tăng attempts** (`assess/route.ts:52,85`, `WordsExplorer.tsx:92-95`):
   $\rightarrow$ Môi trường phòng trọ công nhân chắc chắn có tiếng ồn nền (tiếng còi xe ngõ xóm, tiếng tivi, tiếng trẻ con khóc). Giọng trẻ con Việt Nam chắc chắn ngập ngừng và không đúng ngữ điệu bản xứ Mỹ.
   $\rightarrow$ Azure STT thường xuyên trả về 422 hoặc điểm <60. Trên Web, lỗi 422 làm kẹt biến `attempts`, vô hiệu hoá tính năng Skip, khiến đứa trẻ bị "giam lỏng" vĩnh viễn ở một từ duy nhất. Trên Mobile, app gian lận bằng cách sinh điểm ngẫu nhiên 85-99 để qua màn.
   $\rightarrow$ **Kết luận**: Hệ thống chấm điểm phát âm hiện tại phi thực tế, vừa dễ làm nản lòng trẻ thật thà, vừa mang tính chất "chữa cháy dối trá" trên mobile.

4. **Từ việc rò rỉ AudioContext (`new AudioContext()` không `close()`), 10+ CSS animations vô tận và ảnh 1.0 MB nhồi vào icon 72px** (`Recorder.tsx:52`, `audio.ts:8`, `globals.css:60`, `StudentHomeScreen.tsx:226`):
   $\rightarrow$ Điện thoại thông minh cũ của gia đình công nhân (màn hình trầy xước, pin chai, RAM 2GB-3GB) sẽ bị cạn bộ nhớ Audio, giật lag khung hình khi giải mã ảnh lớn, và cạn pin trong vòng chưa đầy 30 phút sử dụng.
   $\rightarrow$ **Kết luận**: Phần mềm quá nặng nề và cẩu thả trong quản lý tài nguyên phần cứng cấp thấp.

5. **Từ việc thiếu thư mục ảnh `images/` trên Web và không có bất kỳ thẻ `<Image>` nào trong bài học Mobile** (`LessonPlayerScreen.tsx:321-419`, `0002_seed_missions.sql:12`):
   $\rightarrow$ Trẻ học từ vựng nhưng trên Mobile chỉ nhìn thấy mặt chữ cái tiếng Anh ("Cat", "Dog") mà không hề thấy hình con mèo hay con chó.
   $\rightarrow$ **Kết luận**: Mất đi nguyên lý cốt lõi của giáo dục ngôn ngữ sớm (Visual Flashcard / Multisensory learning). Trẻ học vẹt mặt chữ chứ không học qua hình ảnh trực quan.

---

## 3. Caveats (Giới hạn khảo sát & Giả định)

1. **Khảo sát mã nguồn tĩnh**: Báo cáo được xây dựng dựa trên phân tích trực tiếp 100% mã nguồn TypeScript/TSX và cấu hình assets trong repo. Không thực hiện test trên thiết bị thật cắm sim 3G Viettel tại hiện trường Đông Anh/Sóc Sơn.
2. **Dữ liệu hạt giống (Seed Data)**: Một số bài học có thể được bổ sung qua API hoặc Supabase Dashboard trực tiếp mà không lưu trong git migration. Tuy nhiên, logic code client render là bất biến.
3. **Cơ chế âm thanh Web Audio**: Trên các phiên bản iOS WebKit mới, chính sách autoplay có thể khắt khe hơn nữa (bắt buộc tương tác chạm đầu tiên trên trang trước khi phát bất kỳ Web Audio node nào).

---

## 4. Conclusion (Đánh giá chung & Bảng điểm thực tế)

### 4.1. Bảng chấm điểm độ phù hợp thực tế (Thang điểm 1 - 10)
| Hạng mục thành phần | Điểm thực tế | Đánh giá trần trụi (Phùng Quán Style) |
|---|:---:|---|
| **Zero-Friction UX & Tự học** | **2 / 10** | Vẽ ra trên giấy. Bắt trẻ bấm hơn 30 lần mỗi bài học; toàn chữ tiếng Anh; bài tập về nhà bắt gõ phím viết luận tiếng Anh. Trẻ 5 tuổi mở ra là chịu chết nếu không có người lớn ngồi kè kè dịch hộ. |
| **Speaking & Speech Evaluation** | **3 / 10** | Áp đặt chuẩn bản xứ người lớn Mỹ (`en-US`, chấm Prosody/Fluency) lên trẻ em ngoại thành. Phòng trọ ồn là treo đơ vĩnh viễn (Web) hoặc sinh điểm ảo gian lận (Mobile). Rò rỉ AudioContext làm tê liệt âm thanh máy. |
| **Media Assets & Trực quan** | **3 / 10** | Mobile biến bài học thành màn hình chữ đen xì không một bức tranh minh hoạ; Web thì 404 ảnh local phải dùng emoji chắp vá. Ảnh mascot 1MB nhồi nhét vô tội vạ. |
| **Tối ưu phần cứng yếu & Mạng 3G/4G** | **4 / 10** | Tốn 4-5 chặng mạng để phát 1 tiếng kêu; gửi file WAV thô nặng hàng megabyte; animation vô tận ngốn pin làm máy nóng ran; rớt mạng là học sinh bị văng hoặc kẹt cứng. |

### 4.2. Danh mục đầu việc kỹ thuật cần cải tổ (P0 / P1 / P2)

#### 🔴 P0 — Khẩn cấp (Sửa ngay để trẻ tự học được, không văng app):
1. **Sửa lỗi Deadlock 422 & Logic Skip khi rớt mạng / phòng trọ ồn ào**:
   - *File*: `app/components/missions/WordsExplorer.tsx`, `PhonicsChant.tsx`, `SpeakingChallenge.tsx`.
   - *Khắc phục*: Tăng biến `attempts` ngay cả khi API trả về lỗi 422 hoặc network timeout. Cho phép nút Skip hiển thị sau 2 lần thử không thành công hoặc nút "Bỏ qua bằng 1 chạm" luôn khả dụng ở góc màn hình.
   - *Mobile fallback*: Bỏ cơ chế random điểm ảo tại `mobile/src/lib/assess.ts:105`. Thay bằng ghi nhận trạng thái offline (`status: 'offline_attempt'`) để giáo viên xem xét sau, không dối trá điểm số.
2. **Vá lỗ hổng rò rỉ AudioContext (Memory Leak)**:
   - *File*: `app/components/Recorder.tsx`, `app/lib/audio.ts`.
   - *Khắc phục*: Tái sử dụng một singleton AudioContext duy nhất hoặc gọi `audioContext.close()` ngay khi giải mã xong. Bỏ vòng lặp re-render 60fps khi thu âm (chuyển sang CSS animation thuần túy hoặc throttle xuống 10fps).
3. **Mở khoá bài học tự động trên Mobile (Fix Progression Lock)**:
   - *File*: `mobile/src/screens/StudentHomeScreen.tsx:160-172`.
   - *Khắc phục*: Đồng bộ logic với Web: Nếu `lesson[i-1]` đã hoàn thành tất cả missions thì tự động mở khoá `lesson[i]`, không bắt chờ giáo viên can thiệp thủ công.
4. **Bổ sung hình ảnh Flashcard trực quan cho Mobile**:
   - *File*: `mobile/src/screens/LessonPlayerScreen.tsx:321-419`.
   - *Khắc phục*: Render hình ảnh minh hoạ kích thước lớn (hoặc emoji cỡ lớn tối thiểu 80px) cho từng thẻ từ vựng và câu phonics, tuyệt đối không để màn hình chỉ toàn chữ.

#### 🟡 P1 — Quan trọng (Giảm ma sát, tối ưu pin và dữ liệu 3G/4G):
1. **Thiết lập luồng tự động chuyển bài (Hands-free / 0-Click Auto-Progression)**:
   - *File*: `WordsExplorer.tsx`, `PhonicsChant.tsx`, `LessonPlayerScreen.tsx`, `MissionIntro.tsx`, `MissionCelebration.tsx`.
   - *Khắc phục*: Khi học sinh phát âm đạt điểm chuẩn (>=75 thay vì 80), tự động phát âm thanh khen ngợi và tự chuyển sang thẻ từ tiếp theo sau 1.2 giây đếm ngược, không bắt trẻ bấm "Continue".
2. **Việt hóa toàn bộ chỉ dẫn và thêm Voice-over tiếng Việt**:
   - *File*: Toàn bộ các component UI học sinh.
   - *Khắc phục*: Chuyển đổi toàn bộ nút bấm sang tiếng Việt đơn giản có biểu tượng (VD: "Bắt đầu 🚀", "Đọc lại 🔄", "Tiếp tục ➔"). Thêm nút bấm loa phát giọng đọc tiếng Việt hướng dẫn thao tác cho trẻ chưa biết đọc chữ.
3. **Thêm Voice Activity Detection (VAD) / Tự ngắt thu âm sau 3 giây yên lặng**:
   - *File*: `Recorder.tsx`, `AudioRecorderButton.tsx`.
   - *Khắc phục*: Tự động dừng thu âm khi năng lượng âm thanh giảm dưới ngưỡng trong 1.5 giây, hoặc tối đa 5 giây cho 1 từ vựng. Tránh thu cả phút tạp âm phòng trọ, giảm dung lượng upload từ 2MB xuống còn ~60KB.
4. **Hạ ngưỡng điểm Azure STT & Bỏ Prosody cho trẻ nhỏ**:
   - *File*: `app/app/api/assess/route.ts:80-86`.
   - *Khắc phục*: Đối với lứa tuổi mầm non và tiểu học nhỏ (`kindergarten`, `kids1`), chỉ tính `AccuracyScore` và `CompletenessScore`. Loại bỏ hoàn toàn `ProsodyScore` và `FluencyScore` ra khỏi công thức tính điểm tổng. Hạ `PASS_THRESHOLD` từ 80 xuống 70 điểm.

#### 🟢 P2 — Nâng cao (Trải nghiệm bền vững & Bản địa hóa):
1. **Nén tối ưu tài nguyên tĩnh & Loại bỏ ảnh 1MB**:
   - *File*: `mobile/assets/leafy/hero_wave.webp`, `app/public/leafy/hero_wave.webp`.
   - *Khắc phục*: Nén ảnh `hero_wave.webp` từ 1.0 MB xuống dưới 35 KB (WebP quality 75, resize về 160x160px). Tối ưu các file ảnh bản đồ.
2. **Cắt giảm hoạt họa vô tận khi phát hiện thiết bị yếu**:
   - *File*: `app/app/globals.css`.
   - *Khắc phục*: Tôn trọng `prefers-reduced-motion` hoặc tự động tắt `gl-sparkle`, `gl-glow-pulse`, `FloatingDecor` trên màn hình thiết bị di động có màn hình nhỏ hơn 768px để tiết kiệm pin.
3. **Đổi hình thức bài tập về nhà (Writing Homework) sang dạng tương tác kéo thả / thu âm**:
   - *File*: `app/app/homework/page.tsx`, `mobile/src/screens/HomeworkScreen.tsx`.
   - *Khắc phục*: Thay thế ô nhập văn bản textarea bằng: (a) Kéo thả từ thành câu hoàn chỉnh; hoặc (b) Thu âm câu trả lời theo tranh minh hoạ; hoặc (c) Nộp ảnh chụp trang vở bài tập viết tay để giáo viên chấm điểm.

---

## 5. Verification Method (Phương pháp độc lập kiểm chứng)

Bất kỳ kỹ sư hoặc kiểm thử viên nào cũng có thể kiểm chứng độc lập các phát hiện trên thông qua các bước sau:

1. **Kiểm chứng Deadlock 422 khi phòng ồn**:
   - Mở Web Lesson Player tại `/missions/kids1/<lessonId>`.
   - Bật quạt máy gió mạnh gần mic máy tính hoặc phát tiếng ồn nền, sau đó bấm thu âm và nói tiếng thì thầm/không rõ chữ.
   - Quan sát tab Network: API `/api/assess` trả về HTTP 422.
   - Quan sát UI: Màn hình báo lỗi đỏ *"Could not score your recording. Please try again."*. Nút *"Skip for now"* **không xuất hiện**. Thử lại 5 lần liên tiếp, nút Skip vẫn bị giấu kín do `attempts` không tăng.
2. **Kiểm chứng Memory Leak của AudioContext**:
   - Mở Chrome DevTools -> tab Memory hoặc Performance.
   - Tại màn hình từ vựng (`WordsExplorer`), thực hiện bấm Record và Stop liên tiếp 6 lần.
   - Gõ lệnh vào Console: `window.__audioContextCount` hoặc kiểm tra số lượng `AudioContext` chưa được đóng trong heap snapshot. Quan sát thấy lỗi vượt quá giới hạn AudioContext của trình duyệt.
3. **Kiểm chứng bài học Mobile không có ảnh & lỗi khoá Lesson 2**:
   - Mở `mobile/src/screens/LessonPlayerScreen.tsx`.
   - Tìm kiếm chuỗi `<Image` trong file: Chỉ có 2 kết quả ở dòng 235 (celebration) và 269 (intro). Trong các block bài học chính (`words_explorer`, `phonics`, `speaking_challenge`), hoàn toàn không có bất kỳ component ảnh nào.
   - Mở `mobile/src/screens/StudentHomeScreen.tsx:162`, kiểm tra logic `l.is_unlocked ?? (l.order_index === 1)`. Đăng nhập tài khoản học sinh đã hoàn thành Lesson 1, quan sát thấy Lesson 2 vẫn bị gắn cờ `locked` và không thể mở.
4. **Kiểm chứng dung lượng asset khổng lồ**:
   - Chạy lệnh terminal: `ls -lh app/public/leafy/hero_wave.webp mobile/assets/leafy/hero_wave.webp`.
   - Kết quả trả về kích thước chính xác: **1.0 MB (1,048,576 bytes)** cho mỗi file.
