'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import UnitShell from '@/components/unit/UnitShell';
import { useUnitStudent } from '@/lib/useUnitProfile';
import { fetchMissionUnlockMap, type UnitMissionRow } from '@/lib/unitAccess';

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
      const { data: unit } = student.gradeId
        ? await supabase
            .from('greenleaf_units')
            .select('id, title')
            .eq('grade_id', student.gradeId)
            .order('order_index')
            .limit(1)
            .maybeSingle()
        : { data: null };
      if (!unit) {
        setLoading(false);
        return;
      }
      setUnitTitle(unit.title);

      const { data: missionRows } = await supabase
        .from('greenleaf_unit_missions')
        .select('id, order_index, title, book_sections, is_unlocked, acts:greenleaf_acts(tasks:greenleaf_tasks(id))')
        .eq('unit_id', unit.id)
        .order('order_index');
      const rows = (missionRows ?? []) as unknown as (UnitMissionRow & { acts: { tasks: { id: string }[] }[] })[];

      const [unlockMap, { data: progress }] = await Promise.all([
        fetchMissionUnlockMap(supabase, student.classId, rows),
        supabase.from('greenleaf_task_progress').select('task_id').eq('student_id', student.id).eq('status', 'completed'),
      ]);
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
        <p className="text-center text-emerald-100/60 py-16">Loading your map…</p>
      ) : missions.length === 0 ? (
        <p className="text-center text-emerald-100/70 py-16">Your teacher has not set up a Unit for your level yet.</p>
      ) : (
        <div className="relative mx-auto w-full max-w-md aspect-square" role="list" aria-label="Missions">
          {/* light orbit */}
          <div className="absolute inset-[11%] rounded-full border border-dashed border-amber-300/40" aria-hidden />
          <div className="absolute inset-[24%] rounded-full bg-[radial-gradient(circle,rgba(250,204,21,0.18)_0%,transparent_70%)]" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/leafy/hero_wave.webp" alt="Leafy" className="absolute left-1/2 top-1/2 w-[34%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_24px_rgba(250,204,21,0.35)]" />

          {missions.map((m, i) => {
            const angle = (-90 + (360 / missions.length) * i) * (Math.PI / 180);
            const left = 50 + 40 * Math.cos(angle);
            const top = 50 + 40 * Math.sin(angle);
            const complete = m.tasks > 0 && m.done >= m.tasks;
            const body = (
              <>
                <span
                  className={`relative flex items-center justify-center w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full border-2 text-xl font-black shadow-lg ${
                    !m.unlocked
                      ? 'border-emerald-100/20 bg-[#10331f] text-emerald-100/40'
                      : complete
                      ? 'border-amber-300 bg-amber-400 text-[#0b2417]'
                      : 'border-amber-300 bg-gradient-to-b from-[#1f6b3f] to-[#0f3d24] text-amber-300'
                  }`}
                >
                  {m.unlocked ? m.order_index : <Lock className="w-6 h-6" aria-hidden />}
                </span>
                <span className="mt-1 block max-w-[92px] text-center text-[10px] sm:text-[11px] font-bold leading-tight text-emerald-50">
                  {m.title}
                </span>
                {m.unlocked && m.tasks > 0 && (
                  <span className="text-[10px] text-amber-300/90">{m.done}/{m.tasks} tasks</span>
                )}
              </>
            );
            const style = { left: `${left}%`, top: `${top}%` };
            const cls = 'absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center';
            return m.unlocked ? (
              <Link key={m.id} href={`/unit/mission/${m.id}`} style={style} className={`${cls} hover:scale-105 transition-transform`} role="listitem" aria-label={`Mission ${m.order_index}: ${m.title}`}>
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
