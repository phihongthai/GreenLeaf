# BÁO CÁO PHẢN BIỆN TOÀN DIỆN VÀ KẾ HOẠCH HÀNH ĐỘNG KỸ THUẬT: ĐỘ LỆCH THỰC TẾ CỦA HỆ THỐNG GREENLEAF ĐỐI VỚI GIA ĐÌNH CÔNG NHÂN NGOẠI THÀNH HÀ NỘI

**Hệ thống khảo sát**: GreenLeaf Web App (`app/`) và Mobile App React Native (`mobile/`).  
**Địa bàn đối chiếu thực tế**: Các xóm trọ công nhân quanh Khu công nghiệp Thăng Long (Kim Chung, Đại Mạch, Đông Anh) và Khu công nghiệp Quang Minh (Mê Linh, Hà Nội).  
**Đối tượng thụ hưởng**: Trẻ em 4–10 tuổi học tiếng Anh và phụ huynh làm công nhân ca kíp 12 tiếng.  
**Ngày hoàn thành**: 17/10/2026.  
**Tình trạng kiểm toán**: Hoàn tất rà soát mã nguồn thực tế.

---

## Lời mở đầu & Bối cảnh Hiện trường

Bảy giờ tối ở xóm trọ thôn Bầu, xã Kim Chung. Tiếng xe máy ca chiều rồ ga ngoài ngõ, tiếng quạt cây kêu rè rè trong căn phòng trọ mười lăm mét vuông lợp mái tôn fibro-xi măng, tiếng trẻ con nhà bên khóc ngằn ngặt. Người mẹ vừa tan ca mười hai tiếng từ xưởng lắp ráp linh kiện điện tử trở về, áo bảo hộ còn vương mùi dầu máy, vội vã cắm nồi cơm điện rồi đưa cho đứa con sáu tuổi chiếc điện thoại cũ nứt góc màn hình để con tự học tiếng Anh. Chiếc điện thoại thông minh Android mua lại với giá một triệu đồng, bộ nhớ trong ba mươi hai gigabyte, RAM hai gigabyte, pin đã chai sau ba năm sử dụng, bắt sóng ba gờ gói cước ngày chập chờn theo từng cơn gió ngoài cánh đồng.

Đó là hiện trường thực tế. Đó là nơi phần mềm phải sống sót, phải vận hành, và phải mang lại giá trị thực tế cho đứa trẻ.

Khi đối chiếu hiện trường ấy với từng dòng mã nguồn của GreenLeaf, sự thật hiện ra trần trụi. Hệ thống được lập trình bằng tư duy phòng máy lạnh của những kỹ sư ngồi trung tâm đô thị. Một sản phẩm mang danh phục vụ con em công nhân nhưng lại đòi hỏi thiết bị cấu hình mạnh, đường truyền cáp quang ổn định, sự kèm cặp liên tục của phụ huynh thành thạo tiếng Anh và kỹ năng thao tác chuột bàn phím của dân văn phòng. 

Báo cáo này vạch trần toàn bộ các điểm nghẽn kỹ thuật, sự xa rời thực tế và các giải pháp ngụy tạo trong mã nguồn, từ đó thiết lập lộ trình cải tổ cụ thể.

---

## Bảng tổng kết Chấm điểm Thực tế (Thang điểm 1 - 10)

Mức độ phù hợp thực tế được đo lường dựa trên khả năng một đứa trẻ năm tuổi tại xóm trọ tự mở máy học độc lập mà không cần cha mẹ, trên thiết bị phần cứng giá rẻ và đường truyền mạng yếu.

| Cụm tính năng | Điểm thực tế | Hiện trạng mã nguồn | Thực tế hiện trường gia đình công nhân | Đánh giá trần trụi |
| :--- | :---: | :--- | :--- | :--- |
| **1. Auth & Onboarding** (Xác thực & Khởi động) | **2.5 / 10** | Bắt nhập chữ tài khoản và mật khẩu tiếng Anh; màn hình chào bắt chờ 2.2 giây; pop-up hướng dẫn 5 trang văn bản tiếng Anh; nút đăng xuất không có xác nhận. | Trẻ chưa biết đọc chữ; bố mẹ làm ca đêm không có nhà để gõ hộ; vô tình chạm tay là văng tài khoản không vào lại được. | Thiết kế cho người lớn biết đọc tiếng Anh, biến chiếc điện thoại thành cánh cửa khóa chặt với trẻ nhỏ. |
| **2. Map & Path** (Bản đồ & Lộ trình học) | **2.0 / 10** | Bản đồ web gán cứng chiều rộng tối thiểu 760 pixel bên trong khối cắt ẩn, vỡ nát trên màn hình 360 pixel; giấu danh sách dọc; mobile khóa vĩnh viễn toàn bộ bài học từ bài số hai trở đi. | Màn hình điện thoại phổ thông chỉ rộng 360 pixel, bị cắt mất ba phần tư bản đồ; trẻ không thấy bài số hai ở đâu để bấm; bug code khóa cứng tiến trình. | Tự cắt đứt đường học của trẻ ngay từ màn hình chính; Duolingo nửa mùa trên giao diện co cụm. |
| **3. Lesson Player & Speech Evaluation** (Bộ phát bài & Chấm phát âm) | **3.0 / 10** | Bắt bấm 34 lần mỗi bài học; rò rỉ tài nguyên bối cảnh âm thanh làm liệt mic; Azure STT chấm chuẩn người lớn bản xứ gây bế tắc lỗi 422 không cho bỏ qua; mobile tự bịa điểm ảo 85-99 khi mất mạng; mobile không có hình ảnh từ vựng. | Trẻ nói xong ngồi đợi máy; phòng trọ ồn ào bị chấm rớt liên tục hoặc sinh điểm giả ru ngủ; bài học không có tranh minh họa biến thành học vẹt mặt chữ. | Hệ thống chấm điểm biến thành trò gian dối khi gặp mạng yếu; rò rỉ bộ nhớ phá hỏng phần cứng; triệt tiêu động lực học thật. |
| **4. Parent Interface** (Giao diện phụ huynh) | **1.0 / 10** | Ứng dụng di động có không phần trăm tính năng phụ huynh; web dashboard tiếng Anh phức tạp, bắt đăng nhập thư điện tử, hiển thị nhật ký chấm điểm chi tiết và dấu gạch chéo đỏ. | Bố mẹ công nhân không dùng máy tính, không nhớ tài khoản thư điện tử, tăng ca về mỏi mắt không thể đọc báo cáo kỹ thuật; thiếu liên kết Zalo. | Bỏ rơi hoàn toàn phụ huynh công nhân; gạt người trả tiền học ra ngoài rìa hệ thống. |
| **Điểm trung bình toàn hệ thống** | **2.1 / 10** | **Tê liệt khả năng tự học độc lập của trẻ em ngoại thành.** |

---

## Phần I: Luồng tự học độc lập của trẻ (0-click / Zero Friction UX) — Ảo tưởng trên giấy vs Hiện thực phũ phàng

### 1. Rào cản đăng nhập văn bản và màn hình chào áp đặt thời gian
Trong tệp `app/app/login/page.tsx`, dòng 93 đến 114 quy định luồng xác thực của học sinh. Hệ thống bắt buộc trẻ phải nhập hai trường văn bản: tài khoản (`identifier`) và mật khẩu (`password`). Để giảm bớt thao tác, kỹ sư viết mã đã ngầm gắn đuôi `@greenleaf.local` ở dòng 108:
```typescript
const email = identifier.includes('@') ? identifier : `${identifier}@greenleaf.local`;
```
Đây là sự tự huyễn hoặc. Một đứa trẻ năm tuổi tại Kim Chung chưa thuộc bảng chữ cái tiếng Việt, chưa từng dùng bàn phím QWERTY ảo. Bắt một đứa trẻ gõ chuỗi ký tự không dấu kèm mật khẩu là một mệnh lệnh bất khả thi. Nếu bố mẹ tăng ca về muộn, đứa trẻ mở điện thoại lên và nhìn thấy màn hình đăng nhập thì buổi học chấm dứt tại đó.

Trên ứng dụng di động (`mobile/src/screens/LoginScreen.tsx`, dòng 89-112), toàn bộ nhãn hiển thị đều bằng tiếng Anh: `"Account"`, `"e.g. student.demo"`, `"Password"`, `"••••••••"`, `"Start Learning"`. Hoàn toàn không có đăng nhập một chạm bằng mã QR in trên thẻ nhựa học sinh, không có mã PIN bốn số to rõ, không có chế độ chọn biểu tượng con vật (chó, mèo, gấu) cho từng cháu.

