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

⚠️ Nếu project đã chạy các migration cũ từ trước, **bắt buộc chạy thêm 0004 và 0005** — nếu không giáo viên sẽ không tạo được bài học/đề bài mới (RLS chặn insert), và trang Homework sẽ lỗi vì cột `title`/`prompt`/`grade_id` trên `greenleaf_homework_assignments` đã đổi sang tham chiếu qua `greenleaf_writing_topics`.

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

- Tự đăng ký tại `/register`, chọn role (Học sinh / Giáo viên / Phụ huynh). Học sinh chọn thêm Grade lúc đăng ký.
- Liên kết Phụ huynh ↔ Học sinh: hiện chưa có UI, set thủ công `greenleaf_profiles.parent_id` trong Supabase dashboard (hoặc bổ sung UI sau).
- Middleware (`middleware.ts`) chặn theo role: `/grades`, `/missions`, `/journey`, `/homework` → student; `/teacher/*` → teacher; `/parent/*` → parent.

## Cấu trúc chính

- `lib/azure.ts`, `lib/phoneme.ts`, `lib/audio.ts`, `lib/gemini.ts` — engine chấm phát âm (port từ pronunciation-app)
- `lib/rewards.ts` — logic cộng Leaf (+1 mission, +5 perfect, +20 streak-7, +3 bonus khi xong cả 3 mission trong 1 lesson)
- `lib/journey.ts` — quy tắc lớn cây Learning Journey
- `components/missions/` — 3 loại mission UI (Words Explorer, Phonics/Sentence Builder, Speaking Challenge)
- `components/teacher/LessonForm.tsx` — form giáo viên tạo Lesson mới (1 lesson = 3 mission cố định)
- `app/teacher/lessons` — giáo viên tạo/xoá Lesson theo từng Grade; `app/missions/[gradeCode]` — học sinh chọn Lesson; `app/missions/[gradeCode]/[lessonId]` — luồng học 3 mission của 1 Lesson
- `app/teacher/homework` — thư viện đề bài viết (`greenleaf_writing_topics`, tạo 1 lần) + giao bài (chọn đề có sẵn + hạn nộp, tạo `greenleaf_homework_assignments`)
- `app/api/assess` — chấm điểm Azure thuần (không side-effect); `app/api/missions/complete` — ghi nhận hoàn thành + cộng Leaf

## Chưa làm (ngoài scope MVP này)

- Docker/CI-CD/deploy production (Phase 5 trong `../docs/tasks.md`)
- AI Writing/Reading/Listening/Vocabulary (P3 post-launch)
- Asset mascot "Brave" thật (đang dùng placeholder emoji 🐱)
- UI liên kết Parent ↔ Student
