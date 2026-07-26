# DANH SÁCH TÁC VỤ PHÁT TRIỂN GREENLEAF MVP (DÀNH CHO CLAUDE CODE)

Tài liệu này chia nhỏ các yêu cầu hệ thống thành các task cụ thể, tuần tự để Claude Code có thể đọc, hiểu và thực thi từng bước trong quá trình lập trình.

> **Cập nhật 2026-07-27:** Toàn bộ Phase 1-4 đã triển khai xong và deploy lên Vercel tại webapp
> [`GreenLeaf/app`](../app). Danh sách dưới đây đã đánh dấu hoàn thành, kèm ghi chú chỗ nào
> triển khai khác với kế hoạch gốc (do đổi tech stack hoặc mở rộng scope theo yêu cầu thực tế
> trong quá trình dùng thử). Xem [`app/README.md`](../app/README.md) để biết chi tiết setup.
> Bổ sung mới nhất: bugfix Reward System bị RLS chặn âm thầm (Task 2.3), và toàn bộ **Task 2.7
> — Quản lý tài khoản** (giáo viên tự tạo tài khoản username/password cho học sinh & phụ huynh,
> gán phụ huynh ↔ học sinh, đổi tên hiển thị).

## Phase 1: Khởi tạo dự án & Kiến trúc cơ bản (Project Setup & Architecture)
- [x] **Task 1.1: Khởi tạo Repository**
  - Setup một project fullstack (khuyến nghị Next.js + TypeScript + Tailwind CSS).
  - Cấu hình các công cụ chuẩn hóa code: ESLint, Prettier.
  - ✅ Next.js 14 App Router + TypeScript + Tailwind CSS, tại `GreenLeaf/app`.
- [x] **Task 1.2: Thiết kế & Khởi tạo Cơ sở dữ liệu (Database Schema)**
  - Cài đặt ORM (Prisma hoặc Drizzle) và kết nối với cơ sở dữ liệu (PostgreSQL/MySQL).
  - Tạo bảng `Users` với các role: `Student`, `Teacher`, `Parent`.
  - Tạo bảng `Grades` (Kindergarten, Kids 1, Kids 2, Teens).
  - Tạo bảng `Missions` và `Lessons`.
  - Tạo bảng `Student_Progress` lưu trữ điểm số, file ghi âm, trạng thái hoàn thành.
  - Tạo bảng `Rewards` lưu trữ số "Leaf" và số ngày học liên tiếp (Streak).
  - ⚠️ **Khác kế hoạch:** dùng **Supabase (Postgres + Auth + Storage)** thay vì tự quản DB qua
    Prisma/Drizzle — tận dụng RLS (Row Level Security) làm authorization layer thay vì viết
    middleware riêng, và dùng chung 1 Supabase project cho nhiều app khác (tiền tố bảng
    `greenleaf_`). Schema đầy đủ trong `supabase/migrations/0001_init.sql` → `0006_*.sql`.
  - Model `Missions`/`Lessons` đã tách rõ: 1 `Grade` có nhiều `Lesson` (không giới hạn số
    lượng, giáo viên tự tạo), mỗi `Lesson` cố định 3 `Mission` (Words Explorer, Phonics/
    Sentence Builder, Speaking Challenge) — xem ghi chú Phase 2/3 bên dưới.
  - Bổ sung thêm bảng ngoài kế hoạch gốc: `greenleaf_mission_attempts` (log toàn bộ lịch sử
    mỗi lần học sinh thử 1 mission, không ghi đè — khác với `student_progress` chỉ giữ trạng
    thái mới nhất) và `greenleaf_writing_topics` (thư viện đề bài viết tái sử dụng).
- [x] **Task 1.3: Cấu hình Authentication**
  - Setup hệ thống đăng nhập/đăng ký cho các Role khác nhau.
  - ✅ Supabase Auth (email/password), middleware (`middleware.ts`) chặn route theo role.
  - ⚠️ **Cập nhật:** `/register` (tự đăng ký bằng email thật) nay chỉ còn role Giáo viên/Phụ
    huynh. Học sinh — và tuỳ chọn Phụ huynh — được **giáo viên tạo trực tiếp** bằng username/
    mật khẩu, không cần email thật/xác nhận email, xem Task 2.7.