Tệ hại hơn, khi đăng nhập thành công trên web, tệp `app/app/login/page.tsx` từ dòng 29 đến 87 ép người dùng phải đi qua một màn hình chào đón giả tạo mang tên `WelcomeScreen`. Mã nguồn cài đặt hai bộ đếm thời gian trễ:
```typescript
setTimeout(() => setStep(1), 1500);
setTimeout(() => setStep(2), 2200);
```
Đứa trẻ phải ngồi nhìn màn hình trắng hai phẩy hai giây để nhân vật hoạt hình Leafy trượt vào, rồi lại phải dùng ngón tay bấm thêm một nút `"🚀 Let's go!"` ở dòng 73 mới được vào hệ thống. Chưa hết, tệp `app/components/student/FirstTimeGuide.tsx` từ dòng 6 đến dòng 32 chặn đứng màn hình bằng một cửa sổ pop-up năm trang hướng dẫn thuần chữ tiếng Anh:
```typescript
// FirstTimeGuide.tsx:10-18
"Each lesson has 3 parts. Listen to the sample first, then tap the green button to record yourself..."
```
Đứa trẻ không biết đọc tiếng Anh. Nút `"Next"` và nút `"Skip"` là chữ tiếng Anh nhỏ xíu ở góc dưới. Cửa sổ này biến thành một bức tường kiên cố giam giữ đứa trẻ ngay lần đầu chạm vào phần mềm.

Ở chiều ngược lại, nút đăng xuất trên điện thoại di động lại được bố trí như một chiếc bẫy. Tệp `mobile/src/screens/StudentHomeScreen.tsx` tại dòng 203 đặt nút `LogOut` kích thước ba mươi tám pixel ngay góc trên bên phải màn hình:
```typescript
<TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.7}>
  <LogOut size={18} color="#64748B" />
</TouchableOpacity>
```
Khi đứa trẻ với ngón tay vụng về cầm chiếc điện thoại màn hình nhỏ, ngón tay cái rất dễ quẹt trúng góc này. Hàm `handleLogout` trong `mobile/App.tsx` dòng 41 lập tức được kích hoạt. Không có hộp thoại hỏi lại. Không có câu đố bảo vệ kiểu phụ huynh (Parental Gate). Ứng dụng lập tức xóa phiên làm việc và đá văng đứa trẻ ra màn hình đăng nhập chữ tiếng Anh. Buổi học bị phá hủy hoàn toàn.

### 2. Vỡ nát bản đồ học tập trên màn hình 360 pixel
Các dòng điện thoại phổ thông giá rẻ mà công nhân trang bị cho con em (Samsung Galaxy dòng A đời cũ, Xiaomi Redmi, Realme) đều có chiều rộng hiển thị chuẩn là 360 đến 375 pixel.

Hãy nhìn vào cách bản đồ học tập được xây dựng trong `app/components/missions/StudentWorldMap.tsx`, dòng 130 đến 132:
```tsx
<div className="relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 bg-[#aed9a8] select-none">
  <div className="relative w-full aspect-[16/9] min-w-[760px] md:min-w-0 overflow-hidden">
```
Kỹ sư thiết kế bản đồ đã cưỡng ép chiều rộng tối thiểu `min-w-[760px]`, nhưng lớp bao bọc bên ngoài lại gán thuộc tính `overflow-hidden` và hoàn toàn không cho phép cuộn ngang (`overflow-x-auto`).
Hậu quả hiển thị trên màn hình rộng 360 pixel:
- Hơn bốn trăm pixel bên phải của bản đồ bị chém đứt hoàn toàn.
- Vị trí bài học Unit 1 nằm ở tọa độ `left: 44.8%`, tức khoảng mốc 340 pixel, nằm sát sạt mép phải màn hình.
- Vị trí Unit 2 nằm ở tọa độ `left: 56.6%`, tức mốc 430 pixel, rơi hoàn toàn ra ngoài vùng hiển thị.
- Vị trí Unit 3 nằm ở tọa độ `left: 73.0%`, tức mốc 554 pixel, nằm ngoài vùng hiển thị.
- Vị trí Unit 4 nằm ở tọa độ `left: 81.8%`, tức mốc 621 pixel, nằm ngoài vùng hiển thị.

Đứa trẻ cầm chiếc điện thoại dọc hoàn toàn không nhìn thấy Unit 2, Unit 3 và Unit 4. Không thể vuốt sang phải vì bị thuộc tính cắt ẩn chặn đứng. Trong khi đó, mã nguồn có sẵn chế độ hiển thị danh sách dọc thân thiện với điện thoại (`LessonPathList.tsx`), nhưng trong `app/app/grades/page.tsx` dòng 33, biến trạng thái mặc định lại bị gán chết là `viewMode = 'map'`. Nút chuyển sang dạng danh sách là một biểu tượng bé tí đặt ở góc trên (dòng 271) mà một đứa trẻ không bao giờ biết để bấm.

### 3. Nghịch lý ba mươi tư cú chạm cho một bài học năm phút
Một đứa trẻ mầm non cần mở máy ra là bài học tự chạy, tự đọc mẫu, tự mở mic, tự chuyển câu khi hoàn thành. Hiện thực trong mã nguồn GreenLeaf là một chuỗi hành xác cơ học.

Hãy đếm từng thao tác bấm thực tế để hoàn thành một bài học gồm năm từ vựng, bốn câu vần chant và một câu nói tự do:
1. Mở màn hình chính, cuộn tìm bài học: 1 lần bấm.
2. Cửa sổ mở đầu hiện ra (`MissionIntro.tsx:100`), ép bấm nút `"Let's Start! 🚀"`: 1 lần bấm.
3. Phần từ vựng (`WordsExplorer.tsx`), âm thanh đọc mẫu xong, trẻ phải bấm nút mic xanh để bật thu âm: 1 lần bấm.
4. Trẻ nói xong, máy không tự dừng, trẻ phải bấm nút mic đỏ để tắt thu âm: 1 lần bấm.
5. Máy chấm đạt điểm, hệ thống đứng yên chờ đợi, trẻ phải bấm nút `"Well done! Next word →"` (dòng 215): 1 lần bấm.
   - Nhân với 5 từ vựng: 15 lần bấm.
6. Màn hình chúc mừng trung gian hiện ra (`MissionCelebration.tsx:94`), đứng yên chờ bấm nút `"Continue →"`: 1 lần bấm.
7. Phần vần điệu (`PhonicsChant.tsx`), lặp lại quy trình bật mic, tắt mic, bấm chuyển câu cho 4 câu: 12 lần bấm.
8. Màn hình chúc mừng trung gian thứ hai, lại đứng yên chờ bấm `"Continue →"`: 1 lần bấm.
9. Phần nói tự do (`SpeakingChallenge.tsx`), quy trình bật mic, tắt mic và bấm nút hoàn tất: 3 lần bấm.
10. Màn hình tổng kết cuối cùng, bấm quay về bản đồ: 1 lần bấm.

Tổng cộng ba mươi tư lần bấm ngón tay cho một bài học kéo dài năm phút. Không có cơ chế tự động chuyển bài khi đạt điểm (Zero Auto-Advance). Không có cơ chế tự dừng thu âm khi phát hiện im lặng. Phần mềm bắt đứa trẻ phải làm việc như một nhân viên nhập liệu máy tính.

### 4. Ứng dụng di động biến thành trang sách chữ trần trụi
Nguyên lý vỡ lòng của việc dạy ngôn ngữ cho trẻ nhỏ là phương pháp trực quan qua hình ảnh và phản xạ đa giác quan (Visual Flashcards). Trẻ nhìn thấy quả táo, con mèo rồi mới liên kết với âm thanh phát ra.

Kiểm tra tệp `mobile/src/screens/LessonPlayerScreen.tsx` từ dòng 321 đến dòng 419, nơi hiển thị toàn bộ bài học trên điện thoại di động:
Hoàn toàn không có bất kỳ một thẻ `<Image>` nào trong các khối học `words_explorer`, `phonics` và `speaking_challenge`. Thứ duy nhất hiện ra trước mắt đứa trẻ là mặt chữ tiếng Anh màu đen in đậm (`currentWord.word`), nghĩa tiếng Việt in chữ nhỏ xíu bên dưới (`currentWord.meaning`), một biểu tượng chiếc loa và một nút bấm micro.
Một bài học cho trẻ bốn tuổi bị tước đoạt hoàn toàn hình ảnh trực quan, trở thành một màn hình đen trắng trần trụi.

Còn trên ứng dụng web thì sao. Trong `app/components/missions/WordsExplorer.tsx` dòng 165 đến 177, thẻ ảnh `<img>` gọi đến đường dẫn hạt giống `word.imageUrl`, ví dụ: `"/images/kindergarten/cat.png"`. Nhưng kiểm tra thực tế thư mục `app/public/`: hoàn toàn không tồn tại thư mục `images/` và không có bất kỳ tệp hình ảnh minh họa bài học nào. Toàn bộ các yêu cầu tải ảnh cục bộ đều trả về lỗi bốn không bốn (HTTP 404 Not Found), buộc mã nguồn phải kích hoạt hàm dự phòng `getWordEmoji` để hiển thị một biểu tượng emoji chắp vá.

