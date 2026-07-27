import { PenLine, FolderOpen, Users, CheckCircle2, BookOpen, KeyRound } from 'lucide-react';
import TeacherNav from '@/components/teacher/TeacherNav';

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 w-6 h-6 rounded-full bg-[#3A7D44] text-white text-xs font-extrabold flex items-center justify-center">
        {n}
      </span>
      <p className="text-sm text-gray-600 leading-relaxed">{children}</p>
    </li>
  );
}

function GuideSection({
  icon,
  color,
  title,
  children,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-3xl p-1 bg-gradient-to-br ${color} shadow-md`}>
      <div className="bg-white/95 rounded-[1.35rem] p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shrink-0`}>
            {icon}
          </div>
          <h2 className="text-lg font-extrabold text-[#2E4A34]">{title}</h2>
        </div>
        <ol className="space-y-3">{children}</ol>
      </div>
    </div>
  );
}

export default function TeacherGuidePage() {
  return (
    <div className="min-h-screen gl-playful-bg px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <TeacherNav active="guide" />

        <div className="text-center space-y-1 py-2">
          <h1 className="text-2xl font-extrabold text-[#2E4A34]">❓ Hướng dẫn sử dụng</h1>
          <p className="text-sm text-gray-400">5 việc chính giáo viên làm trên GreenLeaf</p>
        </div>

        <GuideSection icon={<KeyRound className="w-5 h-5" />} color="from-rose-400 to-pink-500" title="🔑 Tạo tài khoản học sinh & phụ huynh">
          <Step n={1}>
            Vào tab <strong>Accounts</strong> → mục <strong>&quot;Tạo tài khoản học sinh&quot;</strong>: nhập Tên hiển thị, đặt <strong>Username</strong> + <strong>Mật khẩu</strong> (không cần email — học sinh nhỏ tuổi không cần hộp thư), chọn Cấp độ, bấm <strong>Tạo tài khoản</strong>.
          </Step>
          <Step n={2}>
            Báo lại đúng Username + Mật khẩu vừa tạo cho học sinh — các em đăng nhập ở trang Login bằng đúng 2 thông tin này (không nhập email).
          </Step>
          <Step n={3}>
            Muốn tạo tài khoản cho phụ huynh: dùng mục <strong>&quot;Tạo tài khoản phụ huynh&quot;</strong> ngay bên dưới, cũng bằng username + mật khẩu, không cần email.
          </Step>
          <Step n={4}>
            Ở mục <strong>&quot;Gán phụ huynh ↔ học sinh&quot;</strong>: chọn 1 phụ huynh trong danh sách, tick chọn (các) học sinh thuộc phụ huynh đó, bấm <strong>&quot;Lưu liên kết&quot;</strong> — phụ huynh sẽ thấy đúng con mình trong Parent Dashboard.
          </Step>
          <Step n={5}>
            Học sinh/phụ huynh quên mật khẩu, gõ sai tên, hoặc cần xoá tài khoản? Kéo xuống mục <strong>&quot;Quản lý tài khoản đã tạo&quot;</strong> — bấm icon bút chì để sửa tên/cấp độ, icon chìa khoá để đặt lại mật khẩu, hoặc icon thùng rác để xoá hẳn tài khoản (không khôi phục được).
          </Step>
        </GuideSection>

        <GuideSection icon={<BookOpen className="w-5 h-5" />} color="from-sky-400 to-blue-500" title="📚 Tạo bài học Speaking (Lessons)">
          <Step n={1}>
            Vào tab <strong>Lessons</strong>, chọn <strong>Cấp độ</strong> ở hàng nút phía trên, rồi bấm <strong>&quot;Tạo bài học mới&quot;</strong>.
          </Step>
          <Step n={2}>
            Đặt tên bài học (VD &quot;Unit 4 — Weather&quot;), sau đó điền đủ 3 mission cố định của bài: <strong>1) Words Explorer</strong> (chủ đề + danh sách từ vựng), <strong>2) Phonics/Sentence Builder</strong> (các câu học sinh sẽ đọc theo, có thể chỉ định âm cần highlight), <strong>3) Speaking Challenge</strong> (script đầy đủ học sinh tự đọc).
          </Step>
          <Step n={3}>
            Bấm <strong>&quot;Tạo bài học&quot;</strong> — bài học xuất hiện ngay trong danh sách và học sinh cấp độ đó thấy ngay trong màn hình chọn bài học của mình.
          </Step>
          <Step n={4}>
            Mỗi cấp độ có thể có nhiều bài học (không giới hạn) — cứ lặp lại để thêm bài mới. Bấm icon <strong>bút chì</strong> để sửa nội dung bài học đã có, hoặc icon thùng rác để xoá.
          </Step>
        </GuideSection>

        <GuideSection icon={<PenLine className="w-5 h-5" />} color="from-emerald-400 to-green-500" title="✍️ Giao & chấm bài tập viết">
          <Step n={1}>
            Vào tab <strong>Homework</strong>. Nếu thư viện chưa có đề nào, bấm <strong>&quot;Tạo đề bài mới&quot;</strong> ở mục <strong>Thư viện đề bài</strong> phía dưới: chọn Cấp độ, nhập Tiêu đề + Nội dung đề, bấm <strong>&quot;Thêm vào thư viện&quot;</strong>. Đề bài chỉ cần tạo 1 lần, dùng lại được nhiều lần cho nhiều lượt giao khác nhau.
          </Step>
          <Step n={2}>
            Ở mục <strong>&quot;Giao bài tập&quot;</strong> trên cùng: chọn 1 đề có sẵn trong thư viện (dropdown), chọn Hạn nộp (không bắt buộc), bấm <strong>Giao bài</strong> — chỉ học sinh đúng cấp độ của đề đó mới thấy bài.
          </Step>
          <Step n={3}>
            Bài vừa giao hiện trong danh sách. Bấm vào để xem học sinh đã nộp bài chưa.
          </Step>
          <Step n={4}>
            Đọc bài học sinh nộp, chấm ngoài (VD copy sang ChatGPT để hỗ trợ nếu cần), rồi bấm <strong>&quot;Đánh dấu đã chấm&quot;</strong> — trạng thái chuyển từ <em>Đã nộp</em> sang <em>Đã chấm</em>, học sinh sẽ thấy cập nhật này.
          </Step>
        </GuideSection>

        <GuideSection icon={<FolderOpen className="w-5 h-5" />} color="from-amber-400 to-orange-500" title="📁 Quản lý tài liệu (Resource Library)">
          <Step n={1}>
            Vào tab <strong>Resource Library</strong> → chọn giáo trình con: <strong>Ready Steady Grow / Think / Prepare / IELTS</strong>.
          </Step>
          <Step n={2}>
            Chọn 1 Unit có sẵn để mở, hoặc gõ tên Unit mới (VD &quot;Unit 1&quot;) ở khung <strong>&quot;Tạo Unit mới + upload file đầu tiên&quot;</strong>.
          </Step>
          <Step n={3}>
            Chọn loại tài liệu (Lesson Plan / Worksheet / Flashcard / Audio / Video / Test / Keys) ở ô dropdown, bấm <strong>&quot;Chọn file&quot;</strong> để tải lên — có thể upload nhiều loại file khác nhau vào cùng 1 Unit.
          </Step>
          <Step n={4}>
            Trong 1 Unit, các file được nhóm theo loại. Bấm vào tên file để tải xuống (mở tab mới).
          </Step>
        </GuideSection>

        <GuideSection icon={<Users className="w-5 h-5" />} color="from-violet-400 to-purple-500" title="👩‍🎓 Theo dõi học sinh">
          <Step n={1}>
            Vào tab <strong>Students</strong> để xem danh sách toàn bộ học sinh, cấp độ, số <strong>Leaf</strong> tích lũy và <strong>streak</strong> (chuỗi ngày học liên tục) của từng em.
          </Step>
          <Step n={2}>
            Bấm vào 1 học sinh để xem <strong>lịch sử học tập chi tiết</strong>: số lần luyện Speaking theo từng ngày, điểm số + kết quả (đạt/chưa đạt) của mọi lần thử (không chỉ lần gần nhất), và danh sách bài Writing đã nộp.
          </Step>
        </GuideSection>

        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#3A7D44] font-extrabold text-sm">
            <CheckCircle2 className="w-4 h-4" /> Lưu ý nhanh
          </div>
          <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
            <li>Học sinh chỉ nhìn thấy bài tập & tài liệu đúng cấp độ đã đăng ký của mình.</li>
            <li>Muốn đăng xuất hoặc đổi sang tài khoản khác: bấm <strong>Đăng xuất</strong> ở góc trên phải.</li>
            <li>Bấm vào tên hiển thị của mình (góc trên phải) để vào trang Hồ sơ đổi tên hiển thị — áp dụng cho mọi role.</li>
            <li>
              Có vấn đề với ghi âm/chấm điểm phát âm của học sinh? Đó là tính năng phía học sinh (mission Speaking), dùng Azure Speech — báo lại quản trị viên nếu học sinh phản ánh lỗi.
            </li>
            <li>
              Học sinh mới dùng app lần đầu sẽ tự thấy hướng dẫn ngắn (5 bước) ngay khi mở trang chính. Có thể xem lại đầy đủ bất cứ lúc nào bằng cách bấm icon <strong>❓</strong> ở góc trên phải trang chính học sinh.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