## Phase 2: Phát triển Core MVP (Tính năng cốt lõi)
- [x] **Task 2.1: Module AI Pronunciation (Quan trọng nhất)**
  - Tích hợp Web Audio API để thu âm giọng nói của học sinh trên trình duyệt.
  - Viết API kết nối với dịch vụ Speech-to-Text / Pronunciation Assessment (VD: OpenAI Audio API hoặc SpeechSuper).
  - Viết logic xử lý kết quả: tính điểm %, trả về phản hồi ("Try again" nếu < 80%, "Well done" nếu >= 80%).
  - Xây dựng UI hiển thị Audio player để học sinh nghe mẫu và nút "Hold to Record".
  - ⚠️ **Khác kế hoạch:** dùng **Azure Speech Service** (Pronunciation Assessment, chấm theo
    từng phoneme) + **Google Gemini** (feedback tiếng Việt) thay vì OpenAI Audio API/SpeechSuper
    — tái sử dụng nguyên engine đã có sẵn từ project `pronunciation-app`. TTS mẫu ưu tiên
    Azure, tự động fallback sang Web Speech API (giọng trình duyệt) nếu Azure lỗi/chưa cấu hình.
- [x] **Task 2.2: Module Homework Writing**
  - Viết API cho phép giáo viên tạo bài tập viết (Assign Task).
  - Xây dựng UI cho học sinh nhập văn bản (Text Editor cơ bản) và nút "Submit".
  - Xây dựng UI cho giáo viên xem danh sách bài nộp và cập nhật trạng thái đã chấm.
  - ⚠️ **Mở rộng so với kế hoạch:** thêm **Thư viện đề bài** (`greenleaf_writing_topics`) —
    giáo viên tạo đề 1 lần, tái sử dụng nhiều lần; "Giao bài" nghĩa là chọn 1 đề có sẵn trong
    thư viện + hạn nộp, không gõ đề mới mỗi lần giao.
- [x] **Task 2.3: Module Reward System**
  - Viết logic (Service) cập nhật "Leaf":
    - Cộng 1 Leaf khi xong 1 mission.
    - Cộng 5 Leaf khi đạt 100% điểm.
    - Cộng 20 Leaf khi đạt 7 ngày streak.
  - Viết cron job hoặc middleware kiểm tra và cập nhật Streak hằng ngày của học sinh.
  - ✅ `lib/rewards.ts`: tính leaf ngay trong luồng chấm điểm (`/api/missions/complete`), không
    cần cron riêng — streak cập nhật mỗi lần học sinh hoàn thành 1 mission trong ngày.
  - Bonus "hoàn thành cả 3 mission +3 Leaf" tính theo từng **Lesson** (không phải theo Grade)
    vì 1 Grade giờ có nhiều Lesson.
  - 🐛 **Bugfix quan trọng:** `greenleaf_rewards`/`greenleaf_reward_events` lúc mới tạo
    (0001_init.sql) chỉ có RLS policy `SELECT`, thiếu `INSERT`/`UPDATE` — mọi lần cộng Leaf bị
    Postgres RLS âm thầm chặn (không báo lỗi), học sinh học bao nhiêu bài số Leaf vẫn là 0. Đã
    vá bằng `0007_fix_rewards_rls.sql` (thêm đủ policy insert/update theo `student_id =
    auth.uid()`) và thêm `console.error()` khi ghi `rewards`/`reward_events` lỗi để lỗi tương
    tự không còn âm thầm trong tương lai.
- [x] **Task 2.4: Module Teacher Resource Library**
  - Thiết kế UI quản lý file dạng cây thư mục (giống Windows Explorer).
  - Cấu trúc tĩnh hiển thị các folder: `Cambridge` -> `Ready Steady Grow / Think / Prepare / IELTS` -> `Unit...`
  - Tích hợp dịch vụ lưu trữ (AWS S3 hoặc tương đương) để upload/download các file Lesson Plan, Worksheet, Audio, Video.
  - ⚠️ **Khác kế hoạch:** dùng **Supabase Storage** (bucket `greenleaf-resources`) thay vì AWS
    S3 — cùng hệ sinh thái với DB/Auth, RLS kiểm soát quyền upload (chỉ teacher).