### 5. Bài tập về nhà bắt gõ phím viết luận trên điện thoại
Sự xa rời thực tế lên đến đỉnh điểm ở màn hình bài tập về nhà.
Trong `app/app/homework/page.tsx` dòng 142 đến 156 và `mobile/src/screens/HomeworkScreen.tsx` dòng 142 đến 167:
```tsx
<textarea
  rows={5}
  placeholder="Write your answer here in English..."
  className="w-full p-4 border rounded-2xl ..."
/>
```
Phần mềm yêu cầu một đứa trẻ mẫu giáo hoặc lớp một phải dùng hai ngón tay gõ một đoạn văn tiếng Anh vào một khung văn bản năm dòng trên màn hình điện thoại cảm ứng nhỏ hẹp. Trẻ chưa viết sõi tiếng Việt trên giấy ô ly. Trẻ chưa biết cách gõ bàn phím ảo. Điện thoại không có bàn phím từ vựng gợi ý để kéo thả, không có chức năng đọc chính tả giọng nói thành chữ.
Đồng thời, hệ thống hoàn toàn không có tính năng cho phép trẻ cầm bút viết chữ vào vở ô ly rồi dùng camera điện thoại chụp lại trang vở gửi cho cô giáo. Đây là một tính năng được thiết kế trên bàn giấy, đánh đố học sinh và tự triệt tiêu khả năng nộp bài của con em công nhân.

### 6. Tuyên bố giáo điều "English Immersion 100%"
Trong tệp `app/README.md` dòng 8 ghi rõ:
> *"Nguyên tắc English Immersion: Toàn bộ giao diện người dùng, nội dung bài học, feedback gợi ý của AI (Gemini), và nghĩa giải thích từ vựng đều sử dụng tiếng Anh 100%. Đây là quyết định sư phạm cốt lõi đã được chốt (không tự ý đưa lại tiếng Việt vào app)."*

Để thực thi nguyên tắc giáo điều này, tệp di cư cơ sở dữ liệu `app/supabase/migrations/0017_word_meanings_english.sql` đã xóa sạch toàn bộ nghĩa tiếng Việt gần gũi đã gieo ở bản số mười một ("con mèo", "con chó", "con thằn lằn") để thay bằng những định nghĩa tiếng Anh hàn lâm:
- Từ `lizard` bị biến thành: *"a small animal with scaly skin"*.
- Từ `rat` bị biến thành: *"a small animal with a long tail"*.
- Từ `bird` bị biến thành: *"an animal that can fly"*.

Một đứa trẻ sáu tuổi ở xóm trọ không hiểu "scaly skin" là lớp da có vảy. Cha mẹ của trẻ sau ca làm việc mệt nhoài cũng không hiểu "scaly skin" nghĩa là gì để giải thích cho con. Xóa bỏ tiếng mẹ đẻ trong các định nghĩa cơ bản này là sự áp đặt phi lý. Nó biến đứa trẻ thành con vẹt nhại lại âm thanh mà không hiểu bản chất sự vật.

---

## Phần II: Phần cứng yếu, Mạng chập chờn & Khả năng sinh tồn (Hardware & Network Resilience)

### 1. File ảnh khổng lồ một megabyte giải mã trên luồng giao diện chính
Trong thư mục tài nguyên của cả hai dự án tồn tại tệp ảnh hình đại diện nhân vật:
- `app/public/leafy/hero_wave.webp`: kích thước **1,061,608 bytes (~1.0 MB)**.
- `mobile/assets/leafy/hero_wave.webp`: kích thước **1,039,049 bytes (~1.04 MB)**.

Trên trang đăng nhập web (`app/app/login/page.tsx:53`), tệp ảnh một megabyte này được tải qua thẻ `<img>` trần tục, hoàn toàn không sử dụng cơ chế tối ưu nén ảnh tự động của Next.js (`next/image`).
Trên ứng dụng di động (`mobile/src/screens/StudentHomeScreen.tsx:226`), tệp ảnh một megabyte này được render bằng component `Image` mặc định của React Native và ép vào một khung hình có kích thước vỏn vẹn bảy mươi hai nhân bảy mươi hai pixel (`width: 72, height: 72`):
```typescript
<Image source={require('../../assets/leafy/hero_wave.webp')} style={styles.mascotImg} />
```
Dự án di động hoàn toàn không cài đặt thư viện `expo-image`. Khi thẻ `Image` mặc định đọc tệp WebP một megabyte, tiến trình giải mã bitmap dung lượng lớn diễn ra trực tiếp trên luồng giao diện chính (UI Thread). Trên các dòng điện thoại Android giá rẻ có bộ nhớ RAM hai gigabyte chạy chip vi xử lý cấp thấp, thao tác này chiếm dụng hàng chục megabyte bộ nhớ đồ họa, làm rớt khung hình nghiêm trọng, gây khựng đơ giao diện từ một đến hai giây mỗi khi mở màn hình chính.

### 2. Rò rỉ đối tượng AudioContext gây liệt mic sau ba lần thử
Đây là một lỗi kỹ thuật nghiêm trọng làm tê liệt hoàn toàn chức năng cốt lõi của ứng dụng web.
Hãy nhìn vào mã nguồn của `app/components/Recorder.tsx` tại dòng 52:
```typescript
const audioContext = new AudioContext();
```
Mỗi khi đứa trẻ bấm nút ghi âm, một đối tượng `AudioContext` mới được khởi tạo để kết nối với luồng âm thanh của micro. Khi bấm dừng ghi âm trong hàm `stopRecording` (dòng 30-40), mã nguồn chỉ dừng luồng `mediaRecorder` mà **hoàn toàn không gọi lệnh `audioContext.close()`**.
Tương tự, trong tệp `app/lib/audio.ts` tại dòng 8, hàm chuyển đổi dữ liệu âm thanh `audioToWav` tiếp tục khởi tạo thêm một đối tượng nữa:
```typescript
const audioContext = new AudioContext({ sampleRate: targetSampleRate });
```
Và sau khi xử lý xong mảng đệm, hàm này cũng bỏ quên, không hề đóng đối tượng.

Trên các trình duyệt di động như Chrome Android và Safari iOS, hệ điều hành giới hạn nghiêm ngặt mỗi trang web chỉ được phép mở tối đa từ bốn đến sáu đối tượng `AudioContext` đồng thời để bảo vệ phần cứng. 
Khi một đứa trẻ phát âm sai một từ, trẻ bấm ghi âm lần một, lần hai rồi lần ba. Lúc này, số lượng `AudioContext` mở ngầm vượt quá trần cho phép. Trình duyệt lập tức khóa chặt cổng âm thanh và ném ngoại lệ.
Hệ thống hiển thị một thông báo đỏ lòm bằng tiếng Anh tại dòng 92 của `Recorder.tsx`:
```typescript
setError('Could not access the microphone. Please check your browser permissions.');
```
Thông báo này đánh lừa người dùng rằng quyền truy cập micro bị từ chối, nhưng sự thật là mã nguồn đã làm tràn bộ nhớ âm thanh của thiết bị. Đứa trẻ hoảng sợ đưa điện thoại cho mẹ. Người mẹ công nhân không biết cách vào cài đặt trình duyệt để xử lý. Buổi học bị phá hủy hoàn toàn bởi sự cẩu thả trong quản lý bộ nhớ.

### 3. Vòng lặp đo âm lượng sáu mươi khung hình mỗi giây đốt cháy pin
Trong cùng tệp `app/components/Recorder.tsx` từ dòng 59 đến dòng 66:
```typescript
const trackVolume = () => {
  analyser.getByteFrequencyData(dataArray);
  const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
  setVolume(Math.min(100, Math.round((average / 255) * 100)));
  animFrameRef.current = requestAnimationFrame(trackVolume);
};
```
Mã nguồn sử dụng `requestAnimationFrame` để đo cường độ âm thanh phòng trọ và liên tục gọi hàm thay đổi trạng thái `setVolume()`. Việc này cưỡng ép React component phải tính toán và vẽ lại giao diện (re-render) sáu mươi lần trong một giây trên luồng chính. 
Kết hợp với việc tệp `app/app/globals.css` (dòng 60-160) duy trì sáu hiệu ứng hoạt họa CSS chạy vòng lặp vô tận (`gl-float`, `gl-sparkle`, `gl-glow-pulse`, `gl-bounce-jump`, `gl-wave`, `gl-pulse-ring`) cùng các lớp nền bay lượn (`FloatingDecor.tsx`), các vi xử lý cấp thấp của MediaTek hay Snapdragon trên điện thoại cũ luôn phải hoạt động hết công suất. Chiếc điện thoại nóng ran chỉ sau mười phút học, và viên pin đã chai của phụ huynh sụt giảm hai mươi đến ba mươi phần trăm dung lượng.

