# GreenLeaf English Academy — Web App

Phần mềm quản lý trung tâm Anh ngữ GreenLeaf: AI Pronunciation, Homework Writing, Reward System, Teacher Resource Library, Parent Dashboard, Learning Journey. Xem yêu cầu gốc tại [`../docs`](../docs).

**Live**: https://green-leaf-snowy.vercel.app

⚠️ **Toàn bộ UI/nội dung là tiếng Anh (chủ đích — "English immersion")**. Đây là quyết định thiết kế đã đảo ngược nguyên tắc ban đầu ("tự giải thích bằng tiếng Việt cho phụ huynh không biết tiếng Anh"). Không thêm lại text tiếng Việt vào UI/feedback/nội dung học trừ khi được yêu cầu lại rõ ràng. Docs nội bộ (README này, `CLAUDE_SESSION.md`, `docs/`) vẫn giữ tiếng Việt vì là tài liệu cho team dev, không phải nội dung app.

## Tech stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS, deploy trên Vercel
- Supabase: Postgres + Auth + Storage
- Azure Speech Service (chấm phát âm phoneme-level) — port từ [`pronunciation-app`](../../pronunciation-app)
- Google Gemini — feedback phát âm bằng **tiếng Anh** (đổi từ tiếng Việt khi UI chuyển sang English immersion)
- Unsplash API — ảnh minh hoạ thật cho từ vựng/bài học (free tier: 50 req/giờ), thay dần cho emoji placeholder

## Setup

### 1. Tạo Supabase project

Dùng chung 1 Supabase project cho nhiều app? Toàn bộ bảng, hàm, trigger và storage bucket của GreenLeaf đã có tiền tố `greenleaf_` (bucket: `greenleaf-resources`) để không đụng tên với project khác trên cùng database.

Chạy lần lượt trong SQL Editor:

1. `supabase/migrations/0001_init.sql` — schema (`greenleaf_profiles`, `greenleaf_grades`, `greenleaf_missions`, ...) + RLS
2. `supabase/migrations/0002_seed_missions.sql` — nội dung Mission demo cho 4 cấp độ
3. `supabase/migrations/0003_storage.sql` — bucket `greenleaf-resources` cho Teacher Resource Library
4. `supabase/migrations/0004_lessons.sql` — thêm bảng `greenleaf_lessons` (mỗi Grade có nhiều Lesson, mỗi Lesson có 3 Mission cố định), backfill dữ liệu demo cũ thành 1 Lesson "Demo"/grade, cho phép teacher ghi vào `greenleaf_missions`/`greenleaf_lessons`
5. `supabase/migrations/0005_writing_topics.sql` — thêm bảng `greenleaf_writing_topics` (thư viện đề bài viết, tái sử dụng nhiều lần), `greenleaf_homework_assignments` chuyển sang tham chiếu `topic_id` thay vì chứa thẳng title/prompt/grade_id, backfill assignment cũ thành topic tương ứng
6. `supabase/migrations/0006_mission_attempts.sql` — thêm bảng `greenleaf_mission_attempts` (log mọi lần học sinh thử 1 mission, INSERT-only không ghi đè — khác với `greenleaf_student_progress` chỉ giữ trạng thái mới nhất), phục vụ xem lịch sử/tiến trình/số lần học mỗi ngày
7. `supabase/migrations/0007_fix_rewards_rls.sql` — **bugfix**: `greenleaf_rewards`/`greenleaf_reward_events` trước đó chỉ có policy SELECT, thiếu INSERT/UPDATE nên mọi lần cộng Leaf bị RLS chặn âm thầm
8. `supabase/migrations/0008_student_accounts.sql` — thêm cột `username` vào `greenleaf_profiles`, cho phép giáo viên tạo tài khoản username/password cho học sinh & phụ huynh (không cần email thật), và cho teacher quyền UPDATE mọi profile (để gán `parent_id`)
9. `supabase/migrations/0009_more_lessons.sql` — seed thêm **10 Lesson mới/cấp độ** (40 lesson, 120 mission) ngoài Lesson "Demo" sẵn có, mỗi lesson vẫn đủ 3 mission cố định. Idempotent (dùng `NOT EXISTS` theo tên lesson) nên chạy lại không bị trùng.
10. `supabase/migrations/0010_tts_audio_cache.sql` — bucket `greenleaf-tts-cache` (public read) để cache audio "Nghe mẫu" theo hash(text+rate+voice) thay vì gọi Azure TTS lại mỗi lần phát — giảm chi phí + độ trễ, đặc biệt quan trọng với học sinh mạng chậm.
11. `supabase/migrations/0011_word_meanings.sql` — thêm nghĩa (`meaning`, ban đầu là tiếng Việt) cho từng từ trong 220 từ vựng đã seed (0002 + 0009). **Đã bị thay thế bằng tiếng Anh ở 0017** — chạy 0011 chỉ để có cột/dữ liệu ban đầu, giá trị cuối cùng do 0017 quyết định.
12. `supabase/migrations/0012_mission_attempt_item_label.sql` — thêm cột `item_label` vào `greenleaf_mission_attempts`, lưu đúng từ/câu đang luyện tại thời điểm ghi âm — Words Explorer/Phonics có nhiều từ/câu trong cùng 1 mission, thiếu cột này thì lịch sử chỉ thấy "Words Explorer: 64 điểm" lặp lại nhiều lần, không biết học sinh vướng ở từ/câu nào.
13. `supabase/migrations/0013_phonics_line_images.sql` — đổi `greenleaf_missions.content.lines` của mission Phonics từ mảng string sang mảng object `{text, imageUrl, imageDescription}` — ảnh minh hoạ phải gắn theo **từng câu** (giống Words Explorer gắn theo từng từ), không phải 1 ảnh dùng chung cho cả mission. Idempotent (chỉ chuyển đổi nếu phần tử đầu tiên còn là string).
14. `supabase/migrations/0014_kindergarten_phonics_one_syllable.sql` — đơn giản hoá câu Phonics/Speaking Challenge của 7 lesson Kindergarten (Colors, Family, Food, Numbers, Shapes, Weather, Fruits) về từ 1 âm tiết, phù hợp học sinh rất nhỏ tuổi. ⚠️ Ghi đè toàn bộ `content` của các lesson này nên nếu giáo viên đã nhập `imageUrl`/`imageDescription` riêng cho các dòng đó thì sẽ bị reset về `""`.
15. `supabase/migrations/0015_image_cache_bucket.sql` — bucket `greenleaf-images` (public read) để cache ảnh Unsplash theo hash(query), dùng bởi `scripts/populate-images.ts`.
16. `supabase/migrations/0016_fix_images_bucket_policy.sql` — **bảo mật**: gỡ policy INSERT công khai (không có `TO`, mặc định PUBLIC) trên bucket `greenleaf-images` mà 0015 tạo ra — bất kỳ ai cầm anon key cũng có thể ghi thẳng vào bucket qua Supabase Storage REST API. Writer hợp lệ duy nhất (`scripts/populate-images.ts`) dùng service role nên đã bypass RLS, không cần policy này.
17. `supabase/migrations/0017_word_meanings_english.sql` — dịch `meaning` của 220 từ vựng (0011) từ tiếng Việt sang tiếng Anh, khớp với quyết định English immersion. Chỉ merge field `meaning` vào từng object (không jsonb_set nguyên mảng `words` như 0011), nên **không đụng tới `imageUrl`** — an toàn kể cả khi `scripts/populate-images.ts` đã chạy trước đó.

