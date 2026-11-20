'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { History } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';

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
          const [{ count: totalMissions }, { count: completedMissions }, { count: writingCount }, { data: reward }, { data: unit }] = await Promise.all([
            supabase
              .from('greenleaf_missions')
              .select('id, greenleaf_lessons!inner(grade_id)', { count: 'exact', head: true })
              .eq('greenleaf_lessons.grade_id', kid.grade_id),
            supabase.from('greenleaf_student_progress').select('id', { count: 'exact', head: true }).eq('student_id', kid.id).eq('status', 'completed'),
            supabase.from('greenleaf_homework_submissions').select('id', { count: 'exact', head: true }).eq('student_id', kid.id),
            supabase.from('greenleaf_rewards').select('leaf_count, streak_days').eq('student_id', kid.id).maybeSingle(),
            // Unit tasks (newer Quiz/Match up/Group sort/Anagram/Unjumble/... content) count toward
            // "Speaking done" too, alongside the legacy missions above — same activity, two content models.
            kid.grade_id
              ? supabase
                  .from('greenleaf_units')
                  .select('missions:greenleaf_unit_missions(acts:greenleaf_acts(tasks:greenleaf_tasks(id)))')
                  .eq('grade_id', kid.grade_id)
              : Promise.resolve({ data: null }),
          ]);

          const unitTaskIds = (
            (unit as unknown as { missions: { acts: { tasks: { id: string }[] }[] }[] }[] | null) ?? []
          ).flatMap((u) => u.missions.flatMap((m) => m.acts.flatMap((a) => a.tasks.map((t) => t.id))));

          const { count: completedUnitTasks } = unitTaskIds.length > 0
            ? await supabase
                .from('greenleaf_task_progress')
                .select('task_id', { count: 'exact', head: true })
                .eq('student_id', kid.id)
                .eq('status', 'completed')
                .in('task_id', unitTaskIds)
            : { count: 0 };

          const totalActivities = (totalMissions ?? 0) + unitTaskIds.length;
          const doneActivities = (completedMissions ?? 0) + (completedUnitTasks ?? 0);
          const speakingPercent = totalActivities ? Math.round((doneActivities / totalActivities) * 100) : 0;

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
        <AppHeader title="Parent Dashboard" />

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3A7D44] to-[#213B26] pl-5 pr-4 pt-4 shadow-lg gl-pop-in">
          <div className="flex items-end gap-3">
            <div className="min-w-0 flex-1 pb-5">
              <p className="gl-display text-2xl font-extrabold leading-tight text-white">
                Welcome, Parent!
              </p>
              <p className="mt-1 text-sm font-bold text-white/85">
                {children.length > 0
                  ? `Here is your child${children.length > 1 ? 'ren' : ''}'s learning progress this week.`
                  : 'Track your child\'s learning progress here.'}
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
          <p className="text-center text-gray-400 text-sm py-10">Loading...</p>
        ) : children.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">No students linked to this account yet.</p>
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
                  <p className="text-xs font-bold text-gl-muted mt-1">Speaking done</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 text-center">
                  <p className="text-lg font-extrabold text-amber-600">{c.writingDone ? 'Submitted' : 'Not yet'}</p>
                  <p className="text-xs font-bold text-gl-muted mt-1">Writing</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-gl-green">🍃 {c.leafCount}</p>
                  <p className="text-xs font-bold text-gl-muted mt-1">Leaves earned</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-gl-streak">🔥 {c.streakDays}</p>
                  <p className="text-xs font-bold text-gl-muted mt-1">Day streak</p>
                </div>
              </div>
              <Link
                href={`/parent/students/${c.id}`}
                className="flex items-center justify-center gap-2 text-sm font-bold text-gl-green hover:underline pt-1"
              >
                <History className="w-4 h-4" /> View detailed learning history
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
              <p className="gl-display font-extrabold text-gl-green">Quick Tip</p>
              <p className="mt-0.5 text-sm text-gl-green-dark leading-relaxed">
                Practicing 10 minutes every day is more effective than one long session.
                A daily streak helps build a lasting habit.
              </p>
            </div>
          </div>
        )}
      </div>
      <AppFooter />
    </div>
  );
}
