import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { TASK_TYPES, isTaskType, itemKeys, loadTask, studentCanAccessTask } from '@/lib/tasks';

// Grades one Unscramble / Reading item on the server. The correct answer is read from
// greenleaf_task_answers (teacher-only RLS) and only returned after the student has answered.
export async function POST(request: NextRequest) {
  const { user } = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { taskId, itemKey, answer } = (await request.json()) as { taskId?: string; itemKey?: string; answer?: unknown };
  if (!taskId || !itemKey || typeof answer !== 'string' || answer.length === 0 || answer.length > 100) {
    return NextResponse.json({ error: 'Missing or malformed answer' }, { status: 400 });
  }

  const db = createServiceClient();
  // The answer key does not depend on the access check, so fetch both together.
  const [task, { data: key }] = await Promise.all([
    loadTask(db, taskId),
    db.from('greenleaf_task_answers').select('answer').eq('task_id', taskId).eq('item_key', itemKey).maybeSingle(),
  ]);
  if (!task || !isTaskType(task.task_type) || task.task_type === 'pronunciation') {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  if (!itemKeys(task).includes(itemKey)) {
    return NextResponse.json({ error: 'Unknown item' }, { status: 400 });
  }
  if (!(await studentCanAccessTask(db, user.id, task))) {
    return NextResponse.json({ error: 'Mission is locked' }, { status: 403 });
  }

  if (!key) return NextResponse.json({ error: 'No answer key for this item' }, { status: 500 });

  const correct = String(key.answer);
  const isCorrect = answer.trim().toLowerCase() === correct.toLowerCase();

  const { data: attemptNo, error } = await db.rpc('greenleaf_submit_task_item', {
    p_student_id: user.id,
    p_task_id: taskId,
    p_item_key: itemKey,
    p_max_attempts: TASK_TYPES[task.task_type].maxAttempts,
    p_student_answer: answer,
    p_correct_answer: correct,
    p_is_correct: isCorrect,
    p_score: isCorrect ? 100 : 0,
  });
  if (error) {
    console.error('[tasks] submit item failed:', error.message);
    return NextResponse.json({ error: 'Could not save answer' }, { status: 500 });
  }
  if (attemptNo === 0) {
    return NextResponse.json({ error: 'Already answered' }, { status: 409 });
  }

  return NextResponse.json({ isCorrect, correctAnswer: correct });
}