### 4. Chuỗi trễ năm chặng khi phát âm thanh từ vựng
Toàn bộ mã nguồn GreenLeaf không chứa bất kỳ một tệp âm thanh tĩnh (`.mp3` hay `.wav`) nào của giáo viên được lưu trữ sẵn cục bộ.
Để phát một tiếng đọc mẫu đơn giản của từ `"Apple"` trên web, hệ thống phải trải qua một chuỗi xử lý mạng gồm năm chặng trung gian:
1. Trình duyệt của học sinh gửi yêu cầu POST lên máy chủ Next.js tại `/api/tts`.
2. Máy chủ Next.js kết nối sang Supabase Storage, gọi hàm `list()` để kiểm tra xem tệp âm thanh đã tồn tại trong kho lưu trữ hay chưa (`app/app/api/tts/route.ts:46-48`).
3. Nếu chưa có, máy chủ Next.js tiếp tục gửi yêu cầu qua giao thức REST sang dịch vụ Azure Speech TTS của Microsoft để tổng hợp giọng đọc (`route.ts:69-80`).
4. Nhận được dữ liệu nhị phân từ Microsoft, máy chủ tải tệp MP3 này ngược lên Supabase Storage (`route.ts:94-98`).
5. Trình duyệt nhận được đường dẫn công khai, khởi tạo thẻ `new Audio(url)` và bắt đầu tải luồng âm thanh về máy để phát.

Trên đường truyền mạng ba gờ chập chờn tại các khu nhà trọ, chuỗi năm chặng này tạo ra độ trễ từ hai phẩy năm đến năm giây cho mỗi từ vựng. Đứa trẻ bấm vào biểu tượng chiếc loa, thấy máy im lìm tưởng hỏng, liền bấm liên tiếp ba bốn lần. Mã nguồn tại `app/lib/tts.ts` (dòng 9-38) cài đặt cơ chế `currentPlayToken`: khi một yêu cầu mới được kích hoạt, nó lập tức hủy lệnh phát của yêu cầu trước đó. Kết quả là các yêu cầu tự triệt tiêu lẫn nhau, chiếc điện thoại hoàn toàn câm lặng, đứa trẻ không thể nghe được âm thanh mẫu để học theo.

Trên ứng dụng di động, mã nguồn phụ thuộc hoàn toàn vào dịch vụ đọc giọng nói có sẵn của hệ điều hành qua thư viện `expo-speech` (`mobile/src/lib/audio.ts:27`):
```typescript
Speech.speak(text, { language: 'en-US', pitch: 1.05, rate });
```
Trên các dòng máy Android xách tay nội địa Trung Quốc giá rẻ phổ biến trong các gia đình công nhân (Xiaomi, Vivo, Realme), gói giọng đọc tiếng Anh Mỹ (`en-US`) của Google Text-to-Speech thường bị nhà sản xuất lược bỏ để giảm dung lượng hệ điều hành. Khi ứng dụng gọi lệnh này, chiếc máy không phát ra bất kỳ âm thanh nào. Phần mềm không hề có cơ chế kiểm tra sự tồn tại của gói ngôn ngữ, cũng không có phương án dự phòng bằng âm thanh tải sẵn.

### 5. Treo chết mã lỗi 422 của Azure Speech và bẫy giam lỏng trẻ nhỏ
Dịch vụ đánh giá phát âm của GreenLeaf phụ thuộc hoàn toàn vào đám mây Microsoft Azure Speech (`app/app/api/assess/route.ts:51-62`).
Cấu hình ngôn ngữ bị gán cứng là tiếng Anh chuẩn Bắc Mỹ: `language=en-US`. 
Thuật toán tính điểm tại dòng 85 cộng dồn bốn chỉ số theo công thức:
```typescript
const overallScore = Math.round((accuracyScore + fluencyScore + completenessScore + prosodyScore) / 4);
```
Trẻ em người Việt từ bốn đến sáu tuổi có cấu tạo thanh quản chưa hoàn thiện, phát âm ngập ngừng và ngữ điệu hoàn toàn xa lạ với âm chuẩn của người lớn bản xứ. Khi tính gộp cả độ lưu loát (`Fluency`) và ngữ điệu (`Prosody`), điểm tổng của trẻ thường xuyên bị dìm xuống mức bốn mươi đến sáu mươi điểm, trong khi ngưỡng đạt của bài học bị đặt ở mức quá cao là tám mươi điểm (`PASS_THRESHOLD = 80`).

Sự bế tắc thực sự diễn ra khi phòng trọ có tiếng ồn. Tiếng quạt trần quay, tiếng xe tải chạy ngoài đường quốc lộ, tiếng nói chuyện của phòng bên làm lẫn tạp âm vào bản ghi. Dịch vụ Azure Speech không thể bóc tách được giọng nói sẽ trả về mã lỗi HTTP 422: `error: 'No recognition result'` (`route.ts:72-74`).
Hãy xem mã nguồn web xử lý trường hợp này tại `app/components/missions/WordsExplorer.tsx` dòng 92 đến 95:
```typescript
} catch (err) {
  console.error(err);
  setAssessError('Could not score your recording. Please try again.');
}
```
Biến đếm số lần thử `attempts` **chỉ được tăng lên khi máy chủ trả về kết quả chấm điểm hợp lệ** (`res.overallScore < PASS_THRESHOLD`). Khi Azure ném lỗi 422 hoặc mạng rớt gói, luồng xử lý nhảy thẳng vào khối `catch`. Biến `attempts` giữ nguyên giá trị không.
Điều kiện để hiện nút cho phép bỏ qua từ khó là `canSkip = !passed && attempts >= MAX_ATTEMPTS` (dòng 48).
Vì `attempts` không bao giờ tăng, nút `"Skip for now →"` **không bao giờ xuất hiện**.
Đứa trẻ bị giam lỏng vĩnh viễn ở một từ duy nhất. Trẻ đọc đi đọc lại mười lần, máy liên tục báo dòng chữ đỏ tiếng Anh đòi thử lại. Trẻ khóc vì bất lực và bỏ cuộc.

### 6. Trò bịa điểm ngẫu nhiên trên ứng dụng di động khi mất mạng
Trên ứng dụng di động, để che đậy sự yếu kém của đường truyền mạng, kỹ sư lập trình đã cài cắm một đoạn mã dối trá trắng trợn.
Hãy nhìn vào tệp `mobile/src/lib/assess.ts` từ dòng 104 đến dòng 114:
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
Khi mạng ba gờ tại phòng trọ bị ngắt hoặc kết nối đến máy chủ bị nghẽn thời gian, hàm đánh giá không báo lỗi mạng, mà tự động sinh ra một điểm số ngẫu nhiên từ **tám mươi lăm đến chín mươi chín điểm**.
Bởi vì ngưỡng qua bài là tám mươi điểm, nên hễ mất mạng là đứa trẻ nói bất kỳ từ gì, thậm chí không nói gì, hét vào mic hoặc để tiếng chó sủa lọt vào, hệ thống đều chấm chín mươi điểm, hiển thị ba ngôi sao xanh và cho qua bài.
Đây là sự gian lận trong thiết kế phần mềm giáo dục. Nó ru ngủ đứa trẻ và phụ huynh bằng điểm số ảo, tước đoạt toàn bộ giá trị rèn luyện thực chất.

### 7. Mất sạch tiến độ khi rớt mạng ở cuối bài học
Khi một đứa trẻ nỗ lực học xong toàn bộ bài học, sự cố rớt mạng ở giây cuối cùng sẽ xóa sạch toàn bộ công sức của trẻ.
Hãy kiểm tra `mobile/src/screens/LessonPlayerScreen.tsx` từ dòng 143 đến dòng 181:
```typescript
try {
  await supabase.from('greenleaf_student_progress').upsert(progressRows, ...);
  await supabase.from('greenleaf_rewards').upsert({...});
} catch (err) {
  console.warn('Error saving progress:', err);
} finally {
  setSaving(false);
  setStepIndex(missions.length + 1); // Luôn chuyển sang màn hình Celebration.
}
```
Khối lệnh bắt lỗi chỉ in ra một dòng cảnh báo trên cửa sổ điều khiển của lập trình viên (`console.warn`). Khối `finally` bất chấp việc lưu dữ liệu thành công hay thất bại, vẫn nhảy sang màn hình chúc mừng `"Awesome Job! +5 Leaves Earned"`.
Đứa trẻ mừng rỡ bấm quay về màn hình chính. Component `StudentHomeScreen` tải lại dữ liệu từ máy chủ. Do lệnh lưu dữ liệu trước đó đã thất bại vì rớt mạng, bài học vừa làm vẫn ở trạng thái chưa hoàn thành, số lá thưởng vẫn là con số không tròn trĩnh.
Hệ thống hoàn toàn không có hàng đợi đồng bộ ngoại tuyến (Offline Sync Queue) để lưu dữ liệu vào bộ nhớ máy và tự động đẩy lên máy chủ khi có mạng trở lại. Công sức học tập của đứa trẻ biến mất không một dấu vết.

