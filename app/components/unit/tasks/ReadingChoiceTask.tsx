'use client';

import { useMemo, useState } from 'react';
import { postTask, type TaskProps } from './types';

interface Passage { id: string; name: string; text: string }
interface Question { key: string; text: string }
interface Answered { answer: string; correct: string; isCorrect: boolean }

export default function ReadingChoiceTask({ task, previous, onAllDone, finishing }: TaskProps) {
  const passages = useMemo(() => (task.content.passages as Passage[]) ?? [], [task]);
  const questions = useMemo(() => (task.content.questions as Question[]) ?? [], [task]);

  const [answered, setAnswered] = useState<Record<string, Answered>>(() => {
    const a: Record<string, Answered> = {};
    for (const r of previous) {
      a[r.item_key] = { answer: r.student_answer ?? '', correct: r.correct_answer ?? '', isCorrect: Boolean(r.is_correct) };
    }
    return a;
  });
  const [choice, setChoice] = useState<Record<string, string>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allDone = questions.every((q) => answered[q.key]);

  const check = async (q: Question) => {
    const answer = choice[q.key];
    if (!answer) return;
    setBusyKey(q.key);
    setError(null);
    const res = await postTask<{ isCorrect?: boolean; correctAnswer?: string }>('/api/tasks/answer', {
      taskId: task.id, itemKey: q.key, answer,
    });
    setBusyKey(null);
    if (!res.ok) {
      setError(res.status === 409 ? 'You already answered this question.' : 'Could not check your answer. Please try again.');
      return;
    }
    setAnswered((a) => ({ ...a, [q.key]: { answer, correct: res.data.correctAnswer ?? '', isCorrect: Boolean(res.data.isCorrect) } }));
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {passages.map((p) => (
          <article key={p.id} className="rounded-2xl border border-amber-400/30 bg-[#10331f] p-4">
            <h2 className="mb-1 font-black text-amber-300">{p.id} · {p.name}</h2>
            <p className="leading-relaxed">{p.text}</p>
          </article>
        ))}
      </div>

      <ol className="space-y-3">
        {questions.map((q, n) => {
          const done = answered[q.key];
          return (
            <li key={q.key} className="rounded-2xl border border-amber-400/30 bg-[#10331f] p-4 space-y-3">
              <p className="font-bold">{n + 1}. {q.text}</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label={`Answer for question ${n + 1}`}>
                {passages.map((p) => {
                  const selected = (done ? done.answer : choice[q.key]) === p.id;
                  const isCorrectOption = done && done.correct === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={Boolean(done)}
                      aria-pressed={selected}
                      onClick={() => setChoice((c) => ({ ...c, [q.key]: p.id }))}
                      className={`rounded-full border-2 px-4 py-2 text-sm font-extrabold ${
                        isCorrectOption ? 'border-emerald-300 bg-emerald-500/30 text-emerald-100'
                        : done && selected ? 'border-red-300 bg-red-500/25 text-red-100'
                        : selected ? 'border-amber-300 bg-amber-400 text-[#0b2417]'
                        : 'border-amber-400/40 text-amber-200'
                      }`}
                    >
                      {p.id} ({p.name})
                    </button>
                  );
                })}
                {!done && (
                  <button type="button" disabled={!choice[q.key] || busyKey === q.key} onClick={() => check(q)}
                    className="ml-auto rounded-full bg-amber-400 px-5 py-2 text-sm font-extrabold text-[#0b2417] disabled:opacity-40">
                    {busyKey === q.key ? 'Checking…' : 'Check'}
                  </button>
                )}
              </div>
              {done && (
                <p role="status" className={`text-sm font-extrabold ${done.isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
                  {done.isCorrect ? 'Correct!' : <>Not quite. The answer is <span className="text-amber-300">{done.correct}</span></>}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <div className="text-center">
        <button type="button" disabled={!allDone || finishing} onClick={onAllDone}
          className="rounded-full bg-amber-400 px-8 py-2.5 font-extrabold text-[#0b2417] disabled:opacity-40">
          {finishing ? 'Saving…' : 'Finish'}
        </button>
      </div>
    </div>
  );
}
