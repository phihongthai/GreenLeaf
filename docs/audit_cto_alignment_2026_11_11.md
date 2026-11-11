# Rà soát app so với "Sample Unit – CTO Alignment" (31/10/2026)

Ngày rà soát: 11/11/2026. Phạm vi: web (`app/`) và mobile (`mobile/`) trên nhánh `main`.
Cách làm: đọc code, không chạy lại toàn bộ luồng. DB local không bật khi rà soát nên số liệu nội dung (số mission, số từ mỗi bài) CHƯA kiểm tra lại.

Ký hiệu: ✅ đã có · 🟡 một phần · ❌ chưa có · ⚠️ đang làm ngược với doc.

## Kết luận nhanh
App hiện tại là bản **Kindergarten 3 mission cố định** (Words Explorer → Phonics → Speaking Challenge). Sample Unit trong doc là một mô hình khác: Unit → Mission → Act → Task, 3 loại Task (Pronunciation, Unscramble, Reading). Chưa có Unscramble, Reading, lớp học/mã lớp, Unit, và luật thưởng của doc. Phần dùng lại được nhiều nhất là Pronunciation (chấm phát âm Azure, TTS, ghi âm) và khoá bài do giáo viên điều khiển.

## 1. Cấu trúc nội dung (doc mục 2)
| Yêu cầu | Hiện trạng | |
|---|---|---|
| Unit → Mission → Act → Task | App chỉ có Grade → Lesson → Mission (3 loại cố định). Không có Unit, Act, Task. `MissionType` hard-code 3 loại (`lib/types.ts`) | ❌ |
| UI dùng "Mission" thay "Lesson" | UI đang dùng "Lesson" (bản đồ, trang giáo viên, hướng dẫn) | ⚠️ |
| Task Type mở rộng, không hard-code 3 loại | `expectedTexts()` trong `/api/missions/complete` và `MISSION_LABEL` hard-code 3 loại | ❌ |
| 6 Mission/Unit, 90 phút lớp | Bản đồ web có 5 nhà nấm cố định (`NODE_POSITIONS`), không phải 6 | ❌ |
| Mission mở theo tiến độ giảng dạy, không theo điểm | Giáo viên mở/khoá cả lớp (0019) và từng bé (0021). Nhưng app còn tự mở bài kế tiếp khi bé học xong bài trước (`prevDone`) | 🟡 |

## 2. Mission 1 — Task Pronunciation (doc mục 3)
| Yêu cầu | Hiện trạng | |
|---|---|---|
| 15 từ, hình minh hoạ + audio mẫu | `WordsExplorer` có hình (`imageUrl`) và nút nghe TTS. Số từ tuỳ bài, chưa có bộ 15 từ của doc | 🟡 |
| Ghi âm tối đa 3 lần/từ, không bắt buộc đủ 3 | `MAX_ATTEMPTS = 3` chỉ để mở nút "Skip"; không chặn lần ghi thứ 4. Bé phải đạt ≥80 hoặc bấm Skip mới qua từ | 🟡 |
| AI hiển thị % bằng vòng tròn | `ScoreDisplay` hiện thẻ điểm, chip từng từ, phoneme/IPA, lời khen. Không phải vòng tròn % đơn giản | 🟡 |
| Không cần lời giải thích | Vẫn hiện nghĩa từ (`word.meaning`), phoneme/IPA, lời khen và `/api/feedback` | ⚠️ |
| Ghi âm tối đa mỗi lần | 60 giây (`Recorder.tsx`), quá dài cho 1 từ | 🟡 |