### 8. Lỗi logic khóa vĩnh viễn bài học số hai trên ứng dụng di động
Tại tệp `mobile/src/screens/StudentHomeScreen.tsx` dòng 162:
```typescript
const isUnlocked = l.is_unlocked ?? (l.order_index === 1);
```
Đoạn mã này quy định trạng thái mở khóa của bài học trên điện thoại di động. Kỹ sư lập trình chỉ kiểm tra nếu bài học có thứ tự bằng một (`order_index === 1`) thì mới mở khóa. Mã nguồn **hoàn toàn không có logic kiểm tra xem bài học trước đó đã được học sinh hoàn thành hay chưa** (trong khi trên web có đoạn mã kiểm tra tiến trình tại `app/app/grades/page.tsx:66-95`).
Hậu quả thực tế: Toàn bộ bài học từ Lesson 2, Lesson 3 trở đi đều bị gắn cờ khóa vĩnh viễn (`🔒 Locked by Teacher`).
Dù đứa trẻ có học xong Lesson 1 mười lần với điểm số tuyệt đối, khi bấm vào Lesson 2, ứng dụng vẫn ném ra một hộp thoại cảnh báo bằng tiếng Anh (dòng 175):
```typescript
Alert.alert(
  '🔒 Lesson Locked',
  'Your teacher will unlock "${lesson.title}" when your class is ready! Keep practicing your open lessons! 🍃',
  [{ text: 'Got it!' }]
);
```
Đứa trẻ bị chặn đứng hoàn toàn lộ trình học tập trên ứng dụng di động ngay sau bài học đầu tiên. Nếu giáo viên không dùng máy tính đăng nhập vào trang quản trị để mở khóa thủ công từng bài cho từng em, hệ thống di động hoàn toàn tê liệt.

---

## Phần III: Kênh kết nối phụ huynh công nhân (Parent Loop) — Vòng lặp bị bỏ rơi

### 1. Sự biến mất hoàn toàn của phụ huynh trên ứng dụng di động
Tìm kiếm toàn bộ các tệp nguồn trong thư mục `mobile/src/`:
Từ khóa `parent` xuất hiện không lần nào liên quan đến người dùng. Sự xuất hiện duy nhất của chuỗi ký tự này nằm trong mã màu CSS `transparent`.
Ứng dụng di động được cài đặt trực tiếp trên chiếc điện thoại mà phụ huynh cầm theo đi làm ca kíp hàng ngày **hoàn toàn không có bất kỳ một tính năng nào dành cho cha mẹ**. Không có màn hình xem tiến độ, không có mã khóa phụ huynh, không có tóm tắt số bài con đã học. Người trả tiền học phí và là chỗ dựa duy nhất của đứa trẻ bị xóa tên hoàn toàn trên nền tảng di động.

### 2. Bảng điều khiển web bằng tiếng Anh và sự trừng phạt tâm lý
Kênh tương tác phụ huynh duy nhất của GreenLeaf nằm trên giao diện web (`app/app/parent/dashboard/page.tsx`).
Để tiếp cận kênh này, phụ huynh phải đối mặt với một loạt rào cản hành chính:
- Bắt buộc đăng nhập bằng Email và Password (`app/app/login/page.tsx:24`). Một công nhân may hay công nhân lắp ráp linh kiện không kiểm tra hòm thư điện tử hàng ngày, không dùng máy tính bàn ở nhà.
- Phụ huynh không thể tự nhận con. Giáo viên phải mở trang quản trị tài khoản (`app/app/teacher/accounts/page.tsx:350-375`), tìm tên phụ huynh rồi bấm chọn từng học sinh để ghép nối thủ công trong cơ sở dữ liệu.

Khi đăng nhập được vào bảng điều khiển, những gì hiện ra trước mắt người cha người mẹ sau mười hai tiếng tăng ca mệt mỏi là một giao diện bằng tiếng Anh một trăm phần trăm:
- `"Speaking done"`, `"Writing Submitted / Not yet"`, `"Leaves earned"`, `"Day streak"`.
- `"Quick Tip: Practicing 10 minutes every day helps build confidence..."`.
- Danh sách lịch sử học tập (`app/components/StudentHistory.tsx:118-152`) phơi bày toàn bộ các bản ghi nhật ký kỹ thuật của dịch vụ chấm điểm Azure:
  ```text
  Words Explorer — "apple" | 78 (Dấu X đỏ)
  Phonics — "The cat" | 64 (Dấu X đỏ)
  Speaking Challenge — "I see a bird" | 55 (Dấu X đỏ)
  ```
Người phụ huynh không có trình độ tiếng Anh, mở màn hình ra thấy toàn số điểm dưới tám mươi và chi chít những dấu gạch chéo màu đỏ. Những con số thấp lè tè cùng hàng loạt dấu đỏ khiến người cha người mẹ hoang mang, tự ti và nghi ngờ năng lực của con mình. Bảng điều khiển này không cung cấp bất kỳ một đoạn ghi âm thực tế nào để cha mẹ bấm vào nghe giọng nói ngọng nghịu đáng yêu của con trong năm giây.

### 3. Đề xuất mô hình thông báo "Một chạm năm giây" qua Zalo Bot
Một gia đình công nhân không cần và không thể vận hành một cổng thông tin web phức tạp. Kênh kết nối duy nhất tồn tại thường trực trên điện thoại của họ là ứng dụng Zalo.
Mô hình kết nối phụ huynh thực tế phải tuân thủ nghiêm ngặt nguyên tắc **"Một chạm - Năm giây"**:
- **Không cài thêm ứng dụng, không bắt nhớ mật khẩu web**.
- Sau mỗi buổi học khi trẻ tích lũy đủ ba bài học hoặc hoàn thành một chặng, hệ thống phụ trợ (Backend Webhook) tự động gửi một tin nhắn qua Zalo Official Account hoặc Zalo Bot cá nhân của trung tâm tới số điện thoại của mẹ.
- **Cấu trúc tin nhắn năm giây**:
  1. Một hình ảnh thiệp chúc mừng tươi sáng kèm huy hiệu: *"Bé Lyn vừa hoàn thành bài học Đồ Chơi với 3 ngôi sao chăm chỉ."*.
  2. Một nút bấm âm thanh duy nhất: Bấm vào nghe trực tiếp đoạn ghi âm dài năm giây giọng đứa con phát âm từ *"Teddy Bear"*.
  3. Một lời nhắc nhở ấm áp bằng tiếng Việt: *"Mẹ về nhớ ôm và khen con nhé."*.
Người mẹ đang đứng ở trạm xe buýt đưa đón công nhân hoặc đang ngồi nghỉ giữa ca chỉ cần liếc mắt trong năm giây, nghe thấy tiếng con nói qua chiếc tai nghe là đủ xua tan mọi mệt mỏi và tin tưởng tuyệt đối vào trung tâm. Đó là sự gắn kết thực chất, có da có thịt giữa gia đình và nhà trường.

---

## Phần IV: Bảng ma trận Gap Analysis (Hiện trạng code vs Thực tế hiện trường vs Giải pháp kỹ thuật)

