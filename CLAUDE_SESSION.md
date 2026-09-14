# Trạng thái phiên làm việc — GreenLeaf English Academy

> File này ghi lại trạng thái tại thời điểm dừng, để phiên sau (người hoặc Claude Code khác)
> tiếp tục mà không cần dò lại từ đầu. Cập nhật lần cuối: **2026-09-14**.

## Đang làm gì

Không có việc gì dang dở — `git status` sạch, mọi thay đổi đã commit và **đã push lên
`origin/main`**. Commit mới nhất: `5db3f6c`.

⚠️ **Lưu ý quan trọng**: repo git thật nằm ở `GreenLeaf/` (thư mục này), **không phải**
`GreenLeaf/app/` hay thư mục cha `my-project/`. Luôn chạy `git status`/`git log` từ đây.

⚠️ **Quyết định thiết kế lớn đã đảo ngược**: app giờ **English immersion** — toàn bộ
UI/feedback/nội dung học (kể cả feedback AI của Gemini và nghĩa từ vựng) là **tiếng Anh**,
không còn nguyên tắc cũ "tự giải thích bằng tiếng Việt cho phụ huynh không biết tiếng Anh".
Đây là quyết định đã được user xác nhận rõ ràng — **không tự ý thêm lại tiếng Việt vào
UI/nội dung app** trừ khi được yêu cầu lại. README/docs nội bộ vẫn giữ tiếng Việt (tài liệu
cho team dev, không phải nội dung app).

## Bối cảnh: khoảng trống lớn giữa 2 phiên (24263df → HEAD)

Giữa lần cập nhật trước (`24263df`, 2026-07-27) và phiên này (bắt đầu 2026-09-14) có **~34
commit** được thực hiện **bên ngoài phiên Claude Code này** (trực tiếp bởi user và bởi các
phiên Claude Code khác, bao gồm 1 phiên dùng "Claude Opus 4.6" — xem đồng tác giả trong
`git log`). Tóm tắt các nhóm thay đổi lớn:

1. **Redesign toàn diện** (`77fa4af` → `d6abd4a`, PR #4 `feature/design-refresh`): thêm linh
   vật **Leafy** (ảnh thật, nhiều mood), font Nunito + design token, redesign login/welcome,
   trang chủ học sinh kiểu Duolingo, thanh tab 4 mục cố định dưới cùng, bản đồ Learning Journey
   dạng zigzag dọc, màn luyện nói 3-tab với mic tròn, dashboard giáo viên + phụ huynh, nhạc nền
   bật/tắt, header/footer gắn tên thương hiệu "GreenLeaf English Academy — Grow Beyond".
2. **`87fba74` — dịch toàn bộ UI từ tiếng Việt sang tiếng Anh** (64 file): đây là commit bản
   lề, đảo ngược nguyên tắc "Vietnamese self-explanatory UI" đã có từ đầu dự án. Bao gồm cả
   prompt Gemini feedback (giờ sinh feedback tiếng Anh).
3. **`4a6f673`** — tăng giới hạn ghi âm từ 20s → 60s.
4. **`5e45fd1`** — thêm tích hợp Unsplash: `app/api/image` (route generate ảnh on-demand) +
   `scripts/populate-images.ts` (script one-time điền `imageUrl` cho từ vựng) + bucket
   `greenleaf-images` (migration 0015).

## Việc đã làm trong phiên này (rà soát + vá bảo mật + tiếp nối English immersion)

Phiên này bắt đầu bằng yêu cầu "rà soát toàn bộ code, đánh giá việc phải làm tiếp theo" đối
với app đang live. Sau khi audit, phát hiện 2 vấn đề cần user quyết định — đã hỏi và được
xác nhận:

1. **Bảo mật** (`d4db6cd`): `app/api/image` là route **không xác thực, không rate-limit**,
   nhận `query` tuỳ ý từ bất kỳ ai, gọi Unsplash rồi ghi vào bucket công khai bằng service
   role — và **không được dùng ở đâu trong UI của app** (dead code với attack surface thật).
   Ngoài ra policy INSERT trên bucket `greenleaf-images` (từ migration 0015) thiếu `TO` nên
   mặc định PUBLIC — ai cầm anon key cũng ghi thẳng được qua Supabase Storage API, độc lập với
   route Next.js. User chọn "Xoá route + thắt policy": đã xoá `app/api/image/route.ts`, thêm
   migration `0016_fix_images_bucket_policy.sql` gỡ policy INSERT công khai (service role vẫn
   ghi được bình thường vì bypass RLS).
2. **English immersion cho dữ liệu** (`c9c6572` + fix `5db3f6c`): nghĩa từ vựng (`meaning`,
   220 từ, migration 0011) vẫn còn tiếng Việt dù UI đã dịch hết — vì nằm trong DB content,
   không phải code, nên đợt dịch `87fba74` bỏ sót. User xác nhận dịch nốt sang tiếng Anh.
   Migration `0017_word_meanings_english.sql` merge riêng field `meaning` vào từng object
   (không jsonb_set nguyên mảng `words` như 0011) — **giữ nguyên `imageUrl`** nếu đã có, khác
   với cách làm cũ từng reset ảnh về `""` mỗi lần chạy lại.
3. **Cập nhật docs** (`app/README.md`, file này): khớp lại với toàn bộ thay đổi ở trên.

## Bước tiếp theo

1. **⚠️ Việc quan trọng nhất**: xác nhận đã chạy đủ migration `0014` → `0017` trên Supabase
   SQL Editor theo đúng thứ tự (chưa có xác nhận trong hội thoại là user đã chạy):
   - `0014` — đơn giản hoá câu Phonics Kindergarten về 1 âm tiết (⚠️ reset `imageUrl`/
     `imageDescription` riêng của 7 lesson này nếu giáo viên từng nhập tay)
   - `0015` — bucket `greenleaf-images`
   - `0016` — **bảo mật**, gỡ policy INSERT công khai trên `greenleaf-images` — nên chạy sớm
   - `0017` — dịch nghĩa từ vựng sang tiếng Anh
2. Xác nhận `UNSPLASH_ACCESS_KEY` đã cấu hình trên Vercel và `scripts/populate-images.ts` đã
   chạy trên production chưa — hiện không rõ Words Explorer trên live site đang dùng ảnh thật
   hay vẫn toàn bộ emoji fallback.
3. Dọn dead code: `components/mascot/BraveMascot.tsx` không còn được import ở đâu (đã thay
   hoàn toàn bằng `Leafy.tsx`) — có thể xoá an toàn.
4. Cân nhắc lại giới hạn ghi âm 60s (tăng từ 20s ở `4a6f673`) — đối tượng học sinh vùng
   nông thôn/khu công nghiệp mạng chậm, cần kiểm tra ảnh hưởng upload trước khi giữ nguyên.
5. Chưa review sâu từng dòng của đợt "feat(design)" (Leafy, dashboard, bottom tab bar, nhạc
   nền, zigzag journey, mission celebration) — mới xác nhận `tsc`/`build` pass, chưa audit kỹ
   UX/accessibility/performance trên thiết bị yếu.
6. `docs/tasks.md`, `docs/requirements.md` vẫn lạc hậu so với code — cập nhật nếu user yêu cầu.

## Quy ước làm việc trong phiên (để giữ nhất quán)

- Sau mỗi thay đổi: `rm -rf .next && npx tsc --noEmit` rồi `npm run build` trước khi commit.
- Validate migration SQL bằng `pglast` (Python) trước khi báo user chạy; nhớ chạy từ đúng
  thư mục (`app/` chứa `supabase/migrations/`, không phải root `GreenLeaf/`).
- Kiểm tra UI bằng cách tạo route tạm `app/previewtest/page.tsx`, chụp qua Claude Browser
  tools, rồi **xoá route này trước khi commit** — local dev dùng Supabase credentials giả nên
  không đăng nhập được để test luồng thật.
- Mỗi commit có trailer `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`, push thẳng
  lên `origin/main` sau mỗi thay đổi logic hoàn chỉnh (user coi mỗi lượt trả lời là 1 vòng
  deploy lên Vercel thật).
- Trước khi đổi bất kỳ nội dung UI/feedback nào sang tiếng Việt: **dừng lại và hỏi user** —
  English immersion là quyết định đã chốt, không tự đảo ngược.
