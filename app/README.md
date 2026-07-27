# GreenLeaf English Academy — Web App - New deploy.

Phần mềm quản lý trung tâm Anh ngữ GreenLeaf: AI Pronunciation, Homework Writing, Reward System, Teacher Resource Library, Parent Dashboard, Learning Journey. Xem yêu cầu gốc tại [`../docs`](../docs).

## Tech stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase: Postgres + Auth + Storage
- Azure Speech Service (chấm phát âm phoneme-level) + Google Gemini (feedback tiếng Việt) — port từ [`pronunciation-app`](../../pronunciation-app)

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
11. `supabase/migrations/0011_word_meanings.sql` — thêm nghĩa tiếng Việt (`meaning`) cho từng từ trong 220 từ vựng đã seed (0002 + 0009) — học sinh/phụ huynh không biết tiếng Anh cần tự hiểu nghĩa, không chỉ nghe phát âm.

⚠️ Nếu project đã chạy các migration cũ từ trước, **bắt buộc chạy đủ 0004 → 0011 theo thứ tự** — thiếu bất kỳ file nào cũng khiến tính năng tương ứng lỗi do RLS chặn hoặc thiếu cột.

### 2. Cấu hình `.env.local`

Copy `.env.example` → `.env.local` và điền:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — từ Supabase Settings → API
- `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` — có thể dùng chung key với `pronunciation-app` (region `southeastasia`)
- `GEMINI_API_KEY` — [Google AI Studio](https://aistudio.google.com/)

### 3. Chạy dev server

```bash
npm install
npm run dev
```

## Luồng tài khoản

- **Giáo viên / Phụ huynh**: tự đăng ký tại `/register` bằng email thật (cần bật/tắt "Confirm email" trong Supabase Dashboard → Authentication → Providers → Email tuỳ nhu cầu demo).
- **Học sinh & Phụ huynh (cách 2, khuyến nghị cho demo)**: giáo viên tạo trực tiếp trong app tại `/teacher/accounts` — chỉ cần username + mật khẩu, **không cần email thật, không cần xác nhận email** (tạo qua Supabase Admin API với `email_confirm: true`, xem `app/api/admin/create-account`). Auth vẫn cần định dạng email nên username được quy đổi thành `<username>@greenleaf.local` nội bộ; học sinh/phụ huynh chỉ cần biết username, đăng nhập ở `/login` nhập thẳng username (không có `@`) là được.
- **Liên kết Phụ huynh ↔ Học sinh**: giáo viên vào `/teacher/accounts` → mục "Gán phụ huynh ↔ học sinh", chọn phụ huynh + tick học sinh tương ứng. Không cần thao tác thủ công trong Supabase dashboard nữa.
- **Đổi tên hiển thị**: mọi role bấm vào tên mình ở góc trên phải (AppHeader) → `/profile`.
- Middleware (`middleware.ts`) chặn theo role: `/grades`, `/missions`, `/journey`, `/homework` → student; `/teacher/*` → teacher; `/parent/*` → parent; `/profile` → mọi role đã đăng nhập.

## Cấu trúc chính

- `lib/azure.ts`, `lib/phoneme.ts`, `lib/audio.ts`, `lib/gemini.ts` — engine chấm phát âm (port từ pronunciation-app)
- `lib/rewards.ts` — logic cộng Leaf (+1 mission, +5 perfect, +20 streak-7, +3 bonus khi xong cả 3 mission trong 1 lesson)
- `lib/journey.ts` — quy tắc lớn cây Learning Journey
- `components/missions/` — 3 loại mission UI (Words Explorer, Phonics/Sentence Builder, Speaking Challenge)
- `components/teacher/LessonForm.tsx` — form giáo viên tạo Lesson mới **hoặc sửa Lesson có sẵn** (truyền `lessonId` + `initial` để chuyển sang chế độ sửa; lưu bằng `upsert` theo `(lesson_id, type)`)
- `app/teacher/lessons` — giáo viên tạo/**sửa** (icon bút chì)/xoá Lesson theo từng Grade; `app/missions/[gradeCode]` — học sinh chọn Lesson; `app/missions/[gradeCode]/[lessonId]` — luồng học 3 mission của 1 Lesson
- `app/teacher/homework` — thư viện đề bài viết (`greenleaf_writing_topics`, tạo 1 lần) + giao bài (chọn đề có sẵn + hạn nộp, tạo `greenleaf_homework_assignments`)
- `components/StudentHistory.tsx` — lịch sử học tập chi tiết (số lần học/ngày + từng lần thử Speaking + bài Writing đã nộp), dùng chung cho `app/teacher/students/[id]` và `app/parent/students/[id]`
- `app/api/assess` — chấm điểm Azure thuần (không side-effect); `app/api/missions/complete` — ghi nhận hoàn thành + cộng Leaf + log vào `greenleaf_mission_attempts`
- `app/api/admin/create-account` — server-side, dùng `SUPABASE_SERVICE_ROLE_KEY` để tạo tài khoản username/password cho học sinh/phụ huynh; chỉ chấp nhận request từ user có role `teacher`
- `app/teacher/accounts` — UI giáo viên tạo tài khoản học sinh/phụ huynh + gán phụ huynh ↔ học sinh
- `app/profile` — trang đổi tên hiển thị + đổi cấp độ học (chỉ role student), dùng chung mọi role
- `app/help` — hướng dẫn sử dụng chi tiết cho học sinh (tương tự `/teacher/guide` nhưng dành cho học sinh); `components/student/FirstTimeGuide.tsx` — modal 5 bước tự hiện lần đầu học sinh vào `/grades` (đánh dấu đã xem qua `localStorage`, không cần cột DB mới), có nút tắt/xem lại; icon ❓ ở header `/grades` mở lại `/help` bất cứ lúc nào
- `lib/useScoreFeedback.ts` — gọi Gemini tạo feedback tiếng Việt (giải thích lỗi phát âm bằng lời dễ hiểu) khi học sinh đọc chưa đạt; `components/ScoreDisplay.tsx` hiện feedback này làm nội dung chính, chi tiết phoneme/IPA ẩn sau nút "Xem chi tiết (nâng cao)"
- `lib/missionAttempts.ts` — log **mọi** lần ghi âm (kể cả điểm thấp/trượt) vào `greenleaf_mission_attempts` ngay khi có kết quả, tách riêng khỏi `lib/rewards.ts` (chỉ lo cộng Leaf/streak khi mission thực sự hoàn thành)
- `components/missions/LessonPathList.tsx` — danh sách bài học dạng "path" (icon theo chủ đề, thanh tiến độ, huy hiệu ✓ khi xong), dùng chung cho `/grades` (trang chủ học sinh, vào là luyện được ngay kiểu Duolingo) và `/missions/[gradeCode]`
- `lib/lessonEmoji.ts`, `lib/wordEmoji.ts` — map emoji theo chủ đề bài học / từ vựng, thay icon sách chung chung
- `lib/missionTheme.ts`, `components/decor/FloatingDecor.tsx` — theme màu theo loại mission + hoạ tiết trôi nổi trang trí trên các trang học sinh
- `app/api/tts` — cache audio mẫu vào bucket `greenleaf-tts-cache` theo hash(text+rate+voice), chỉ gọi Azure TTS thật khi cache miss

## Chưa làm (ngoài scope MVP này)

- Docker/CI-CD/deploy production (Phase 5 trong `../docs/tasks.md`)
- AI Writing/Reading/Listening/Vocabulary (P3 post-launch)
- Asset mascot "Brave" thật (đang dùng placeholder emoji 🐱, đã có nhiều mood: idle/happy/cheer/thinking/oops)
- Giáo viên chưa sửa/xoá được tài khoản học sinh/phụ huynh sau khi tạo (chỉ tạo mới + gán liên kết)
- Chưa có cảnh báo chủ động cho giáo viên khi học sinh ngừng học nhiều ngày, chưa có thao tác hàng loạt (giao bài/gán tài khoản cho nhiều học sinh cùng lúc) — quan trọng với trung tâm ít giáo viên, nhiều học sinh
- Chưa kiểm thử thực tế trên thiết bị Android tầm thấp / mạng 4G yếu — animation CSS khá nhiều (`gl-float`, `gl-sparkle`, `gl-glow-pulse`), chưa đo hiệu năng trên máy yếu
- Chưa theo dõi usage Azure Speech/Gemini so với hạn mức free tier — rủi ro vượt ngân sách nếu số học sinh tăng