| Hạng mục rà soát | Tệp mã nguồn & Dòng vi phạm | Hành vi hiện tại trong mã nguồn | Thực tế hiện trường công nhân ngoại ô | Giải pháp kỹ thuật thay thế cụ thể |
| :--- | :--- | :--- | :--- | :--- |
| **Xác thực học sinh** | `app/app/login/page.tsx:93-114`<br>`mobile/src/screens/LoginScreen.tsx:89-112` | Bắt nhập tài khoản và mật khẩu bằng bàn phím chữ; giao diện tiếng Anh; pop-up 5 trang văn bản chặn màn hình. | Trẻ 4-6 tuổi chưa biết đọc chữ; bố mẹ làm ca không có nhà gõ hộ; không thể vào học. | Quét mã QR in trên thẻ học sinh bằng camera; hỗ trợ mã PIN 4 số to hoặc chọn hình con vật đại diện; lưu token vĩnh viễn trên máy. |
| **Bảo vệ phiên làm việc** | `mobile/src/screens/StudentHomeScreen.tsx:203`<br>`mobile/App.tsx:41-45` | Nút Logout kích thước nhỏ nằm ở góc trên bên phải, bấm vào là đăng xuất ngay không hỏi lại. | Ngón tay trẻ quẹt trúng góc màn hình làm văng tài khoản, không tự đăng nhập lại được. | Chuyển nút đăng xuất vào sâu trong phần cài đặt; thêm câu đố phụ huynh (phép cộng hai số đơn giản) trước khi cho phép thoát. |
| **Hiển thị bản đồ học tập** | `app/components/missions/StudentWorldMap.tsx:130-132`<br>`app/app/grades/page.tsx:33` | Đặt chiều rộng tối thiểu 760 pixel bên trong khối cắt ẩn `overflow-hidden`, che giấu danh sách dọc. | Màn hình điện thoại 360 pixel bị cắt mất 3/4 bản đồ, giấu hoàn toàn các bài học từ Unit 2 đến Unit 4. | Nhận diện màn hình nhỏ hơn 640 pixel để tự động kích hoạt chế độ danh sách dọc (`LessonPathList.tsx`); cho phép cuộn ngang bản đồ mượt mà. |
| **Tiến trình bài học Mobile** | `mobile/src/screens/StudentHomeScreen.tsx:162` | Gán trạng thái mở khóa `is_unlocked ?? (order_index === 1)`, không kiểm tra tiến độ bài trước. | Đứa trẻ hoàn thành xong bài 1 nhưng toàn bộ bài từ bài 2 trở đi đều bị khóa cứng vĩnh viễn. | Sửa logic mở khóa: bài thứ `N` tự động mở khi bài thứ `N-1` đã hoàn thành đủ các phần học. |
| **Số lần thao tác bài học** | `WordsExplorer.tsx:215`<br>`MissionIntro.tsx:100`<br>`MissionCelebration.tsx:94` | Bắt bấm 34 lần mỗi bài học; phải bấm qua các màn hình chúc mừng và bấm nút để chuyển từ tiếp theo. | Trẻ mầm non không biết tìm nút bấm nhỏ; thao tác đứt đoạn làm nản lòng trẻ nhỏ. | Bật chế độ tự động chuyển bài (0-Click Auto-Advance): sau khi nói đạt điểm, tự đếm ngược 1.2 giây và nhảy sang câu tiếp theo. |
| **Hình ảnh minh họa từ vựng** | `mobile/src/screens/LessonPlayerScreen.tsx:321-419`<br>`app/public/images/ (404)` | Ứng dụng di động không có thẻ ảnh minh họa nào trong bài học; web bị lỗi 404 ảnh seed. | Trẻ học vẹt mặt chữ đen trắng; triệt tiêu phương pháp liên tưởng trực quan hình ảnh sớm. | Đưa ảnh minh họa độ nét cao kích thước lớn vào bài học di động; sửa lại đường dẫn tĩnh trên web hoặc dùng ảnh vector SVG nhẹ. |
| **Quản lý bộ nhớ âm thanh** | `app/components/Recorder.tsx:52`<br>`app/lib/audio.ts:8` | Tạo đối tượng `new AudioContext()` liên tục nhưng không bao giờ gọi hàm `.close()`. | Trình duyệt di động bị tràn giới hạn phần cứng sau 3-6 lần thu âm, làm tê liệt cổng micro của máy. | Dùng một biến tham chiếu duy nhất (`useRef`), gọi hàm `audioContext.close()` ngay khi dừng thu âm hoặc giải phóng component. |
| **Thuật toán dừng thu âm** | `Recorder.tsx:30-40`<br>`AudioRecorderButton.tsx:48-93` | Cơ chế thu âm 2 chạm; không có thuật toán phát hiện khoảng lặng (VAD) và không có bộ đếm giờ tự ngắt. | Trẻ nói xong buông máy; tiếng quạt cây rè rè hoặc mưa gõ mái tôn fibro-xi măng làm mic thu tạp âm liên tục suốt cả phút, sinh file WAV nặng hàng megabyte làm tê liệt VAD. | Bật bộ lọc chống ồn phần cứng (`noiseSuppression: true`); tích hợp VAD tự ngắt sau 1.5 giây im lặng; đặt thời gian ngắt cứng 4 giây cho 1 từ vựng chống tiếng quạt cây và mưa mái tôn; chuyển sang thu âm 1 chạm. |
| **Chấm điểm giọng nói đám mây** | `app/app/api/assess/route.ts:51-85`<br>`WordsExplorer.tsx:92-95` | Gán chuẩn người lớn `en-US`, chấm gộp cả Fluency và Prosody, lỗi 422 không tăng biến đếm số lần thử. | Phòng trọ ồn ào bị lỗi 422, biến đếm không tăng làm ẩn nút Skip vĩnh viễn, giam lỏng trẻ ở 1 từ duy nhất. | Bỏ chấm Fluency và Prosody cho lứa tuổi mầm non; hạ điểm đạt xuống 65 điểm nhưng bắt buộc kiểm tra khớp tối thiểu phụ âm chính của từ để chống điểm giả khi tạp âm phòng trọ hoặc tivi phòng bên lọt vào; tăng biến đếm số lần thử cả khi gặp lỗi mạng/422. |
| **Chấm điểm khi mất mạng** | `mobile/src/lib/assess.ts:104-114` | Tự động sinh điểm ngẫu nhiên từ 85 đến 99 khi rớt mạng hoặc máy chủ không phản hồi. | Trẻ nói sai hoặc phòng trọ ồn ào vẫn được 90 điểm; gian lận kết quả học tập thực chất của trẻ. | Xóa bỏ đoạn mã sinh điểm ngẫu nhiên; khi mất mạng thì lưu bản ghi âm vào máy để chấm lại sau khi có kết nối. |
| **Đồng bộ kết quả học tập** | `mobile/src/screens/LessonPlayerScreen.tsx:143-181` | Nuốt lỗi bằng `console.warn` khi lưu thất bại; vẫn hiện màn hình chúc mừng rồi làm mất sạch dữ liệu. | Mạng phòng trọ chập chờn lúc cuối bài làm biến mất toàn bộ tiến trình và lá thưởng của trẻ. | Tích hợp hàng đợi đồng bộ ngoại tuyến bằng AsyncStorage hoặc SQLite cục bộ; áp dụng cơ chế đồng bộ tuần tự (Sequential Queue) có giãn cách (exponential backoff) để chống nghẽn mạng cục bộ và tràn bộ nhớ máy rẻ khi có mạng trở lại. |
| **Định dạng âm thanh Android** | `AudioRecorderButton.tsx:19-23` | Cấu hình Android dùng bộ mã hóa mặc định nhưng gán đuôi tệp `.wav`. | Tạo ra tệp âm thanh bị lỗi định dạng codec, máy chủ Azure Speech từ chối giải mã bản ghi. | Cấu hình bộ thu âm xuất chuẩn Linear PCM WAV 16kHz đơn kênh hoặc nén AAC tương thích hoàn toàn với backend. |
| **Kích thước ảnh linh vật** | `app/public/leafy/hero_wave.webp`<br>`mobile/assets/leafy/hero_wave.webp` | Tệp ảnh WebP nặng hơn 1.0 MB được nạp trực tiếp trên luồng giao diện chính vào khung ảnh 72 pixel. | Máy Android 2GB RAM bị tràn bộ nhớ đồ họa, sụt giảm khung hình, khựng đơ giao diện khi mở trang chủ. | Nén ảnh từ 1.0 MB xuống dưới 40 KB; sử dụng thư viện `expo-image` để giải mã đa luồng ngầm ngoài luồng chính. |
| **Bài tập về nhà** | `app/app/homework/page.tsx:142-156`<br>`HomeworkScreen.tsx:142-167` | Bắt gõ đoạn văn tiếng Anh vào ô văn bản nhiều dòng trên bàn phím ảo của điện thoại nhỏ. | Trẻ mầm non và tiểu học chưa biết gõ bàn phím tiếng Anh; phụ huynh không thể ngồi gõ thay cho con. | Đổi sang hình thức kéo thả từ thành câu, ghi âm giọng nói hoặc chụp ảnh trang vở viết tay; nén ảnh phía client xuống dưới 200KB (WebP/JPEG 70%) trước khi nộp lên Supabase Storage; thiết kế giao diện chấm nhanh theo mẻ (batch review) cho giáo viên chống quá tải và tránh cạn kiệt storage. |
| **Ngôn ngữ định nghĩa từ vựng** | `0017_word_meanings_english.sql:24` | Xóa nghĩa tiếng Việt, thay bằng định nghĩa tiếng Anh dài dòng ("a small animal with scaly skin"). | Trẻ nhỏ không hiểu nghĩa; biến việc học thành đọc vẹt âm thanh không có liên kết ngữ nghĩa thực tế. | Khôi phục định nghĩa tiếng Việt ngắn gọn, dễ hiểu kết hợp với hình ảnh trực quan lớn và giọng đọc tiếng Việt hỗ trợ. |
| **Kênh thông tin phụ huynh** | `mobile/src/ (0%)`<br>`parent/dashboard/page.tsx:68-154` | Ứng dụng di động không có tính năng phụ huynh; web bắt đăng nhập email và hiển thị toàn dấu gạch chéo đỏ. | Bố mẹ công nhân không dùng máy tính, hoang mang khi thấy toàn dấu đỏ và số liệu kỹ thuật tiếng Anh. | Xây dựng dịch vụ Zalo Bot tự động gửi tin nhắn 5 giây (ảnh huy hiệu + nút nghe 5 giây audio); phụ huynh quét mã Zalo cấp quyền một lần tại trung tâm để tối ưu chi phí ZNS/Zalo OA; mã hóa đường dẫn audio bằng URL có chữ ký hết hạn sau 24 giờ (signed URL with 24h TTL) bảo vệ quyền riêng tư của trẻ. |

