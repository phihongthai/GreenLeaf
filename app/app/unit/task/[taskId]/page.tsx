'use client';

import { useEffect, useState, type ComponentType } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import UnitShell from '@/components/unit/UnitShell';
import { useUnitStudent } from '@/lib/useUnitProfile';
import { fetchMissionUnlockMap } from '@/lib/unitAccess';
import PronunciationTask from '@/components/unit/tasks/PronunciationTask';
import UnscrambleTask from '@/components/unit/tasks/UnscrambleTask';
import ReadingChoiceTask from '@/components/unit/tasks/ReadingChoiceTask';
import { postTask, type PreviousResult, type TaskData, type TaskProps } from '@/components/unit/tasks/types';

// New task type = one component here + one entry in lib/tasks.ts (TASK_TYPES).
const RENDERERS: Record<string, ComponentType<TaskProps>> = {
  pronunciation: PronunciationTask,
  unscramble: UnscrambleTask,
  reading_choice: ReadingChoiceTask,
};

export default function UnitTaskPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const { student } = useUnitStudent();
  const [task, setTask] = useState<TaskData | null>(null);
  const [missionId, setMissionId] = useState<string | null>(null);
  const [unitTitle, setUnitTitle] = useState('');
  const [previous, setPrevious] = useState<PreviousResult[]>([]);
  const [unlocked, setUnlocked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [finished, setFinished] = useState<{ leaves: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!student) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('greenleaf_tasks')
        .select('id, task_type, title, instruction, content, act:greenleaf_acts(mission:greenleaf_unit_missions(id, order_index, title, book_sections, is_unlocked, unit:greenleaf_units(title)))')
        .eq('id', taskId)
        .maybeSingle();
      if (!data) {
        setLoading(false);
        return;
      }
      const row = data as unknown as TaskData & {
        act: { mission: { id: string; order_index: number; title: string; book_sections: string | null; is_unlocked: boolean; unit: { title: string } | null } };
      };
      const mission = row.act.mission;
      const unlockMap = await fetchMissionUnlockMap(supabase, student.classId, [mission]);
      setUnlocked(unlockMap.get(mission.id) ?? false);
      setMissionId(mission.id);
      setUnitTitle(mission.unit?.title ?? '');
      setTask({ id: row.id, task_type: row.task_type, title: row.title, instruction: row.instruction, content: row.content });

      const { data: results } = await supabase
        .from('greenleaf_task_results')
        .select('item_key, attempt_no, student_answer, correct_answer, is_correct, score')
        .eq('student_id', student.id)
        .eq('task_id', taskId)
        .order('attempt_no');
      setPrevious(((results ?? []) as PreviousResult[]).map((r) => ({
        ...r,
        // jsonb strings come back as plain strings
        student_answer: r.student_answer as string | null,
        correct_answer: r.correct_answer as string | null,
      })));
      setLoading(false);
    })();
  }, [student, taskId]);

  const finish = async () => {
    setFinishing(true);
    setError(null);
    const res = await postTask<{ leavesEarned?: number }>('/api/tasks/complete', { taskId });
    setFinishing(false);
    if (!res.ok) {
      setError('Could not save your result. Please try again.');
      return;
    }
    setFinished({ leaves: res.data.leavesEarned ?? 0 });
  };

  const Renderer = task ? RENDERERS[task.task_type] : undefined;
  const back = missionId ? `/unit/mission/${missionId}` : '/unit';

  return (
    <UnitShell profile={student} unitTitle={unitTitle} backHref={back}>
      <Link href={back} className="text-xs font-bold text-amber-300 hover:underline">← Back to mission</Link>
      {loading ? (
        <p className="py-16 text-center text-emerald-100/60">Loading…</p>
      ) : !task || !Renderer ? (
        <p className="py-16 text-center text-emerald-100/70">This activity is not available.</p>
      ) : !unlocked ? (
        <p className="py-16 text-center text-emerald-100/70">This mission is locked. Your teacher will open it when your class is ready.</p>
      ) : finished ? (
        <div className="mt-6 rounded-3xl border border-amber-400/40 bg-[#10331f] p-8 text-center space-y-3" role="status">
          <p className="text-5xl" aria-hidden>🍃</p>
          <h1 className="text-2xl font-black text-amber-300">Task complete!</h1>
          <p>{finished.leaves > 0 ? 'You earned 1 Leaf.' : 'You already earned the Leaf for this task.'}</p>
          <Link href={back} className="inline-block rounded-full bg-amber-400 px-6 py-2 font-extrabold text-[#0b2417]">Continue</Link>
        </div>
      ) : (
        <>
          <h1 className="mt-2 text-xl font-black text-amber-300">{task.title}</h1>
          {task.instruction && <p className="mb-4 text-sm text-emerald-100/80">{task.instruction}</p>}
          <Renderer task={task} previous={previous} onAllDone={finish} finishing={finishing} />
          {error && <p role="alert" className="mt-3 text-center text-sm text-red-300">{error}</p>}
        </>
      )}
    </UnitShell>
  );
}