## 3. Unscramble và Reading (doc mục 3)
| Yêu cầu | Hiện trạng | |
|---|---|---|
| Unscramble 15 từ: chạm chữ vào ô, không kéo thả, nộp 1 lần, báo đúng/sai + đáp án | Không có component, không có kiểu `unscramble` | ❌ |
| Reading 3 nhân vật, 6 câu A/B/C, 1 lần/câu, báo đúng/sai + đáp án | Không có component, không có kiểu `reading_choice` | ❌ |
| Server xác thực/chấm điểm cho 2 loại này | `/api/missions/complete` chỉ nhận token HMAC từ `/api/assess` (chấm giọng nói). Không có endpoint chấm đáp án | ❌ |
| Đáp án đúng không gửi xuống client | Chưa có nội dung loại này để kiểm tra | ❌ |

## 4. Đánh giá, thưởng, tiến trình (doc mục 4)
| Yêu cầu | Hiện trạng | |
|---|---|---|
| Không pass/fail, không ngưỡng điểm | `PASS_THRESHOLD = 80` ở `lib/rewards.ts`, `lib/missionAttempts.ts`, `WordsExplorer`, `PhonicsChant`. Mission chỉ "completed" khi điểm trung bình ≥80; dưới đó là `try_again` | ⚠️ |
| Mỗi Task hoàn thành = 1 Leaf bất kể kết quả | Chỉ cộng 1 Leaf khi đạt ≥80 | ⚠️ |
| Mission 1 tối đa 3 Leaves | Ngoài 1 Leaf/mission còn `perfect_score` +5, `bonus_3missions` +3, `streak_7` +20. Một bài có thể nhận tới 11+ Leaf | ⚠️ |
| Mỗi Task chỉ thưởng một lần | Có: `greenleaf_record_progress` trả `was_already_completed`, thưởng chỉ cộng lần đầu; 0020 chống cộng song song | ✅ |
| Xem lại kết quả không cộng Leaf lặp | Làm lại được, không cộng lại | ✅ |
| Leaf đổi quà tại trung tâm | Có Mystery Box 100 Leaf (0018) và duyệt bởi admin. Chưa có quy trình "đổi quà tại trung tâm" như doc | 🟡 |
| Lưu: đáp án HS, đáp án đúng, đúng/sai, điểm từng từ, lần thử, trạng thái, Leaf | Lưu `score`, `status`, `item_label` mỗi lượt (`greenleaf_mission_attempts`) và `greenleaf_reward_events`. Không lưu đáp án HS/đáp án đúng/đúng-sai (vì chưa có Unscramble/Reading) | 🟡 |
| Lưu tiến trình/tạm dừng giữa 15 từ | Không có lưu giữa chừng; thoát giữa bài là mất vị trí. Chỉ lưu lượt đã gửi | ❌ |

## 5. UI/UX (doc mục 5)
| Yêu cầu | Hiện trạng | |
|---|---|---|
| Bản đồ 6 Mission quanh Leafy ở trung tâm, xanh đậm + vàng ánh kim | Bản đồ phong cảnh 5 nhà nấm trên đường mòn, Leafy ở góc. Phong cách sáng, khác bản thiết kế tối của doc | ⚠️ |
| Thanh trên: logo, level, Unit & tên, mã lớp, tài khoản | Có logo, level (chọn ở Profile), tài khoản. Không có Unit, không có mã lớp | 🟡 |
| Thanh dưới: Home, Rewards, My Progress, Settings | Learn, Journey, Homework, Profile. Badges/Library ở thanh trên | ⚠️ |
| Mission khoá có biểu tượng khoá | Có | ✅ |
| Unscramble tối ưu mobile, ô chữ độc lập khi chữ lặp | Chưa có | ❌ |

