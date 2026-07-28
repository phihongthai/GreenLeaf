'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { History } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AppHeader from '@/components/AppHeader';
import LeafLogo from '@/components/brand/LeafLogo';

interface ChildStat {
  id: string;
  name: string;
  gradeName: string;
  speakingPercent: number;
  writingDone: boolean;
  leafCount: number;
  streakDays: number;
}

export default function ParentDashboardPage() {
  const [children, setChildren] = useState<ChildStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: kids } = await supabase
        .from('greenleaf_profiles')
        .select('id, name, grade_id, grades:greenleaf_grades(name)')
        .eq('parent_id', user.id);

      const stats = await Promise.all(
        (kids ?? []).map(async (kid) => {
          const [{ count: totalMissions }, { count: completedMissions }, { count: writingCount }, { data: reward }] = await Promise.all([
            supabase
              .from('greenleaf_missions')
              .select('id, greenleaf_lessons!inner(grade_id)', { count: 'exact', head: true })
              .eq('greenleaf_lessons.grade_id', kid.grade_id),
            supabase.from('greenleaf_student_progress').select('id', { count: 'exact', head: true }).eq('student_id', kid.id).eq('status', 'completed'),
            supabase.from('greenleaf_homework_submissions').select('id', { count: 'exact', head: true }).eq('student_id', kid.id),
            supabase.from('greenleaf_rewards').select('leaf_count, streak_days').eq('student_id', kid.id).maybeSingle(),
          ]);

          const speakingPercent = totalMissions ? Math.round(((completedMissions ?? 0) / totalMissions) * 100) : 0;

          return {
            id: kid.id,
            name: kid.name,
            gradeName: (kid as unknown as { grades?: { name: string } }).grades?.name ?? '—',
            speakingPercent,
            writingDone: (writingCount ?? 0) > 0,
            leafCount: reward?.leaf_count ?? 0,
            streakDays: reward?.streak_days ?? 0,
          };
        })
      );

      setChildren(stats);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen gl-playful-bg px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <AppHeader leading={<LeafLogo size="sm" />} title="Góc phụ huynh" />

        {/* Nhãn ở trang này trước đây là tiếng Anh (Speaking / Writing / Done /
            Not done). Phụ huynh vùng nông thôn phần lớn không đọc được, nên
            chuyển hết sang tiếng Việt. */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3A7D44] to-[#213B26] pl-5 pr-4 pt-4 shadow-lg gl-pop-in">
          <div className="flex items-end gap-3">
            <div className="min-w-0 flex-1 pb-5">
              <p className="gl-display text-2xl font-extrabold leading-tight text-white">
                Chào anh/chị!
              </p>
              <p className="mt-1 text-sm font-bold text-white/85">
                {children.length > 0
                  ? `Đây là tình hình học tập của ${children.length === 1 ? 'con' : `${children.length} con`} tuần này.`
                  : 'Theo dõi việc học của con ngay tại đây.'}
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/leafy/act_teamwork2.webp"
              alt=""
              aria-hidden
              className="h-28 w-auto shrink-0 drop-shadow-lg"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 text-sm py-10">Đang tải...</p>
        ) : children.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">Chưa có học sinh nào liên kết với tài khoản này.</p>
        ) : (
          children.map((c) => (
            <div key={c.id} className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
              <div>
                <h2 className="gl-display font-extrabold text-xl text-gl-green-dark">{c.name}</h2>
                <p className="text-xs font-bold text-gl-muted">{c.gradeName}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-gl-green">{c.speakingPercent}%</p>
                  <p className="text-xs font-bold text-gl-muted mt-1">Bài nói đã xong</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 text-center">
                  <p className="text-lg font-extrabold text-amber-600">{c.writingDone ? 'Đã nộp' : 'Chưa nộp'}</p>
                  <p className="text-xs font-bold text-gl-muted mt-1">Bài viết</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-gl-green">🍃 {c.leafCount}</p>
                  <p className="text-xs font-bold text-gl-muted mt-1">Lá thưởng</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-gl-streak">🔥 {c.streakDays}</p>
                  <p className="text-xs font-bold text-gl-muted mt-1">Ngày học liên tiếp</p>
                </div>
              </div>
              <Link
                href={`/parent/students/${c.id}`}
                className="flex items-center justify-center gap-2 text-sm font-bold text-gl-green hover:underline pt-1"
              >
                <History className="w-4 h-4" /> Xem lịch sử học tập chi tiết
              </Link>
            </div>
          ))
        )}

        {!loading && children.length > 0 && (
          <div className="flex items-center gap-4 rounded-3xl border-2 border-emerald-100 bg-white/80 p-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/leafy/emo_thinking2.webp"
              alt=""
              aria-hidden
              className="h-16 w-auto shrink-0 drop-shadow-sm gl-float"
            />
            <div>
              <p className="gl-display font-extrabold text-gl-green">Mẹo nhỏ cho anh/chị</p>
              <p className="mt-0.5 text-sm text-gl-green-dark leading-relaxed">
                Cho con luyện đều mỗi ngày 10 phút sẽ hiệu quả hơn dồn một buổi dài.
                Chuỗi ngày liên tiếp giúp con giữ thói quen.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