---

## Phần V: Kế hoạch hành động kỹ thuật (Action Plan & Prioritization)

### 🔴 Mức P0: Khẩn cấp (Sửa ngay lập tức để cứu sống ứng dụng và chống tê liệt)

1. **Vá lỗ hổng rò rỉ bộ nhớ AudioContext trên Web**:
   - *Tệp cần sửa*: `app/components/Recorder.tsx`, `app/lib/audio.ts`.
   - *Thao tác*:
     - Khởi tạo một đối tượng `AudioContext` duy nhất thông qua `useRef` hoặc gọi phương thức `.close()` ngay trong khối `finally` của hàm dừng thu âm và hàm dọn dẹp khi unmount component.
     - Đóng đối tượng `AudioContext` sau khi hàm `audioToWav` trích xuất xong mảng đệm âm thanh.
     - Chặn đứng hoàn toàn hiện tượng báo lỗi quyền micro giả mạo sau ba lần thu âm.

2. **Khắc phục lỗi treo chết mã 422 và logic bỏ qua bài học (Deadlock Skip Fix)**:
   - *Tệp cần sửa*: `app/components/missions/WordsExplorer.tsx`, `PhonicsChant.tsx`, `SpeakingChallenge.tsx`.
   - *Thao tác*:
     - Di chuyển lệnh tăng biến đếm số lần thử `setAttempts(prev => prev + 1)` lên trước khối gọi API hoặc đặt trong khối `finally`.
     - Cho phép nút `"Skip for now →"` xuất hiện ngay khi trẻ gặp lỗi mạng hoặc lỗi nhận diện âm thanh quá hai lần.
     - Hạ ngưỡng hiển thị nút bỏ qua từ ba lần xuống hai lần để giải phóng trẻ khỏi bế tắc phòng trọ ồn ào.

3. **Xóa bỏ mã nguồn sinh điểm ảo gian lận trên ứng dụng di động**:
   - *Tệp cần sửa*: `mobile/src/lib/assess.ts`.
   - *Thao tác*:
     - Xóa bỏ hoàn toàn hàm tạo điểm ngẫu nhiên `Math.floor(Math.random() * 15) + 85`.
     - Khi mất mạng hoặc máy chủ không phản hồi, trả về trạng thái mạng ngoại tuyến rõ ràng (`status: 'offline_saved'`).
     - Lưu tệp âm thanh của trẻ vào bộ nhớ máy để gửi chấm lại khi có mạng, tuyệt đối không lừa dối trẻ bằng điểm số giả.

4. **Sửa lỗi khóa cứng bài học số hai trên ứng dụng di động**:
   - *Tệp cần sửa*: `mobile/src/screens/StudentHomeScreen.tsx`.
   - *Thao tác*:
     - Thay thế dòng logic `isUnlocked = l.is_unlocked ?? (l.order_index === 1)` bằng logic kiểm tra tiến độ thực tế: Một bài học được mở khóa nếu bài học liền trước nó đã hoàn thành đủ số phần học hoặc điểm trung bình đạt yêu cầu.
     - Trả lại quyền tự học liên tục cho học sinh mà không cần giáo viên can thiệp thủ công từng bài.

5. **Sửa lỗi vỡ giao diện bản đồ trên màn hình 360 pixel**:
   - *Tệp cần sửa*: `app/app/grades/page.tsx`, `app/components/missions/StudentWorldMap.tsx`.
   - *Thao tác*:
     - Kiểm tra kích thước cửa sổ hiển thị: nếu chiều rộng màn hình nhỏ hơn 640 pixel, ứng dụng tự động hiển thị danh sách dọc `LessonPathList.tsx` thay cho bản đồ nằm ngang.
     - Nếu người dùng vẫn chọn xem bản đồ, thay thế thuộc tính `overflow-hidden` bằng `overflow-x-auto` và hỗ trợ thanh cuộn cảm ứng mượt mà để trẻ vuốt sang phải xem Unit 2, Unit 3, Unit 4.

6. **Bảo vệ nút đăng xuất trên ứng dụng di động**:
   - *Tệp cần sửa*: `mobile/src/screens/StudentHomeScreen.tsx`.
   - *Thao tác*:
     - Di chuyển biểu tượng đăng xuất vào màn hình thông tin cá nhân (`ProfileScreen`).
     - Bổ sung hộp thoại xác nhận kèm một câu hỏi khóa phụ huynh đơn giản (ví dụ: *"Ba cộng hai bằng mấy?"*) trước khi xóa phiên đăng nhập.

7. **Bổ sung hình ảnh Flashcard cho bộ phát bài học di động**:
   - *Tệp cần sửa*: `mobile/src/screens/LessonPlayerScreen.tsx`.
   - *Thao tác*:
     - Đưa component thẻ hình ảnh minh họa cỡ lớn vào giữa màn hình cho từng từ vựng và từng câu vần điệu.
     - Chấm dứt tình trạng bài học chỉ toàn chữ đen trắng trên nền kem.

---

### 🟡 Mức P1: Quan trọng (Tối ưu trải nghiệm tự học 0-click và mạng chập chờn)

1. **Thiết lập luồng tự động chuyển bài không cần bấm (0-Click Auto-Advance)**:
   - *Tệp cần sửa*: `WordsExplorer.tsx`, `PhonicsChant.tsx`, `LessonPlayerScreen.tsx`, `MissionCelebration.tsx`.
   - *Thao tác*:
     - Khi học sinh đạt điểm chuẩn, ứng dụng tự động phát âm thanh chuông leng keng khen ngợi, hiển thị hoạt họa ngôi sao và tự động nhảy sang thẻ từ tiếp theo sau một giây đếm ngược.
     - Loại bỏ các màn hình chúc mừng trung gian bắt bấm nút tiếp tục giữa các phần học. Giảm số lần bấm ngón tay từ ba mươi tư lần xuống dưới tám lần cho mỗi bài học.

2. **Tự động ngắt thu âm bằng phát hiện im lặng (VAD), lọc chống ồn và thời gian ngắt cứng**:
   - *Tệp cần sửa*: `app/components/Recorder.tsx`, `mobile/src/components/AudioRecorderButton.tsx`.
   - *Thao tác*:
     - Kích hoạt bộ lọc chống ồn phần cứng (`noiseSuppression: true`, `echoCancellation: true`) ngay khi mở luồng audio stream trên web (`getUserMedia`) và mobile.
     - Chuyển sang cơ chế thu âm một chạm: trẻ bấm vào mic một lần, nói xong im lặng một phẩy năm giây thì máy tự động ngắt và gửi đi chấm.
     - Cài đặt thời gian ngắt cứng (hard timeout) tối đa bốn giây cho từ vựng đơn và sáu giây cho câu hoàn chỉnh. Biện pháp này phòng ngừa trường hợp tiếng quạt cây rè rè hoặc tiếng mưa rào xối xả gõ mái tôn fibro-xi măng làm mức năng lượng tạp âm nền luôn vượt ngưỡng im lặng khiến VAD bị tê liệt. Đồng thời giảm dung lượng tệp tải lên từ hai megabyte xuống dưới sáu mươi kilobyte.

