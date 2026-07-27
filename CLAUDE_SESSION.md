# Trạng thái phiên làm việc — GreenLeaf English Academy

> File này ghi lại trạng thái tại thời điểm dừng, để phiên sau (người hoặc Claude Code khác)
> tiếp tục mà không cần dò lại từ đầu. Cập nhật lần cuối: **2026-07-27**.

## Đang làm gì

Không có việc gì dang dở — `git status` sạch, mọi thay đổi trong phiên này đã commit và
**đã push lên `origin/main`**. Commit mới nhất: `ce3e33b`.

⚠️ **Lưu ý quan trọng**: repo git thật nằm ở `GreenLeaf/` (thư mục này), **không phải**
`GreenLeaf/app/` hay thư mục cha `my-project/`. Luôn chạy `git status`/`git log` từ đây.

⚠️ **Có phiên Claude Code khác từng làm việc song song trên repo này** (nhánh
`claude/lesson-flow-audio-source-vjlrim`, đã merge qua PR #1–#3: cache TTS, sửa UX ghi âm,
thêm màu/hoạ tiết trang học sinh) và có 1 commit lạ `1d7f074 "teach do something"` xuất hiện
không rõ nguồn gốc giữa chừng. Không có gì hỏng, nhưng nếu thấy commit lạ xuất hiện lần nữa,
đó là do có phiên khác đang chạy — không phải lỗi.

## Tóm tắt các thay đổi trong phiên này (từ `a50bf13` → `ce3e33b`)

Theo thứ tự thời gian, nhóm theo tính năng:

1. **Bugfix**: RLS chặn âm thầm việc cộng Leaf (`8e75618`) — học sinh học bao nhiêu cũng
   không lên điểm lá vì thiếu policy INSERT/UPDATE trên `greenleaf_rewards`.
2. **Lịch sử học tập**: hiện cấp độ trên mỗi dòng lịch sử (`159426d`), kéo dài ngưỡng Learning
   Journey (`13d16be`), log **mọi** lượt thử kể cả điểm thấp thay vì chỉ lượt đạt (`c6e5bbb`),
   thêm cột `item_label` để biết đúng từ/câu nào bị điểm thấp (`ab557ef`).
3. **Redesign trang chủ học sinh** (`4c80fdd`, `304b2e1`, `a3d1b06`, `ac76a14`): từ hero card
   tĩnh → landing kiểu Duolingo (vào là thấy path bài học ngay), đổi cấp độ dời sang `/profile`.
4. **Quản lý tài khoản** (`1a2f68d` phần đầu, `c23aa02`): thêm 10 Lesson/cấp độ, giáo viên
   sửa/reset mật khẩu/xoá tài khoản học sinh-phụ huynh trong `/teacher/accounts`.
5. **Tự giải thích cho học sinh** (không phụ thuộc phụ huynh biết tiếng Anh):
   - Gắn feedback AI tiếng Việt (Gemini) vào màn chấm điểm, ẩn thuật ngữ IPA (`5e7444e`).
   - Nghĩa tiếng Việt cho từng từ vựng (`a431fb8`).
   - Modal hướng dẫn lần đầu + trang `/help` (`2fc363b`).
   - Icon minh hoạ theo chủ đề cho mỗi bài học + mission (`9550c8c`, `3e94249`).
6. **Trải nghiệm luyện tập**:
   - TTS chậm hơn + giọng trẻ em cho Kindergarten/Kids1/Kids2 (`0add785`).
   - Tách từng phần Mission rõ ràng, có màn chuyển tiếp giữa các phần nhưng KHÔNG bắt bấm thêm
     trước phần đầu tiên (`5455f37`, `4236125`).
   - Ảnh minh hoạ cho Phonics/Speaking Challenge; sửa lại cho đúng — **mỗi câu Phonics có ảnh
     riêng**, không dùng chung 1 ảnh cho cả mission (`77b210b`, `ce3e33b`).
7. **Trang trí/UI**: cảnh nền cây-vườn-cầu vồng (`7c03a27`), tăng font/spacing trên laptop
   (`8345b8e`).
8. **Vệ sinh**: sửa trùng số migration `0010` với phiên song song khác (`fefd1f3`).

## File/thư mục quan trọng đã đổi trong phiên này