### Task 2.5 (mới, ngoài kế hoạch gốc): Module Lesson Authoring
- Giáo viên tự tạo **Lesson** mới cho từng Grade qua tab **Lessons** — form nhập liệu trực
  tiếp trong app (`components/teacher/LessonForm.tsx`), gồm đủ 3 mission cố định: Words
  Explorer (chủ đề + từ vựng), Phonics/Sentence Builder (câu chant + âm cần highlight),
  Speaking Challenge (script). Không giới hạn số Lesson/Grade.
- Lý do bổ sung: kế hoạch gốc chỉ có đúng 1 bộ nội dung Demo cố định/grade (xem Phase 3), khi
  dùng thử thực tế nhận ra giáo viên cần tự thêm bài học mới liên tục, không thể phụ thuộc
  admin sửa DB thủ công.

### Task 2.6 (mới, ngoài kế hoạch gốc): Lịch sử học tập (Learning History)
- Bảng `greenleaf_mission_attempts` log **mọi lần** học sinh thử 1 mission (không ghi đè).
- Component `StudentHistory` (dùng chung cho giáo viên & phụ huynh): số lần học theo từng
  ngày, lịch sử điểm số/kết quả từng lần luyện Speaking, danh sách bài Writing đã nộp.
- Truy cập qua `/teacher/students/[id]` và `/parent/students/[id]`.
- ✅ Mỗi dòng lịch sử hiển thị thêm **badge cấp độ** (VD "Kids 1") bên cạnh tên bài học — trước
  đó chỉ hiện tên Lesson nên giáo viên/phụ huynh không biết học sinh đang luyện cấp độ nào, đặc
  biệt khó theo dõi với học sinh xem thử nhiều cấp độ khác nhau.

### Task 2.7 (mới, ngoài kế hoạch gốc): Quản lý tài khoản (Account Management)
- **Vấn đề:** kế hoạch gốc giả định học sinh/phụ huynh tự đăng ký bằng email thật và tự xác
  nhận email — không phù hợp bản demo (học sinh nhỏ tuổi không có email, không muốn giáo viên/
  phụ huynh phải check mail khi tạo tài khoản).
- ✅ Migration `0008_student_accounts.sql`: thêm cột `greenleaf_profiles.username`, cập nhật
  trigger `greenleaf_handle_new_user()` để lưu `username` khi tạo user, thêm policy
  `greenleaf_profiles_update_teacher` cho phép giáo viên `UPDATE` mọi profile (phục vụ gán
  `parent_id`).
- ✅ API `app/api/admin/create-account`: route server-side dùng `SUPABASE_SERVICE_ROLE_KEY` +
  Supabase Admin API (`auth.admin.createUser` với `email_confirm: true`) để giáo viên tạo tài
  khoản username/password cho học sinh **hoặc** phụ huynh mà không cần email thật, không cần
  bước xác nhận email. Username nội bộ quy đổi thành email giả `<username>@greenleaf.local` vì
  Supabase Auth bắt buộc định dạng email. Chỉ chấp nhận request từ user có role `teacher`.
- ✅ Trang `/teacher/accounts`: 3 khối chức năng — Tạo tài khoản học sinh (username + mật khẩu +
  tên + cấp độ), Tạo tài khoản phụ huynh (username + mật khẩu + tên), Gán phụ huynh ↔ học sinh
  (chọn 1 phụ huynh, tick các học sinh thuộc phụ huynh đó, lưu qua `UPDATE parent_id`).
- ✅ Trang `/profile` (mọi role): cho phép tự đổi tên hiển thị; hiện username read-only nếu có.
  Truy cập bằng cách bấm vào tên hiển thị ở góc trên phải (`AppHeader`). Middleware có bypass
  riêng để `/profile` dùng chung được cho mọi role đã đăng nhập, không cần gate theo role.
- ✅ `/login`: nhận "định danh đăng nhập" thay vì bắt buộc email — nếu không có `@` thì tự quy
  đổi thành `<input>@greenleaf.local` trước khi gọi Supabase Auth.
- ✅ `/register`: bỏ lựa chọn role "Học sinh" (chỉ còn Giáo viên/Phụ huynh tự đăng ký bằng email
  thật) và bỏ luôn bước chọn cấp độ — học sinh giờ chỉ được tạo bởi giáo viên qua
  `/teacher/accounts`.
