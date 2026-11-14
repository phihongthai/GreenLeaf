import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { verifyAssessResult } from '@/lib/assessToken';
import { TASK_TYPES, loadTask, studentCanAccessTask } from '@/lib/tasks';

// Stores one scored recording (max 3 per word). The score must carry the signature /api/assess
// issued for this exact word, so a client can't claim a score it never earned.
export async function POST(request: NextRequest) {
  const { user } = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { taskId, itemKey, score, token } = (await request.json()) as {
    taskId?: string; itemKey?: string; score?: number; token?: string;
  };
  if (!taskId || !itemKey || typeof score !== 'number' || typeof token !== 'string') {
    return NextResponse.json({ error: 'Missing or malformed attempt' }, { status: 400 });
  }

  const db = createServiceClient();
  const task = await loadTask(db, taskId);
  if (!task || task.task_type !== 'pronunciation') {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  const items = (task.content.items as { key: string; word: string }[] | undefined) ?? [];
  const item = items.find((i) => i.key === itemKey);
  if (!item) return NextResponse.json({ error: 'Unknown item' }, { status: 400 });
  if (!(await studentCanAccessTask(db, user.id, task))) {
    return NextResponse.json({ error: 'Mission is locked' }, { status: 403 });
  }
  if (!verifyAssessResult(item.word, score, token)) {
    return NextResponse.json({ error: 'Invalid or tampered score' }, { status: 400 });
  }

  const rounded = Math.round(score);
  const { data: attemptNo, error } = await db.rpc('greenleaf_submit_task_item', {
    p_student_id: user.id,
    p_task_id: taskId,
    p_item_key: itemKey,
    p_max_attempts: TASK_TYPES.pronunciation.maxAttempts,
    p_student_answer: null,
    p_correct_answer: item.word,
    p_is_correct: null,
    p_score: rounded,
  });
  if (error) {
    console.error('[tasks] submit pronunciation failed:', error.message);
    return NextResponse.json({ error: 'Could not save attempt' }, { status: 500 });
  }
  if (attemptNo === 0) return NextResponse.json({ error: 'No attempts left for this word' }, { status: 409 });

  return NextResponse.json({ attemptNo, attemptsLeft: TASK_TYPES.pronunciation.maxAttempts - attemptNo });
}
