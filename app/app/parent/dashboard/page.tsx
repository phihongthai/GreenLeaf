'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { History } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AppHeader from '@/components/AppHeader';

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
        <AppHeader icon="👨‍👩‍👧" title="Parent Dashboard" />

        {loading ? (
          <p className="text-center text-gray-400 text-sm py-10">Đang tải...</p>
        ) : children.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">Chưa có học sinh nào liên kết với tài khoản này.</p>
        ) : (
          children.map((c) => (
            <div key={c.id} className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
              <div>
                <h2 className="font-extrabold text-lg text-gray-800">{c.name}</h2>
                <p className="text-xs text-gray-400">{c.gradeName}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-[#3A7D44]">{c.speakingPercent}%</p>
                  <p className="text-xs text-gray-500 mt-1">Speaking</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 text-center">
                  <p className="text-lg font-extrabold text-amber-600">{c.writingDone ? 'Done' : 'Not done'}</p>
                  <p className="text-xs text-gray-500 mt-1">Writing</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-gray-700">🍃 {c.leafCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Reward</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-gray-700">🔥 {c.streakDays}</p>
                  <p className="text-xs text-gray-500 mt-1">Streak (ngày)</p>
                </div>
              </div>
              <Link
                href={`/parent/students/${c.id}`}
                className="flex items-center justify-center gap-2 text-sm font-bold text-[#3A7D44] hover:underline pt-1"
              >
                <History className="w-4 h-4" /> Xem lịch sử học tập chi tiết
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
