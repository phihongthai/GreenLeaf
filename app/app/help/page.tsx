import { BookOpen, Mic, CheckCircle2, Leaf, PenLine, TreePine } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import FloatingDecor from '@/components/decor/FloatingDecor';
import SceneBackground from '@/components/decor/SceneBackground';

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

export default function StudentHelpPage() {
  return (
    <div className="relative min-h-screen gl-playful-bg px-4 py-8">
      <SceneBackground />
      <FloatingDecor />
      <div className="relative max-w-2xl mx-auto space-y-6">
        <AppHeader backHref="/grades" icon="❓" title="Hướng dẫn sử dụng" />

        <div className="text-center space-y-1 py-2">
          <p className="text-sm text-gray-400">Đọc kỹ để biết cách luyện học trên GreenLeaf nhé!</p>
        </div>

        <GuideSection icon={<BookOpen className="w-5 h-5" />} color="from-sky-400 to-blue-500" title="🏠 Trang chính có gì?">
          <Step n={1}>
            Mỗi lần mở app, con sẽ thấy ngay danh sách <strong>bài học</strong> của mình (không cần chọn cấp độ lại).
          </Step>
          <Step n={2}>
            Bấm vào 1 bài học (ô có tên bài, VD &quot;Bài 1: Animals&quot;) để bắt đầu luyện.
          </Step>
          <Step n={3}>
            Bài học có dấu <strong>✓ xanh</strong> là con đã học xong rồi — vẫn học lại được nếu muốn ôn thêm.
          </Step>
        </GuideSection>

        <GuideSection icon={<CheckCircle2 className="w-5 h-5" />} color="from-violet-400 to-purple-500" title="🎯 Trong 1 bài học có 3 phần">
          <Step n={1}>
            <strong>Words Explorer</strong> — học từ mới: nghe từ, xem nghĩa tiếng Việt, rồi ghi âm đọc lại.
          </Step>
          <Step n={2}>
            <strong>Phonics</strong> — đọc theo từng câu.
          </Step>
          <Step n={3}>
            <strong>Speaking Challenge</strong> — đọc cả đoạn một lượt.
          </Step>
          <Step n={4}>
            Con phải đọc <strong>đạt</strong> phần 1 mới được sang phần 2, đạt phần 2 mới sang phần 3 — làm lần lượt từng phần, không bỏ qua được.
          </Step>
        </GuideSection>

        <GuideSection icon={<Mic className="w-5 h-5" />} color="from-teal-500 to-cyan-600" title="🎤 Cách ghi âm">
          <Step n={1}>
            Bấm nút xanh <strong>&quot;Bấm để Ghi âm&quot;</strong>, rồi đọc to, rõ ràng theo đúng từ/câu hiển thị trên màn hình.
          </Step>
          <Step n={2}>
            Bấm nút đỏ <strong>&quot;Dừng&quot;</strong> khi đọc xong (app cũng tự dừng sau 20 giây nếu con quên bấm).
          </Step>
          <Step n={3}>
            Chờ vài giây, máy sẽ chấm điểm cho con.
          </Step>
        </GuideSection>

        <GuideSection icon={<Leaf className="w-5 h-5" />} color="from-emerald-400 to-green-500" title="✅ Kết quả sau khi đọc">
          <Step n={1}>
            Điểm từ <strong>80 trở lên</strong>: con thấy chữ &quot;Well done!&quot; màu xanh, được cộng lá 🍃, bấm nút để đi tiếp.
          </Step>
          <Step n={2}>
            Điểm dưới 80: con thấy &quot;Try again!&quot; màu cam, kèm gợi ý cách đọc lại cho đúng — đọc lại bao nhiêu lần cũng được, không sao cả!
          </Step>
        </GuideSection>

        <GuideSection icon={<TreePine className="w-5 h-5" />} color="from-amber-400 to-orange-500" title="🍃🔥 Lá và chuỗi ngày học">
          <Step n={1}>
            Mỗi lần đọc đạt được <strong>+1 lá 🍃</strong>. Đọc điểm tuyệt đối 100 được thêm lá. Học xong cả 3 phần của 1 bài được thêm lá nữa!
          </Step>
          <Step n={2}>
            Học mỗi ngày để giữ <strong>chuỗi ngày học 🔥</strong> — nghỉ 1 ngày là chuỗi bị mất, phải học lại từ đầu.
          </Step>
          <Step n={3}>
            Mang số lá tích lũy được tới trung tâm để đổi quà nhé!
          </Step>
        </GuideSection>

        <GuideSection icon={<PenLine className="w-5 h-5" />} color="from-rose-400 to-pink-500" title="📝🌳 Bài tập viết & Hành trình học tập">
          <Step n={1}>
            Bấm <strong>&quot;Homework&quot;</strong> ở trang chính để xem bài tập viết cô/thầy giao, gõ bài rồi nộp.
          </Step>
          <Step n={2}>
            Bấm <strong>&quot;Learning Journey&quot;</strong> để xem cây của con đã lớn tới đâu — học càng nhiều, cây càng lớn!
          </Step>
        </GuideSection>

        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <p className="text-sm text-gray-500">Có chỗ nào chưa hiểu? Hỏi cô/thầy giáo nhé! 💚</p>
        </div>
      </div>
    </div>
  );
}
