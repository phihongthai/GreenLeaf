'use client';

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ActionBar, GameButton, buzz } from '../ui';
import { postTask, type TaskProps } from './types';

interface Passage { id: string; name: string; text: string }
interface Question { key: string; text: string }
// Each character gets a colour that is used on its passage card and on its answer button, so matching is easy.
const PASSAGE_STYLE = [
  { card: 'border-sky-200 bg-sky-50', badge: 'bg-sky-300 text-sky-900', btn: 'border-sky-300 bg-sky-100 text-sky-900 shadow-[0_4px_0_#7dd3fc]', on: 'border-sky-500 bg-sky-400 text-white shadow-[0_4px_0_#0369a1]' },
  { card: 'border-pink-200 bg-pink-50', badge: 'bg-pink-300 text-pink-900', btn: 'border-pink-300 bg-pink-100 text-pink-900 shadow-[0_4px_0_#f9a8d4]', on: 'border-pink-500 bg-pink-400 text-white shadow-[0_4px_0_#be185d]' },
  { card: 'border-amber-200 bg-amber-50', badge: 'bg-amber-300 text-amber-900', btn: 'border-amber-300 bg-amber-100 text-amber-900 shadow-[0_4px_0_#fcd34d]', on: 'border-amber-500 bg-amber-400 text-white shadow-[0_4px_0_#b45309]' },
];

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
    const isCorrect = Boolean(res.data.isCorrect);
    buzz(isCorrect);
    setAnswered((a) => ({ ...a, [q.key]: { answer, correct: res.data.correctAnswer ?? '', isCorrect } }));
  };

  const doneCount = questions.filter((q) => answered[q.key]).length;

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-1.5" aria-hidden>
        {questions.map((q) => (
          <span key={q.key}
            className={`h-3 w-3 rounded-full transition-all ${
              answered[q.key]?.isCorrect ? 'bg-emerald-400' : answered[q.key] ? 'bg-orange-300' : choice[q.key] ? 'bg-amber-400' : 'bg-gray-200'
            }`} />
        ))}
      </div>
      <p className="mb-3 mt-2 text-center text-sm font-bold text-gl-muted-dark">{doneCount} of {questions.length} answered</p>

      {/* stories: tap a title to fold it away and focus on the questions */}
      <div className="space-y-3">
        {passages.map((p, n) => {
          const st = PASSAGE_STYLE[n % PASSAGE_STYLE.length];
          return (
            <details key={p.id} open className={`group rounded-3xl border-2 p-4 shadow-sm ${st.card}`}>
              <summary className="flex cursor-pointer list-none items-center gap-3 font-black text-gl-green-dark [&::-webkit-details-marker]:hidden">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${st.badge}`}>{p.id}</span>
                <span className="flex-1">{p.name}</span>
                <ChevronDown aria-hidden className="h-5 w-5 text-gl-muted-dark transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 leading-relaxed text-gray-800">{p.text}</p>
            </details>
          );
        })}
      </div>

      <ol className="mt-4 space-y-3">
        {questions.map((q, n) => {
          const done = answered[q.key];
          return (
            <li key={q.key} className={`space-y-3 rounded-3xl border-2 bg-white p-4 ${done ? (done.isCorrect ? 'border-emerald-300' : 'border-rose-200') : 'border-emerald-200'}`}>
              <p className="font-bold">{n + 1}. {q.text}</p>
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Answer for question ${n + 1}`}>
                {passages.map((p, pi) => {
                  const st = PASSAGE_STYLE[pi % PASSAGE_STYLE.length];
                  const selected = (done ? done.answer : choice[q.key]) === p.id;
                  const isCorrectOption = done && done.correct === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={Boolean(done)}
                      aria-pressed={selected}
                      onClick={() => setChoice((c) => ({ ...c, [q.key]: p.id }))}
                      className={`rounded-full border-2 px-4 py-2 text-sm font-extrabold transition-transform ${
                        isCorrectOption ? 'gl-pop-in border-emerald-500 bg-emerald-300 text-emerald-900 shadow-[0_4px_0_#10b981]'
                        : done && selected ? 'gl-shake border-rose-300 bg-rose-100 text-rose-700 shadow-[0_4px_0_#fda4af]'
                        : done ? 'border-gray-200 bg-gray-50 text-gray-400'
                        : selected ? `${st.on} -translate-y-0.5`
                        : `${st.btn} hover:-translate-y-0.5 active:translate-y-1`
                      }`}
                    >
                      {p.id} · {p.name}
                    </button>
                  );
                })}
                {!done && (
                  <GameButton disabled={!choice[q.key] || busyKey === q.key} onClick={() => check(q)} className="ml-auto px-5 py-2 text-sm">
                    {busyKey === q.key ? 'Checking…' : '✓ Check'}
                  </GameButton>
                )}
              </div>
              {done && (
                <p role="status" className={`gl-pop-in text-base font-black ${done.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {done.isCorrect ? <>🎉 Great job! ⭐</> : <>Oops! Good try 💪 The answer is <span className="rounded-lg bg-white px-2 py-0.5 text-gl-green-dark">{done.correct}</span></>}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {error && <p role="alert" className="mt-3 text-center text-sm font-bold text-rose-700">{error}</p>}
      <ActionBar
        left={<span className="px-3 text-sm font-bold text-gl-muted-dark">{doneCount}/{questions.length}</span>}
        right={
          <GameButton variant="gold" disabled={!allDone || finishing} onClick={onAllDone} className="min-w-[8.5rem]">
            {finishing ? 'Saving…' : '🏁 Finish'}
          </GameButton>
        }
      />
    </div>
  );
}
