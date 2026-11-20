'use client';

import { useEffect, useState, type ComponentType } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import UnitShell from '@/components/unit/UnitShell';
import { Confetti, GameButton, LeafyLoader } from '@/components/unit/ui';
import { getUnitStudent, useUnitStudent } from '@/lib/useUnitProfile';
import { applyOverrides, fetchClassOverrides } from '@/lib/unitAccess';
import PronunciationTask from '@/components/unit/tasks/PronunciationTask';
import UnscrambleTask from '@/components/unit/tasks/UnscrambleTask';
import ReadingChoiceTask from '@/components/unit/tasks/ReadingChoiceTask';
import QuizTask from '@/components/unit/tasks/QuizTask';
import UnjumbleTask from '@/components/unit/tasks/UnjumbleTask';
import MatchUpTask from '@/components/unit/tasks/MatchUpTask';
import GroupSortTask from '@/components/unit/tasks/GroupSortTask';
import { postTask, type PreviousResult, type TaskData, type TaskProps } from '@/components/unit/tasks/types';

// New task type = one component here + one entry in lib/tasks.ts (TASK_TYPES).
const RENDERERS: Record<string, ComponentType<TaskProps>> = {
  pronunciation: PronunciationTask,
  unscramble: UnscrambleTask,
  reading_choice: ReadingChoiceTask,
  quiz: QuizTask,
  unjumble: UnjumbleTask,
  match_up: MatchUpTask,
  group_sort: GroupSortTask,
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
    (async () => {
      const supabase = createClient();
      const [stu, { data }] = await Promise.all([getUnitStudent(), supabase
        .from('greenleaf_tasks')
        .select('id, task_type, title, instruction, content, act:greenleaf_acts(mission:greenleaf_unit_missions(id, order_index, title, book_sections, is_unlocked, unit:greenleaf_units(title)))')
        .eq('id', taskId)
        .maybeSingle()]);
      if (!stu) return;
      if (!data) {
        setLoading(false);
        return;
      }
      const row = data as unknown as TaskData & {
        act: { mission: { id: string; order_index: number; title: string; book_sections: string | null; is_unlocked: boolean; unit: { title: string } | null } };
      };
      const mission = row.act.mission;
      const [overrides, { data: results }] = await Promise.all([
        fetchClassOverrides(supabase, stu.classId),
        supabase
          .from('greenleaf_task_results')
          .select('item_key, attempt_no, student_answer, correct_answer, is_correct, score')
          .eq('student_id', stu.id)
          .eq('task_id', taskId)
          .order('attempt_no'),
      ]);
      const unlockMap = applyOverrides([mission], overrides);
      setUnlocked(unlockMap.get(mission.id) ?? false);
      setMissionId(mission.id);
      setUnitTitle(mission.unit?.title ?? '');
      setTask({ id: row.id, task_type: row.task_type, title: row.title, instruction: row.instruction, content: row.content });

      setPrevious(((results ?? []) as PreviousResult[]).map((r) => ({
        ...r,
        // jsonb strings come back as plain strings
        student_answer: r.student_answer as string | null,
        correct_answer: r.correct_answer as string | null,
      })));
      setLoading(false);
    })();
  }, [taskId]);

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
    <UnitShell profile={student} unitTitle={unitTitle}>
      <Link href={back} className="text-xs font-bold text-gl-green-dark hover:underline">← Back to mission</Link>
      {loading ? (
        <LeafyLoader label="Getting your activity ready…" />
      ) : !task || !Renderer ? (
        <p className="py-16 text-center text-gl-muted-dark">This activity is not available.</p>
      ) : !unlocked ? (
        <p className="py-16 text-center text-gl-muted-dark">This mission is locked. Your teacher will open it when your class is ready.</p>
      ) : finished ? (
        <div className="gl-pop-in mt-6 space-y-4 rounded-[2rem] border-2 border-emerald-200 bg-gradient-to-b from-white to-emerald-50 p-8 text-center shadow-[0_8px_0_#cdeac0]" role="status">
          <Confetti />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/leafy/hero_wave.webp" alt="" className="gl-float mx-auto h-32 w-32 object-contain" />
          <h1 className="gl-display text-3xl font-black text-gl-green-dark">Task complete! 🎉</h1>
          {finished.leaves > 0 ? (
            <p className="gl-coin-ting inline-flex items-center gap-2 rounded-full bg-amber-100 px-5 py-2 text-lg font-black text-amber-800">
              <span aria-hidden>🍃</span> +1 Leaf
            </p>
          ) : (
            <p className="font-bold text-gl-muted-dark-dark">You already earned the Leaf for this task.</p>
          )}
          <div>
            <Link href={back}>
              <GameButton className="mt-2 px-8">Continue →</GameButton>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <h1 className="gl-display mt-2 text-2xl font-black text-gl-green-dark">{task.title}</h1>
          {task.instruction && <p className="mb-4 text-sm text-gl-muted-dark">{task.instruction}</p>}
          <Renderer task={task} previous={previous} onAllDone={finish} finishing={finishing} />
          {error && <p role="alert" className="mt-3 text-center text-sm text-rose-700">{error}</p>}
        </>
      )}
    </UnitShell>
  );
}
