export interface TaskData {
  id: string;
  task_type: string;
  title: string;
  instruction: string | null;
  content: Record<string, unknown>;
}

export interface PreviousResult {
  item_key: string;
  attempt_no: number;
  student_answer: string | null;
  correct_answer: string | null;
  is_correct: boolean | null;
  score: number | null;
}

export interface TaskProps {
  task: TaskData;
  previous: PreviousResult[];
  /** Called once every item has a result; the page then completes the Task on the server. */
  onAllDone: () => void;
  finishing: boolean;
}

export async function postTask<T>(path: string, body: unknown): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  let data = {} as T;
  try { data = (await res.json()) as T; } catch { /* empty body */ }
  return { ok: res.ok, status: res.status, data };
}