- ✅ Trang `/teacher/guide` bổ sung mục hướng dẫn "🔑 Tạo tài khoản học sinh & phụ huynh" làm
  mục đầu tiên (5 việc chính thay vì 4).
- ⚠️ Việc còn thiếu: giáo viên chưa sửa/xoá được tài khoản học sinh/phụ huynh sau khi tạo (chỉ
  tạo mới + gán liên kết), chưa có tính năng đổi mật khẩu tự phục vụ.

## Phase 3: Xây dựng Trải nghiệm Speaking Demo (Giao diện Học sinh)
- [x] **Task 3.1: UI Khởi động & Chọn cấp độ**
  - Tạo màn hình Welcome với hình ảnh chú mèo Brave và text: *"Hello, my name's Brave. Welcome to GreenLeaf. Let's have fun!"*.
  - Tạo luồng chọn cấp độ: Kindergarten, Kids 1, Kids 2, Teens.
  - ⚠️ Mascot **Brave** hiện dùng placeholder emoji 🐱 (chưa có asset nhân vật thật) — xem
    mục "Chưa làm" trong `app/README.md`.
  - ⚠️ **Mở rộng:** cấp độ chỉ chọn **1 lần lúc đăng ký** (`/register`), không hỏi lại mỗi lần
    mở app — `/grades` hiển thị thẳng cấp độ của học sinh làm nút "Bắt đầu học", các cấp độ
    khác ẩn dưới "Xem thử cấp độ khác" (không bắt buộc chọn lại).
  - 🎨 **Redesign theo phản hồi thực tế:** giao diện `/grades` ban đầu bị chê "tẻ nhạt"/"đần
    đần"/"dính nhau" (3 khối rời rạc, ít tương phản, thiếu khoảng cách). Đã làm lại thành 1
    "hero card" thống nhất — banner gradient xanh (mascot + lời chào + hoạ tiết trang trí),
    card trắng đè lên (`-mt-12`) chứa nút "Bắt đầu học" cấp độ của học sinh, thanh điều hướng
    dạng split-button (Learning Journey | Homework) gọn ở cuối. Đã sửa 2 vòng theo góp ý cụ
    thể của người dùng (vòng 1: gộp thành hero card; vòng 2: giãn khoảng cách sau khi vẫn bị
    chê "dính nhau").
- [x] **Task 3.2: Giao diện Mission 1 (Words Explorer)**
  - Render danh sách từ vựng dạng flashcard có hình ảnh.
  - Tích hợp tính năng phát âm thanh mẫu và ghi âm kiểm tra.
  - ⚠️ Chưa có ảnh minh hoạ thật cho từ vựng (chưa upload asset) — dùng emoji tương ứng từng
    từ làm fallback (`lib/wordEmoji.ts`); nếu sau này thêm ảnh vào đúng `imageUrl` thì tự ưu
    tiên hiển thị ảnh thật.
- [x] **Task 3.3: Giao diện Mission 2 (Phonics / Sentence Builder)**
  - Render các dòng chant/câu.
  - Xây dựng hiệu ứng highlight các từ vựng chứa âm đang luyện tập.
  - Cho phép học sinh đọc và thu âm từng dòng.
- [x] **Task 3.4: Giao diện Mission 3 (Speaking Challenge)**
  - Hiển thị toàn bộ Script.
  - Thu âm toàn bộ bài đọc và trả về kết quả tổng hợp.
  - Xây dựng màn hình "Bonus" khi học sinh hoàn thành cả 3 nhiệm vụ (Hiển thị mèo Brave khen "Awesome" + hiệu ứng nhận 3 Leaves).

## Phase 4: Phát triển Tính năng Nâng cao (Enhance)
- [x] **Task 4.1: Parent Dashboard**
  - Xây dựng trang Dashboard dành riêng cho Role `Parent`.
  - Fetch và hiển thị các chỉ số của con: % Speaking, tiến độ Writing, Tổng số Leaf, Chuỗi Streak.
  - ✅ Liên kết Phụ huynh ↔ Học sinh (`profiles.parent_id`) nay có UI tự phục vụ tại
    `/teacher/accounts` — không cần set thủ công trong Supabase dashboard nữa (xem Task 2.7).
  - Mở rộng: mỗi con có nút "Xem lịch sử học tập chi tiết" (Task 2.6).
