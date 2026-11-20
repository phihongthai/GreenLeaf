'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, ChevronRight, Circle, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import UnitShell from '@/components/unit/UnitShell';
import { Skeleton } from '@/components/unit/ui';
import { getUnitStudent, useUnitStudent } from '@/lib/useUnitProfile';
import { applyOverrides, fetchClassOverrides } from '@/lib/unitAccess';

interface TaskView {
  id: string;
  title: string;
  order_index: number;
  task_type: string;
  status: 'new' | 'in_progress' | 'completed';
}
interface ActView { id: string; title: string; order_index: number; tasks: TaskView[] }

const TYPE_META: Record<string, { label: string; icon: string; tint: string }> = {
  pronunciation: { label: 'Pronunciation', icon: '🎤', tint: 'bg-orange-100' },
  unscramble: { label: 'Anagram', icon: '🔤', tint: 'bg-sky-100' },
  reading_choice: { label: 'Reading', icon: '📖', tint: 'bg-pink-100' },
  quiz: { label: 'Quiz', icon: '❓', tint: 'bg-violet-100' },
  unjumble: { label: 'Unjumble', icon: '🧩', tint: 'bg-teal-100' },
  match_up: { label: 'Match up', icon: '🔗', tint: 'bg-fuchsia-100' },
  group_sort: { label: 'Group sort', icon: '🗂️', tint: 'bg-amber-100' },
};

export default function UnitMissionPage() {
  const { missionId } = useParams<{ missionId: string }>();
  const { student } = useUnitStudent();
  const [title, setTitle] = useState('');
  const [unitTitle, setUnitTitle] = useState('');
  const [unlocked, setUnlocked] = useState(true);
  const [acts, setActs] = useState<ActView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [stu, { data }] = await Promise.all([
        getUnitStudent(),
        supabase
          .from('greenleaf_unit_missions')
          .select('id, order_index, title, book_sections, is_unlocked, unit:greenleaf_units(title), acts:greenleaf_acts(id, title, order_index, tasks:greenleaf_tasks(id, title, order_index, task_type))')
          .eq('id', missionId)
          .maybeSingle(),
      ]);
      if (!stu) return;
      if (!data) {
        setLoading(false);
        return;
      }
      const row = data as unknown as {
        id: string; order_index: number; title: string; book_sections: string | null; is_unlocked: boolean;
        unit: { title: string } | null; acts: Omit<ActView, 'tasks'>[] & { tasks: Omit<TaskView, 'status'>[] }[];
      };
      const [overrides, { data: progress }] = await Promise.all([
        fetchClassOverrides(supabase, stu.classId),
        supabase.from('greenleaf_task_progress').select('task_id, status').eq('student_id', stu.id),
      ]);
      const unlockMap = applyOverrides([row], overrides);
      setUnlocked(unlockMap.get(row.id) ?? false);
      setTitle(`Mission ${row.order_index}: ${row.title}`);
      setUnitTitle(row.unit?.title ?? '');

      const statusByTask = new Map(((progress ?? []) as { task_id: string; status: 'in_progress' | 'completed' }[]).map((p) => [p.task_id, p.status]));

      setActs(
        [...(row.acts as unknown as (ActView & { tasks: TaskView[] })[])]
          .sort((a, b) => a.order_index - b.order_index)
          .map((a) => ({
            ...a,
            tasks: [...a.tasks]
              .sort((x, y) => x.order_index - y.order_index)
              .map((t) => ({ ...t, status: statusByTask.get(t.id) ?? 'new' })),
          }))
      );
      setLoading(false);
    })();
  }, [missionId]);

  return (
    <UnitShell profile={student} unitTitle={unitTitle}>
      <Link href="/unit" className="text-xs font-bold text-gl-green-dark hover:underline">← All missions</Link>
      <h1 className="gl-display mt-2 mb-4 text-2xl font-black text-gl-green-dark">{title || 'Mission'}</h1>

      {loading ? (
        <div className="space-y-3" role="status" aria-label="Loading">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : !unlocked ? (
        <div className="rounded-2xl border border-emerald-200 bg-white p-6 text-center space-y-2">
          <Lock className="w-8 h-8 mx-auto text-gl-green-dark" aria-hidden />
          <p className="font-extrabold">This mission is locked</p>
          <p className="text-sm text-gl-muted-dark">Your teacher will open it when your class is ready.</p>
        </div>
      ) : acts.length === 0 ? (
        <p className="text-gl-muted-dark py-10 text-center">No activities in this mission yet.</p>
      ) : (
        <div className="space-y-5">
          {acts.map((act) => (
            <section key={act.id} aria-labelledby={`act-${act.id}`}>
              <h2 id={`act-${act.id}`} className="mb-2 text-sm font-extrabold text-gl-muted-dark">Act {act.order_index} · {act.title}</h2>
              <ul className="space-y-2">
                {act.tasks.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/unit/task/${t.id}`}
                      className="group flex items-center gap-3 rounded-3xl border-2 border-emerald-200 bg-white px-4 py-3 shadow-[0_4px_0_#cdeac0] transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_6px_0_#cdeac0] active:translate-y-1 active:shadow-[0_1px_0_#cdeac0]"
                    >
                      <span aria-hidden className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-2xl ${(TYPE_META[t.task_type] ?? { tint: 'bg-emerald-100' }).tint}`}>
                        {TYPE_META[t.task_type]?.icon ?? '🍃'}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-bold truncate">Task {t.order_index} · {t.title}</span>
                        <span className="block text-xs text-gl-muted-dark">{TYPE_META[t.task_type]?.label ?? t.task_type}{t.status === 'in_progress' ? ' · in progress' : ''}</span>
                      </span>
                      {t.status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" aria-label="Completed" />
                      ) : (
                        <Circle className={`w-6 h-6 shrink-0 ${t.status === 'in_progress' ? 'text-amber-500' : 'text-gray-300'}`} aria-label={t.status === 'in_progress' ? 'In progress' : 'Not started'} />
                      )}
                      <ChevronRight className="w-4 h-4 text-gl-green-dark shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </UnitShell>
  );
}