3. **Hạ ngưỡng điểm Azure Speech, loại bỏ Prosody và chống điểm giả**:
   - *Tệp cần sửa*: `app/app/api/assess/route.ts`.
   - *Thao tác*:
     - Đối với cấp độ mầm non và lớp một (`kindergarten`, `kids1`), loại bỏ hoàn toàn hai chỉ số `ProsodyScore` và `FluencyScore` ra khỏi công thức tính điểm tổng. Điểm tổng chỉ tính dựa trên `AccuracyScore` và `CompletenessScore`.
     - Hạ ngưỡng đạt `PASS_THRESHOLD` từ tám mươi điểm xuống sáu mươi lăm điểm để khích lệ trẻ dám cất tiếng nói.
     - Bổ sung cơ chế chống điểm giả khi hạ ngưỡng: Kiểm tra khớp tối thiểu phụ âm chính của từ mục tiêu (core consonants phoneme verification). Điều kiện này ngăn chặn nguy cơ tạp âm phòng trọ, tiếng người lớn trò chuyện hoặc tiếng tivi phòng bên đạt điểm sáu mươi lăm ảo mà đứa trẻ không cần phát âm thực chất.

4. **Khôi phục định nghĩa tiếng Việt trực quan và hỗ trợ giọng dẫn tiếng Việt**:
   - *Tệp cần sửa*: Cơ sở dữ liệu Supabase, các component hiển thị thẻ bài học.
   - *Thao tác*:
     - Khôi phục nghĩa tiếng Việt thực tế cho các từ vựng căn bản ("con thằn lằn", "con mèo").
     - Bổ sung nút bấm chiếc loa nhỏ phát giọng đọc thuyết minh tiếng Việt ấm áp của giáo viên để hướng dẫn các em chưa biết chữ.

5. **Xây dựng hàng đợi đồng bộ ngoại tuyến tuần tự (Sequential Offline Sync Queue)**:
   - *Tệp cần sửa*: `mobile/src/lib/offlineQueue.ts`, `mobile/src/screens/LessonPlayerScreen.tsx`.
   - *Thao tác*:
     - Khi hoàn thành bài học, lưu bản ghi tiến độ và lá thưởng vào `AsyncStorage` cục bộ trước.
     - Thiết lập cơ chế đồng bộ tuần tự (Sequential Queue) có giãn cách lũy thừa (exponential backoff) và giới hạn đệm tối đa năm bài học gần nhất.
     - Khi thiết bị bắt lại sóng mạng sau nhiều ngày mất kết nối, hàng đợi đẩy từng bản ghi một cách tuần tự, giãn cách. Cơ chế này loại bỏ hiện tượng nghẽn mạng cục bộ (thundering herd) và chống tràn bộ nhớ trên các dòng máy Android hai gigabyte RAM giá rẻ.

6. **Nén toàn bộ tệp ảnh đồ họa nặng**:
   - *Tệp cần sửa*: `app/public/leafy/hero_wave.webp`, `mobile/assets/leafy/hero_wave.webp`.
   - *Thao tác*:
     - Giảm độ phân giải ảnh mascot từ kích thước gốc xuống một trăm sáu mươi nhân một trăm sáu mươi pixel, nén lại bằng chuẩn WebP chất lượng bảy mươi lăm phần trăm. Đưa dung lượng tệp từ một megabyte xuống dưới ba mươi lăm kilobyte.
     - Chuyển sang sử dụng thư viện `expo-image` trên nền tảng di động để giải mã ảnh ngoài luồng giao diện chính.

7. **Cấu hình chuẩn hóa dự án Android**:
   - *Tệp cần sửa*: `mobile/app.json`, `mobile/src/components/AudioRecorderButton.tsx`.
   - *Thao tác*:
     - Bổ sung định danh gói ứng dụng `"package": "com.greenleaf.academy"` và khai báo đầy đủ quyền hạn micro, truy cập mạng trong tệp cấu hình.
     - Khai báo màn hình chờ khởi động (`splash screen`) để loại bỏ hoàn toàn hiện tượng nhấp nháy màn hình trắng trơn khi nạp ứng dụng.
     - Cấu hình bộ thu âm Android xuất đúng chuẩn PCM WAV đơn kênh tương thích hoàn hảo với dịch vụ nhận diện giọng nói.

---

### 🟢 Mức P2: Nâng cao (Gắn kết văn hóa xóm trọ và tối ưu sâu)

1. **Tích hợp kênh báo cáo phụ huynh "Một chạm năm giây" qua Zalo Bot (Kiểm soát chi phí & Bảo vệ quyền riêng tư)**:
   - *Tệp cần bổ sung*: `app/app/api/webhooks/zalo/route.ts`, bảng dữ liệu liên kết số điện thoại phụ huynh.
   - *Thao tác*:
     - Quản trị chi phí tin nhắn ZNS/Zalo OA (dao động từ hai trăm đến năm trăm đồng một tin): Triển khai quy trình phụ huynh quét mã QR Zalo Official Account cấp quyền một lần duy nhất tại trung tâm khi đăng ký học (opt-in). Quy trình này vừa tuân thủ chính sách của Zalo vừa kiểm soát chặt chẽ ngân sách gửi tin định kỳ của trung tâm.
     - Sau khi học sinh hoàn thành bài học, hệ thống gửi một tin nhắn Zalo mẫu kèm hình ảnh thiệp khen thưởng và một nút bấm nghe trích đoạn năm giây giọng đọc của con.
     - Bảo vệ quyền riêng tư của trẻ em: Đường dẫn tệp âm thanh gửi qua Zalo bắt buộc sử dụng liên kết có chữ ký hết hạn sau hai mươi tư giờ (signed URL with 24h TTL) trỏ vào Supabase Storage. Không lưu trữ hoặc phát tán các đường dẫn công khai vĩnh viễn trên mạng.

2. **Cải tiến bài tập về nhà (Nén ảnh vở viết tay & Giao diện chấm nhanh theo mẻ)**:
   - *Tệp cần sửa*: `app/app/homework/page.tsx`, `mobile/src/screens/HomeworkScreen.tsx`, cổng quản trị giáo viên.
   - *Thao tác*:
     - Thay thế ô nhập văn bản năm dòng bằng hai phương thức nộp bài thực tế: (a) Bấm nút chụp ảnh trang vở tập viết chữ ô ly bằng camera điện thoại; hoặc (b) Bấm nút ghi âm một câu trả lời ngắn bằng giọng nói.
     - Bắt buộc nén ảnh chụp trang vở phía máy khách (Client-side Compression): Tự động nén ảnh xuống dưới hai trăm kilobyte (định dạng WebP hoặc JPEG chất lượng bảy mươi phần trăm) trước khi tải lên Supabase Storage. Cơ chế này giúp tối ưu tốc độ tải trên mạng 3G yếu và ngăn chặn nguy cơ cạn kiệt dung lượng lưu trữ một gigabyte miễn phí của hệ thống.
     - Xây dựng giao diện chấm bài nhanh theo mẻ (Batch Review Interface) cho giáo viên: Thiết kế màn hình lướt duyệt tập trung với thao tác một chạm (Đạt / Nhắc sửa), giúp hai đến ba giáo viên của trung tâm xử lý trơn tru hàng trăm bài tập mỗi đêm mà không bị kiệt sức.

3. **Cắt giảm hoạt họa vô tận để bảo vệ pin máy yếu**:
   - *Tệp cần sửa*: `app/app/globals.css`, `app/components/FloatingDecor.tsx`.
   - *Thao tác*:
     - Sử dụng truy vấn phương tiện `@media (prefers-reduced-motion)` hoặc phát hiện thiết bị di động màn hình nhỏ để tắt bớt sáu hoạt họa CSS lặp vô tận.
     - Loại bỏ các thành phần bay lơ lửng trên nền khi chạy trên thiết bị giá rẻ để giảm tải tính toán cho chip đồ họa và kéo dài thời lượng pin.

---

## Lời kết & Tuyên ngôn hành động

Một sản phẩm công nghệ giáo dục dành cho con em người lao động nghèo không thể được xây dựng bằng những triết lý xa vời và sự cẩu thả trong kỹ thuật. Chiếc điện thoại thông minh cũ kỹ trong căn phòng trọ chật hẹp ở ngoại ô không có lỗi. Đứa trẻ năm tuổi nói ngọng nghịu sau một ngày dài xa cha mẹ không có lỗi. Người công nhân tăng ca mười hai tiếng trở về không có lỗi.

Lỗi thuộc về hệ thống phần mềm đã không chịu nhìn thẳng vào sự thật đời sống.

GreenLeaf chỉ có thể trở thành một công cụ học tập thực sự hữu ích khi từng dòng mã nguồn được viết ra từ sự thấu hiểu sâu sắc hiện trường: một hệ thống tự động mở ra là học được ngay không cần gõ chữ, không đòi hỏi đường truyền mạng hoàn hảo, không lừa dối bằng điểm số ảo, không làm kiệt quệ viên pin máy cũ, và trao cho người cha người mẹ công nhân một niềm tự hào giản dị, chân thực sau mỗi ca làm việc nhọc nhằn.

Đó là con đường kỹ thuật duy nhất đúng đắn cần phải thực hiện ngay hôm nay.