⚠️ Nếu project đã chạy các migration cũ từ trước, **bắt buộc chạy đủ 0004 → 0017 theo thứ tự** — thiếu bất kỳ file nào cũng khiến tính năng tương ứng lỗi do RLS chặn hoặc thiếu cột.

### 2. Cấu hình `.env.local`

Copy `.env.example` → `.env.local` và điền:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — từ Supabase Settings → API
- `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` — có thể dùng chung key với `pronunciation-app` (region `southeastasia`)
- `GEMINI_API_KEY` — [Google AI Studio](https://aistudio.google.com/)
- `UNSPLASH_ACCESS_KEY` — [Unsplash Developers](https://unsplash.com/developers), free tier 50 req/giờ, chỉ cần khi chạy `scripts/populate-images.ts`

### 3. Chạy dev server

```bash
npm install
npm run dev
```

### 4. (Tuỳ chọn) Lấy ảnh minh hoạ thật cho từ vựng

```bash
npx tsx scripts/populate-images.ts
```

Script one-time: quét mọi mission `words_explorer`, với từ chưa có `imageUrl` thì tìm ảnh trên Unsplash, cache vào bucket `greenleaf-images`, ghi lại `imageUrl`. Idempotent — chạy lại chỉ xử lý từ còn thiếu ảnh, an toàn khi bị rate-limit giữa chừng (dừng, chạy lại sau).

## Luồng tài khoản

- **Giáo viên / Phụ huynh**: tự đăng ký tại `/register` bằng email thật (cần bật/tắt "Confirm email" trong Supabase Dashboard → Authentication → Providers → Email tuỳ nhu cầu demo).
- **Học sinh & Phụ huynh (cách 2, khuyến nghị cho demo)**: giáo viên tạo trực tiếp trong app tại `/teacher/accounts` — chỉ cần username + mật khẩu, **không cần email thật, không cần xác nhận email** (tạo qua Supabase Admin API với `email_confirm: true`, xem `app/api/admin/create-account`). Auth vẫn cần định dạng email nên username được quy đổi thành `<username>@greenleaf.local` nội bộ; học sinh/phụ huynh chỉ cần biết username, đăng nhập ở `/login` nhập thẳng username (không có `@`) là được.
- **Liên kết Phụ huynh ↔ Học sinh**: giáo viên vào `/teacher/accounts` → mục "Gán phụ huynh ↔ học sinh", chọn phụ huynh + tick học sinh tương ứng.
- **Đổi tên hiển thị**: mọi role bấm vào tên mình ở góc trên phải (AppHeader) → `/profile`.
- Middleware (`middleware.ts`) chặn theo role: `/grades`, `/missions`, `/journey`, `/homework` → student; `/teacher/*` → teacher; `/parent/*` → parent; `/profile` → mọi role đã đăng nhập.

## Cấu trúc chính

- `lib/azure.ts`, `lib/phoneme.ts`, `lib/audio.ts`, `lib/gemini.ts` — engine chấm phát âm (port từ pronunciation-app); `app/api/feedback` gọi Gemini sinh feedback **tiếng Anh** cho học sinh
- `lib/rewards.ts` — logic cộng Leaf (+1 mission, +5 perfect, +20 streak-7, +3 bonus khi xong cả 3 mission trong 1 lesson)
- `lib/journey.ts`, `components/tree/LearningJourneyTree.tsx` — quy tắc và hiển thị cây Learning Journey (zigzag map các Lesson đã/đang/chưa học)
- `components/missions/` — 3 loại mission UI (Words Explorer, Phonics/Sentence Builder, Speaking Challenge) + `MissionIntro.tsx`/`MissionCelebration.tsx`/`MissionTransition.tsx` (màn giới thiệu/ăn mừng/chuyển tiếp giữa các mission, có Leafy phản ứng) + `RewardCelebration.tsx` (màn cộng Leaf sau khi xong cả Lesson)
- `components/mascot/Leafy.tsx` — linh vật chính thức (ảnh thật, nhiều mood: idle/happy/cheer/thinking/oops), thay cho mascot "Brave" cũ. `components/mascot/BraveMascot.tsx` vẫn còn trong repo nhưng **không còn được import ở đâu** — dead code, có thể xoá.
- `components/brand/LeafLogo.tsx`, `components/AppFooter.tsx` — logo SVG + footer thương hiệu "GreenLeaf English Academy — Grow Beyond", dùng chung nhiều trang
- `components/student/BottomTabBar.tsx` — thanh điều hướng dưới cùng cho học sinh (Learn/Journey/Homework/Profile), thay cho điều hướng rời rạc trước đó
- `components/student/BackgroundMusic.tsx` — nhạc nền vui nhộn cho trang chủ học sinh, **sinh bằng Web Audio API chứ không load file mp3** (tiết kiệm băng thông cho học sinh mạng chậm, tránh vấn đề bản quyền), mặc định tắt (trình duyệt chặn autoplay), tự tắt khi rời trang chủ để không lẫn vào mic lúc ghi âm
- `components/teacher/LessonForm.tsx` — form giáo viên tạo Lesson mới **hoặc sửa Lesson có sẵn** (truyền `lessonId` + `initial` để chuyển sang chế độ sửa; lưu bằng `upsert` theo `(lesson_id, type)`). Mỗi câu trong Phonics có ô riêng cho **mô tả hình ảnh + link ảnh minh hoạ**; Speaking Challenge chỉ có 1 script nên vẫn dùng 1 ảnh cho cả mission — nếu giáo viên điền link ảnh thật, mission sẽ ưu tiên hiện ảnh đó thay vì emoji tự động đoán từ `lib/sentenceEmoji.ts`
- `app/teacher/lessons` — giáo viên tạo/**sửa** (icon bút chì)/xoá Lesson theo từng Grade; `app/teacher/dashboard` — tổng quan số học sinh/lớp/bài chờ chấm; `app/missions/[gradeCode]` — học sinh chọn Lesson; `app/missions/[gradeCode]/[lessonId]` — luồng học 3 mission của 1 Lesson
- `app/teacher/homework` — thư viện đề bài viết (`greenleaf_writing_topics`, tạo 1 lần) + giao bài (chọn đề có sẵn + hạn nộp, tạo `greenleaf_homework_assignments`)
- `components/StudentHistory.tsx` — lịch sử học tập chi tiết (số lần học/ngày + từng lần thử Speaking kèm đúng từ/câu đã luyện + bài Writing đã nộp), dùng chung cho `app/teacher/students/[id]` và `app/parent/students/[id]`
- `app/api/assess` — chấm điểm Azure thuần (không side-effect); `app/api/missions/complete` — ghi nhận hoàn thành + cộng Leaf + log vào `greenleaf_mission_attempts`
- `app/api/admin/create-account`, `reset-password`, `delete-account` — server-side, dùng `SUPABASE_SERVICE_ROLE_KEY`, chỉ chấp nhận request từ user có role `teacher`
- `app/teacher/accounts` — UI giáo viên tạo tài khoản học sinh/phụ huynh + gán phụ huynh ↔ học sinh
- `app/profile` — trang đổi tên hiển thị + đổi cấp độ học (chỉ role student), dùng chung mọi role
- `app/help` — hướng dẫn sử dụng chi tiết cho học sinh (tương tự `/teacher/guide` nhưng dành cho học sinh); `components/student/FirstTimeGuide.tsx` — modal các bước tự hiện lần đầu học sinh vào `/grades` (đánh dấu đã xem qua `localStorage`), có nút tắt/xem lại; icon ❓ ở header `/grades` mở lại `/help` bất cứ lúc nào
- `lib/missionAttempts.ts` — log **mọi** lần ghi âm (kể cả điểm thấp/trượt) vào `greenleaf_mission_attempts` ngay khi có kết quả, tách riêng khỏi `lib/rewards.ts` (chỉ lo cộng Leaf/streak khi mission thực sự hoàn thành)
- `components/missions/LessonPathList.tsx` — danh sách bài học dạng "path" (icon theo chủ đề, thanh tiến độ, huy hiệu ✓ khi xong), dùng chung cho `/grades` (trang chủ học sinh, vào là luyện được ngay kiểu Duolingo) và `/missions/[gradeCode]`
- `lib/lessonEmoji.ts`, `lib/wordEmoji.ts` — map emoji theo chủ đề bài học / từ vựng, dùng làm fallback khi từ chưa có `imageUrl` thật (ảnh Unsplash) hoặc ảnh load lỗi
- `lib/sentenceEmoji.ts` — minh hoạ cho Phonics/Speaking Challenge: quét câu/đoạn văn tìm từ vựng đã biết trong `wordEmoji.ts`, không khớp gì thì lùi về emoji chủ đề của cả Lesson (lấy từ `topic` của mission Words Explorer cùng bài, truyền xuống từ `LessonPage`)
- `lib/missionTheme.ts`, `components/decor/FloatingDecor.tsx`, `components/decor/SceneBackground.tsx` — theme màu theo loại mission + hoạ tiết trôi nổi/cảnh nền trang trí trên các trang học sinh
- `app/api/tts` — cache audio mẫu vào bucket `greenleaf-tts-cache` theo hash(text+rate+voice), chỉ gọi Azure TTS thật khi cache miss; validate `rate`/`voice` bằng regex trước khi nội suy vào SSML (tránh injection qua request body)
- `lib/ttsProfile.ts` — chọn tốc độ đọc + giọng theo cấp độ: Kindergarten/Kids 1/Kids 2 đọc chậm hơn (-30%) + giọng `en-US-AnaNeural` (giọng trẻ em trong danh sách voice chuẩn của Azure); Teens giữ tốc độ/giọng người lớn bình thường (-10%, `en-US-JennyNeural`)
- `components/Recorder.tsx` — ghi âm học sinh, giới hạn **60 giây/lượt** (tăng từ 20s để hỗ trợ bài dài hơn — cân nhắc lại nếu học sinh mạng chậm gặp vấn đề upload)

## Chưa làm (ngoài scope MVP này)

- Docker/CI-CD/deploy production tự động (hiện deploy thủ công qua Vercel git integration) (Phase 5 trong `../docs/tasks.md`)
- AI Writing/Reading/Listening/Vocabulary nâng cao (P3 post-launch)
- Dọn dead code: `components/mascot/BraveMascot.tsx` không còn được dùng, có thể xoá
- Giáo viên chưa sửa/xoá được tài khoản học sinh/phụ huynh sau khi tạo (chỉ tạo mới + gán liên kết)
- Chưa có tính năng học sinh/phụ huynh **tự đổi mật khẩu** (hiện phải nhờ giáo viên)
- Chưa có cảnh báo chủ động cho giáo viên khi học sinh ngừng học nhiều ngày, chưa có thao tác hàng loạt (giao bài/gán tài khoản cho nhiều học sinh cùng lúc) — quan trọng với trung tâm ít giáo viên, nhiều học sinh
- Chưa kiểm thử thực tế trên thiết bị Android tầm thấp / mạng 4G yếu — animation CSS khá nhiều (`gl-float`, `gl-sparkle`, `gl-glow-pulse`), chưa đo hiệu năng trên máy yếu
- Chưa theo dõi usage Azure Speech/Gemini/Unsplash so với hạn mức free tier — rủi ro vượt ngân sách/quota nếu số học sinh tăng
- Chưa xác nhận `scripts/populate-images.ts` đã chạy trên production và `UNSPLASH_ACCESS_KEY` đã cấu hình trên Vercel hay chưa
- Chưa có unit test