- [x] **Task 4.2: Learning Journey (Gamification)**
  - Thiết kế UI hiển thị cây học tập của học sinh.
  - Viết logic thay đổi trạng thái hình ảnh cây dựa trên điều kiện: Seed -> Young Leaf -> Green Leaf -> Strong Tree -> Garden (Dựa vào số bài tập hoàn thành).
  - ✅ `lib/journey.ts` — ngưỡng: Seed (0) → Young Leaf (10) → Green Leaf (30) → Strong Tree (60)
    → Garden (100), tính theo tổng số mission Speaking hoàn thành + số bài Writing đã nộp.
  - 🔧 **Điều chỉnh:** ngưỡng gốc (0/3/6/10/15) khiến học sinh lên tới Garden (mức cao nhất)
    chỉ sau vài bài học, hành trình "hết" quá nhanh, mất động lực học tiếp. Đã kéo dài ngưỡng
    lên gấp nhiều lần để hành trình kéo dài hơn, phù hợp việc học lâu dài thực tế.
  - Giao diện dạng "bản đồ hành trình" 5 chặng (không chỉ hiện trạng thái hiện tại) —
    `components/tree/LearningJourneyTree.tsx`.

### Task 4.3 (mới, ngoài kế hoạch gốc): Hướng dẫn sử dụng trong app
- Trang `/teacher/guide` — hướng dẫn từng bước cho toàn bộ tính năng giáo viên (Lessons,
  Homework, Resource Library, Students), khớp chính xác tên nút/UI thật, không cần tài liệu
  ngoài app.

## Phase 5: Testing & Deployment (Dành cho Infra/Deploy Team)
- [ ] **Task 5.1: Viết Unit Test**
  - Viết test cho các logic tính điểm, cộng Leaf, cập nhật Streak.
  - Chưa làm — ngoài scope phiên bản hiện tại.
- [x] **Task 5.2: Chuẩn bị môi trường Production** *(một phần)*
  - ~~Đóng gói ứng dụng (Dockerize) với `Dockerfile` và `docker-compose.yml`.~~ Không cần —
    deploy trực tiếp lên Vercel (serverless), không dùng Docker.
  - ✅ Biến môi trường (ENV) cho Database (Supabase), API Keys (Azure Speech, Gemini) — cấu
    hình qua Vercel Environment Variables, mẫu tại `app/.env.example`.
- [x] **Task 5.3: Deploy lên Server** *(một phần)*
  - ~~Thiết lập CI/CD pipeline để tự động build và deploy.~~ ✅ Tự động qua Vercel + GitHub
    (mỗi push lên `main` tự build & deploy), không cần tự dựng CI/CD riêng.
  - ~~Triển khai ứng dụng lên production server, thiết lập Nginx, SSL/HTTPS.~~ Không cần — SSL/
    HTTPS/CDN do Vercel quản lý.
  - Đã deploy: [github.com/hongthaiphi/GreenLeaf](https://github.com/hongthaiphi/GreenLeaf).

---

## Việc còn thiếu / cần làm tiếp
- Unit test (Task 5.1)
- Asset mascot "Brave" thật (đang dùng emoji 🐱)
- Ảnh minh hoạ từ vựng thật cho Words Explorer (đang dùng emoji fallback)
- ~~UI tự phục vụ liên kết Phụ huynh ↔ Học sinh~~ ✅ Đã xong — Task 2.7, giáo viên tự gán qua
  `/teacher/accounts`, không cần vào Supabase dashboard nữa.
- Giáo viên chưa sửa/xoá được tài khoản học sinh/phụ huynh sau khi tạo, chưa có tính năng đổi
  mật khẩu tự phục vụ cho học sinh/phụ huynh (Task 2.7)
- Azure Speech Service cần subscription Azure hoạt động + key hợp lệ để chấm điểm phát âm
  chạy thật (tính năng lõi — xem hướng dẫn lấy key trong lịch sử trò chuyện hoặc Azure Portal).
  TTS phát âm mẫu đã có fallback Web Speech API của trình duyệt khi Azure lỗi, nhưng **chấm
  điểm phát âm** vẫn cần Azure hoạt động thật, fallback không thay thế được phần này.
- P3 post-launch (AI Writing/Reading/Listening/Vocabulary) — chưa bắt đầu, đúng kế hoạch gốc
  là làm sau khi khai trương
