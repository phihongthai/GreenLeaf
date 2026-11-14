'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import UnitShell from '@/components/unit/UnitShell';
import { LeafyLoader } from '@/components/unit/ui';
import { useUnitStudent } from '@/lib/useUnitProfile';
import { applyOverrides, fetchClassOverrides, type UnitMissionRow } from '@/lib/unitAccess';

interface MissionView extends UnitMissionRow {
  unlocked: boolean;
  tasks: number;
  done: number;
}

export default function UnitMapPage() {
  const { student, loading: studentLoading } = useUnitStudent();
  const [unitTitle, setUnitTitle] = useState('');
  const [missions, setMissions] = useState<MissionView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    (async () => {
      const supabase = createClient();
      const [{ data: unit }, overrides, { data: progress }] = await Promise.all([
        student.gradeId
          ? supabase
              .from('greenleaf_units')
              .select('id, title, missions:greenleaf_unit_missions(id, order_index, title, book_sections, is_unlocked, acts:greenleaf_acts(tasks:greenleaf_tasks(id)))')
              .eq('grade_id', student.gradeId)
              .order('order_index')
              .limit(1)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        fetchClassOverrides(supabase, student.classId),
        supabase.from('greenleaf_task_progress').select('task_id').eq('student_id', student.id).eq('status', 'completed'),
      ]);
      if (!unit) {
        setLoading(false);
        return;
      }
      setUnitTitle(unit.title);

      const rows = ([...((unit as unknown as { missions: (UnitMissionRow & { acts: { tasks: { id: string }[] }[] })[] }).missions ?? [])])
        .sort((x, y) => x.order_index - y.order_index);
      const unlockMap = applyOverrides(rows, overrides);
      const doneTasks = new Set(((progress ?? []) as { task_id: string }[]).map((p) => p.task_id));

      setMissions(
        rows.map((m) => {
          const taskIds = m.acts.flatMap((a) => a.tasks.map((t) => t.id));
          return {
            ...m,
            unlocked: unlockMap.get(m.id) ?? false,
            tasks: taskIds.length,
            done: taskIds.filter((id) => doneTasks.has(id)).length,
          };
        })
      );
      setLoading(false);
    })();
  }, [student]);

  return (
    <UnitShell profile={student} unitTitle={unitTitle || 'Your Unit'}>
      {studentLoading || loading ? (
        <LeafyLoader label="Loading your map…" />
      ) : missions.length === 0 ? (
        <p className="text-center text-gl-muted-dark py-16">Your teacher has not set up a Unit for your level yet.</p>
      ) : (
        <div className="relative mx-auto w-full max-w-md aspect-square" role="list" aria-label="Missions">
          {/* light orbit */}
          <div className="absolute inset-[11%] rounded-full border border-dashed border-emerald-200" aria-hidden />
          <div className="absolute inset-[24%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9)_0%,transparent_70%)]" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/leafy/hero_wave.webp" alt="Leafy" className="absolute left-1/2 top-1/2 w-[34%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_6px_10px_rgba(46,74,52,0.25)]" />

          {missions.map((m, i) => {
            const angle = (-90 + (360 / missions.length) * i) * (Math.PI / 180);
            const left = 50 + 40 * Math.cos(angle);
            const top = 50 + 40 * Math.sin(angle);
            const complete = m.tasks > 0 && m.done >= m.tasks;
            const body = (
              <>
                <span
                  className={`relative flex items-center justify-center transition-transform group-hover:-translate-y-1 group-active:translate-y-0.5 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full border-2 text-xl font-black shadow-[0_5px_0_rgba(46,74,52,0.35)] ${
                    !m.unlocked
                      ? 'border-gray-200 bg-white text-gl-muted-dark'
                      : complete
                      ? 'border-white bg-gradient-to-b from-[#56b963] to-[#3a7d44] text-white'
                      : 'border-white bg-gradient-to-b from-amber-300 to-amber-400 text-amber-950 ring-4 ring-amber-200/70'
                  }`}
                >
                  {m.unlocked ? m.order_index : <Lock className="w-6 h-6" aria-hidden />}
                </span>
                <span className="mt-1 block max-w-[92px] text-center text-[10px] sm:text-[11px] font-bold leading-tight text-gl-green-dark">
                  {m.title}
                </span>
                {m.unlocked && m.tasks > 0 && (
                  <span className="text-[10px] text-gl-green-dark">{m.done}/{m.tasks} tasks</span>
                )}
              </>
            );
            const style = { left: `${left}%`, top: `${top}%` };
            const cls = 'absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center';
            return m.unlocked ? (
              <Link key={m.id} href={`/unit/mission/${m.id}`} style={style} className={`${cls} group`} role="listitem" aria-label={`Mission ${m.order_index}: ${m.title}`}>
                {body}
              </Link>
            ) : (
              <div key={m.id} style={style} className={cls} role="listitem" aria-label={`Mission ${m.order_index}: ${m.title} (locked)`}>
                {body}
              </div>
            );
          })}
        </div>
      )}
    </UnitShell>
  );
}
