import type { SupabaseClient } from '@supabase/supabase-js';

export type TaskType = 'pronunciation' | 'unscramble' | 'reading_choice';

export interface TaskRow {
  id: string;
  task_type: string;
  title: string;
  instruction: string | null;
  content: Record<string, unknown>;
  act_id: string;
}

// Each task type: where its items live in `content`, and how many answers an item allows.
// A new task type = one entry here + a component + (optionally) rows in greenleaf_task_answers.
export const TASK_TYPES: Record<TaskType, { itemsKey: string; maxAttempts: number }> = {
  pronunciation: { itemsKey: 'items', maxAttempts: 3 },
  unscramble: { itemsKey: 'items', maxAttempts: 1 },
  reading_choice: { itemsKey: 'questions', maxAttempts: 1 },
};

export function isTaskType(value: string): value is TaskType {
  return value in TASK_TYPES;
}

export function itemKeys(task: TaskRow): string[] {
  if (!isTaskType(task.task_type)) return [];
  const items = task.content[TASK_TYPES[task.task_type].itemsKey];
  return Array.isArray(items) ? items.map((i) => String((i as { key: string }).key)) : [];
}

export async function loadTask(db: SupabaseClient, taskId: string): Promise<TaskRow | null> {
  const { data } = await db
    .from('greenleaf_tasks')
    .select('id, task_type, title, instruction, content, act_id')
    .eq('id', taskId)
    .maybeSingle();
  return (data as TaskRow | null) ?? null;
}

/**
 * A student can work on a Task only when its Mission is open for their class: a row in
 * greenleaf_class_mission_access wins, otherwise the Mission's own default (is_unlocked).
 */
export async function studentCanAccessTask(db: SupabaseClient, studentId: string, task: TaskRow): Promise<boolean> {
  const { data: act } = await db.from('greenleaf_acts').select('mission_id').eq('id', task.act_id).maybeSingle();
  if (!act) return false;

  const [{ data: mission }, { data: profile }] = await Promise.all([
    db.from('greenleaf_unit_missions').select('is_unlocked').eq('id', act.mission_id).maybeSingle(),
    db.from('greenleaf_profiles').select('role, class_id').eq('id', studentId).maybeSingle(),
  ]);
  if (!mission || !profile || profile.role !== 'student') return false;

  if (profile.class_id) {
    const { data: override } = await db
      .from('greenleaf_class_mission_access')
      .select('unlocked')
      .eq('class_id', profile.class_id)
      .eq('mission_id', act.mission_id)
      .maybeSingle();
    if (override) return Boolean(override.unlocked);
  }
  return Boolean(mission.is_unlocked);
}