- `app/supabase/migrations/0009_*.sql` → `0013_*.sql` (5 migration mới — xem mục "Bước tiếp
  theo" bên dưới, **cần chạy tay trên Supabase**).
- `app/lib/`: `ttsProfile.ts`, `sentenceEmoji.ts`, `lessonEmoji.ts`, `wordEmoji.ts`,
  `missionAttempts.ts`, `useScoreFeedback.ts`, `types.ts` (đổi shape `PhonicsContent.lines`).
- `app/components/missions/`: `WordsExplorer.tsx`, `PhonicsChant.tsx`,
  `SpeakingChallenge.tsx`, `MissionTransition.tsx` (mới), `LessonPathList.tsx` (mới).
- `app/components/teacher/LessonForm.tsx`, `app/app/teacher/lessons/page.tsx`,
  `app/app/teacher/accounts/page.tsx` (+ 2 API route mới: `reset-password`, `delete-account`).
- `app/app/grades/page.tsx`, `app/app/help/page.tsx` (mới), `app/components/student/`
  `FirstTimeGuide.tsx` (mới), `app/components/decor/SceneBackground.tsx` (mới).
- `app/app/globals.css`, `app/middleware.ts`.
- `app/README.md` — đã cập nhật đầy đủ theo từng migration/tính năng mới.
- `docs/tasks.md`, `docs/requirements.md` — **CHƯA cập nhật** cho các tính năng từ `1a2f68d`
  trở đi (xem bước tiếp theo).

## Bước tiếp theo

1. **⚠️ Việc quan trọng nhất**: xác nhận đã chạy đủ migration `0009` → `0013` trên Supabase
   SQL Editor theo đúng thứ tự (chưa rõ user đã chạy migration nào trong phiên này chưa —
   chưa có xác nhận trong hội thoại). Thiếu migration nào thì tính năng tương ứng sẽ lỗi:
   - `0009` — 10 Lesson mới/cấp độ
   - `0010` — cache TTS (bucket `greenleaf-tts-cache`)
   - `0011` — nghĩa tiếng Việt cho từ vựng
   - `0012` — cột `item_label` (lịch sử biết đúng từ/câu bị điểm thấp)
   - `0013` — đổi `Phonics.lines` sang mảng object (ảnh theo từng câu) — **migration này bắt
     buộc phải chạy sau khi code mới đã deploy**, nếu không Phonics sẽ lỗi vì code mới đọc
     `line.text` nhưng DB cũ vẫn là string.
2. `docs/tasks.md` và `docs/requirements.md` đang lạc hậu so với code — cần cập nhật lại nếu
   user yêu cầu (mẫu câu quen thuộc: "cập nhật toàn bộ các task đã thực hiện vào tasks.md...").
3. Các việc còn thiếu đã biết (xem `docs/tasks.md` mục "Việc còn thiếu"):
   - Chưa có tính năng học sinh/phụ huynh **tự đổi mật khẩu** (hiện phải nhờ giáo viên).
   - Chưa có unit test.
   - Asset mascot "Brave" và ảnh từ vựng thật vẫn dùng emoji placeholder.
   - Chưa có cảnh báo chủ động cho giáo viên khi học sinh ngừng học nhiều ngày, chưa có thao
     tác hàng loạt (giao bài/tạo tài khoản cho nhiều học sinh cùng lúc).
   - Chưa kiểm thử thực tế trên thiết bị Android yếu / mạng chậm.
   - Chưa theo dõi usage Azure Speech/Gemini so với hạn mức free tier.

## Quy ước làm việc trong phiên (để giữ nhất quán)

- Sau mỗi thay đổi: `rm -rf .next && npx tsc --noEmit` rồi `npm run build` trước khi commit.
- Validate migration SQL bằng `pglast` (Python) trước khi báo user chạy; validate JSON literal
  trong migration bằng script Python nếu có nhiều block `$json$...$json$`.
- Kiểm tra UI bằng cách tạo route tạm `app/previewtest/page.tsx`, chụp qua Claude Browser
  tools, rồi **xoá route này trước khi commit** — local dev dùng Supabase credentials giả nên
  không đăng nhập được để test luồng thật.
- Mỗi commit có trailer `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`, push thẳng
  lên `origin/main` sau mỗi thay đổi logic hoàn chỉnh (user coi mỗi lượt trả lời là 1 vòng
  deploy lên Vercel thật).
