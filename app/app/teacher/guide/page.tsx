import { PenLine, FolderOpen, Users, CheckCircle2 } from 'lucide-react';
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
          <p className="text-sm text-gray-400">3 việc chính giáo viên làm trên GreenLeaf</p>
        </div>

        <GuideSection icon={<PenLine className="w-5 h-5" />} color="from-emerald-400 to-green-500" title="✍️ Giao & chấm bài tập viết">
          <Step n={1}>
            Vào tab <strong>Homework</strong>, điền form <strong>&quot;Giao bài tập mới&quot;</strong>: Tiêu đề, Đề bài, chọn <strong>Cấp độ</strong> (chỉ học sinh đúng cấp độ đó mới thấy bài), chọn Hạn nộp (không bắt buộc) rồi bấm <strong>Giao bài</strong>.
          </Step>
          <Step n={2}>
            Bài tập vừa tạo hiện ngay trong danh sách bên dưới. Bấm vào tên bài để xem học sinh đã nộp bài chưa.
          </Step>
          <Step n={3}>
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
            Đây là trang chỉ xem — dùng để nắm nhanh học sinh nào đang học đều, học sinh nào cần nhắc nhở.
          </Step>
        </GuideSection>

        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#3A7D44] font-extrabold text-sm">
            <CheckCircle2 className="w-4 h-4" /> Lưu ý nhanh
          </div>
          <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
            <li>Học sinh chỉ nhìn thấy bài tập & tài liệu đúng cấp độ đã đăng ký của mình.</li>
            <li>Muốn đăng xuất hoặc đổi sang tài khoản khác: bấm <strong>Đăng xuất</strong> ở góc trên phải.</li>
            <li>
              Có vấn đề với ghi âm/chấm điểm phát âm của học sinh? Đó là tính năng phía học sinh (mission Speaking), dùng Azure Speech — báo lại quản trị viên nếu học sinh phản ánh lỗi.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