## 6. Kỹ thuật và giáo viên (doc mục 6)
| Yêu cầu | Hiện trạng | |
|---|---|---|
| Teacher Dashboard: hoàn thành, kết quả từng Task/câu | Dashboard giáo viên chỉ có số học sinh/lớp/bài chờ chấm. Trang chi tiết bé (từ 03/11) có tiến độ theo bài, số lần thử và điểm cao nhất từng từ | 🟡 |
| Từ/câu sai, % phát âm từng từ, Leaves | Có điểm cao nhất và số lần thử từng từ; chưa có điểm từng lần thử, chưa tổng hợp theo lớp, chưa liệt kê "từ sai nhiều nhất" | 🟡 |
| Lớp học / mã lớp | Không có bảng lớp; "lớp" thực chất là Grade (Kindergarten, Kids 1, Kids 2, Teens) | ❌ |
| TTS Reading không bắt buộc | Chưa có Reading | — |
| 15 hình từ vựng + 3 hình nhân vật, ai phụ trách | Chưa chốt; ảnh từ vựng lấy từ Unsplash cache (cần `UNSPLASH_ACCESS_KEY`, Task 11.2) | ❌ |
| Chuẩn hoá và mapping 3 mission demo cũ | Chưa làm; còn bài "Demo" trong dữ liệu | ❌ |

## 7. Điểm mâu thuẫn trong chính tài liệu/việc cần CTO chốt
1. Doc nói Mission 1 tối đa 3 Leaves, mà app có 4 nguồn thưởng khác (perfect, bonus, streak, Mystery Box). Cần quyết định bỏ hay giữ cho Primary Path 1.
2. Doc: không pass/fail. App dùng ngưỡng 80 làm điều kiện hoàn thành. Bỏ ngưỡng thì `try_again` và `bonus_3missions` đều phải thiết kế lại.
3. Doc yêu cầu "mã lớp" nhưng app không có khái niệm lớp. Task 13.10 (`org_id`/`program`) và lớp nên làm cùng nhau.
4. "Primary Path 1" chưa là một chương trình trong dữ liệu (hiện chỉ có 4 Grade).
5. Phase 13 của tasks.md đã chuyển hướng sang mầm non dạy trên lớp (TV/máy chiếu). Doc 31/10 nhắm vào trung tâm tiếng Anh, học ở nhà. Hai hướng khác nhau; doc này nên coi là Phase 12 (đang hoãn).

## 8. Ngoài phạm vi doc nhưng đáng ghi nhận khi rà soát
- **Admin dev chat** (workflow `admin-request.yml`, từ 03/11): admin nhắn yêu cầu, Claude chạy qua GitHub Actions rồi bot tự commit vào `main`, kéo theo deploy. Với app trường học thật, nên có bước duyệt PR trước khi vào `main` và deploy.
- `/register` vẫn cho tự tạo tài khoản giáo viên không duyệt (Task 11.12).
- Khoá bài (cả lớp và từng bé) chỉ chặn ở giao diện, chưa có RLS/server.
- Mobile (`mobile/`) chưa test trong lần rà soát này; có cùng 3 mission cố định.

## 9. Khoảng cách và việc đề xuất (theo thứ tự)
1. **Chốt quyết định** (không code): mục 7.1–7.5; ghi vào `CLAUDE_SESSION.md`.
2. **Dữ liệu**: Unit/Mission/Act/Task + `task_type` mở rộng; lớp học và mã lớp; migration mới (số 0024 trở đi, vì 0021–0023 đã dùng).
3. **Chấm điểm server** cho Unscramble/Reading và luật thưởng "1 Leaf/Task, một lần".
4. **Component**: Unscramble (chạm), ReadingChoice, rút gọn Pronunciation (3 lần, bỏ giải thích, vòng tròn %).
5. **Lưu/tạm dừng** tiến trình 15 từ.
6. **Teacher Dashboard** theo lớp: hoàn thành, từ/câu sai, % phát âm từng từ.
7. **UI**: bản đồ 6 Mission, thanh trên/dưới theo doc.
8. **Assets**: 15 hình từ vựng + 3 nhân vật; nội dung bài đọc và 6 câu hỏi.

Các mục này khớp với Task 12.4–12.18 và 13.10 trong `docs/tasks.md`; phần chưa có trong tasks.md là: khái niệm lớp/mã lớp, bỏ ngưỡng 80, bỏ các nguồn thưởng ngoài 1 Leaf/Task, và quy trình đổi quà tại trung tâm.
