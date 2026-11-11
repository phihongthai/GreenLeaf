import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { itemKeys, loadTask, studentCanAccessTask } from '@/lib/tasks';

// Marks a Task complete once every item has a result — no score threshold — and grants exactly
// 1 Leaf, once (idempotent: a repeat call returns leavesEarned 0).
export async function POST(request: NextRequest) {
  const { user } = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { taskId } = (await request.json()) as { taskId?: string };
  if (!taskId) return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });

  const db = createServiceClient();
  const task = await loadTask(db, taskId);
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  if (!(await studentCanAccessTask(db, user.id, task))) {
    return NextResponse.json({ error: 'Mission is locked' }, { status: 403 });
  }

  const { data: awarded, error } = await db.rpc('greenleaf_complete_task', {
    p_student_id: user.id,
    p_task_id: taskId,
    p_total_items: itemKeys(task).length,
  });
  if (error) {
    console.error('[tasks] complete failed:', error.message);
    return NextResponse.json({ error: 'Could not complete task' }, { status: 500 });
  }

  return NextResponse.json({ leavesEarned: awarded ? 1 : 0 });
}
