'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, ChevronRight, Circle, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import UnitShell from '@/components/unit/UnitShell';
import { useUnitStudent } from '@/lib/useUnitProfile';
import { fetchMissionUnlockMap } from '@/lib/unitAccess';

interface TaskView {
  id: string;
  title: string;
  order_index: number;
  task_type: string;
  status: 'new' | 'in_progress' | 'completed';
}
interface ActView { id: string; title: string; order_index: number; tasks: TaskView[] }

const TYPE_LABEL: Record<string, string> = {
  pronunciation: 'Pronunciation',
  unscramble: 'Unscramble',
  reading_choice: 'Reading',
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
    if (!student) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('greenleaf_unit_missions')
        .select('id, order_index, title, book_sections, is_unlocked, unit:greenleaf_units(title), acts:greenleaf_acts(id, title, order_index, tasks:greenleaf_tasks(id, title, order_index, task_type))')
        .eq('id', missionId)
        .maybeSingle();
      if (!data) {
        setLoading(false);
        return;
      }
      const row = data as unknown as {
        id: string; order_index: number; title: string; book_sections: string | null; is_unlocked: boolean;
        unit: { title: string } | null; acts: Omit<ActView, 'tasks'>[] & { tasks: Omit<TaskView, 'status'>[] }[];
      };
      const unlockMap = await fetchMissionUnlockMap(supabase, student.classId, [row]);
      setUnlocked(unlockMap.get(row.id) ?? false);
      setTitle(`Mission ${row.order_index}: ${row.title}`);
      setUnitTitle(row.unit?.title ?? '');

      const { data: progress } = await supabase
        .from('greenleaf_task_progress')
        .select('task_id, status')
        .eq('student_id', student.id);
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
  }, [student, missionId]);

  return (
    <UnitShell profile={student} unitTitle={unitTitle} backHref="/unit">
      <Link href="/unit" className="text-xs font-bold text-amber-300 hover:underline">← All missions</Link>
      <h1 className="mt-2 mb-4 text-xl font-black text-amber-300">{title || 'Mission'}</h1>

      {loading ? (
        <p className="text-emerald-100/60 py-10 text-center">Loading…</p>
      ) : !unlocked ? (
        <div className="rounded-2xl border border-amber-400/30 bg-[#10331f] p-6 text-center space-y-2">
          <Lock className="w-8 h-8 mx-auto text-amber-300" aria-hidden />
          <p className="font-extrabold">This mission is locked</p>
          <p className="text-sm text-emerald-100/70">Your teacher will open it when your class is ready.</p>
        </div>
      ) : acts.length === 0 ? (
        <p className="text-emerald-100/70 py-10 text-center">No activities in this mission yet.</p>
      ) : (
        <div className="space-y-5">
          {acts.map((act) => (
            <section key={act.id} aria-labelledby={`act-${act.id}`}>
              <h2 id={`act-${act.id}`} className="mb-2 text-sm font-extrabold text-emerald-100/80">Act {act.order_index} · {act.title}</h2>
              <ul className="space-y-2">
                {act.tasks.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/unit/task/${t.id}`}
                      className="flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-[#10331f] px-4 py-3 hover:border-amber-300"
                    >
                      {t.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" aria-label="Completed" />
                      ) : (
                        <Circle className={`w-5 h-5 shrink-0 ${t.status === 'in_progress' ? 'text-amber-300' : 'text-emerald-100/40'}`} aria-label={t.status === 'in_progress' ? 'In progress' : 'Not started'} />
                      )}
                      <span className="flex-1 min-w-0">
                        <span className="block font-bold truncate">Task {t.order_index} · {t.title}</span>
                        <span className="block text-xs text-emerald-100/60">{TYPE_LABEL[t.task_type] ?? t.task_type}{t.status === 'in_progress' ? ' · in progress' : ''}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-amber-300/70 shrink-0" aria-hidden />
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
