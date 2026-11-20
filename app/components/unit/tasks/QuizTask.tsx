'use client';

import { useMemo, useState } from 'react';
import { ActionBar, GameButton, buzz } from '../ui';
import { postTask, type TaskProps } from './types';

interface Item { key: string; question: string; choices: string[] }
interface Answered { answer: string; correct: string; isCorrect: boolean }

export default function QuizTask({ task, previous, onAllDone, finishing }: TaskProps) {
  const items = useMemo(() => (task.content.items as Item[]) ?? [], [task]);

  const [answered, setAnswered] = useState<Record<string, Answered>>(() => {
    const a: Record<string, Answered> = {};
    for (const r of previous) {
      a[r.item_key] = { answer: r.student_answer ?? '', correct: r.correct_answer ?? '', isCorrect: Boolean(r.is_correct) };
    }
    return a;
  });
  const [index, setIndex] = useState(() => {
    const firstOpen = items.findIndex((i) => !previous.some((r) => r.item_key === i.key));
    return firstOpen === -1 ? 0 : firstOpen;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const item = items[index];
  const done = answered[item.key];
  const doneCount = items.filter((i) => answered[i.key]).length;
  const allDone = doneCount === items.length;
  const isLast = index === items.length - 1;

  const choose = async (choice: string) => {
    if (busy || done) return;
    setBusy(true);
    setError(null);
    const res = await postTask<{ isCorrect?: boolean; correctAnswer?: string }>('/api/tasks/answer', {
      taskId: task.id, itemKey: item.key, answer: choice,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.status === 409 ? 'You already answered this question.' : 'Could not check your answer. Please try again.');
      return;
    }
    const isCorrect = Boolean(res.data.isCorrect);
    buzz(isCorrect);
    setAnswered((a) => ({ ...a, [item.key]: { answer: choice, correct: res.data.correctAnswer ?? '', isCorrect } }));
  };

  const onPrimary = () => {
    if (isLast) onAllDone();
    else { setIndex(index + 1); setError(null); }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-1.5" aria-hidden>
        {items.map((it, n) => (
          <span key={it.key}
            className={`h-3 w-3 rounded-full transition-all ${
              answered[it.key]?.isCorrect ? 'bg-emerald-400'
              : answered[it.key] ? 'bg-orange-300'
              : n === index ? 'bg-amber-400 scale-125 ring-2 ring-amber-200'
              : 'bg-gray-200'
            }`} />
        ))}
      </div>
      <p className="mb-3 mt-2 text-center text-sm font-bold text-gl-muted-dark">Question {index + 1} of {items.length} · {doneCount} done</p>

      <div key={item.key} className="gl-step-in space-y-4 rounded-[2rem] border-2 border-emerald-200 bg-gradient-to-b from-white to-emerald-50/70 p-5 text-center shadow-[0_8px_0_#cdeac0] sm:p-6">
        <p className="text-lg font-black text-gl-green-dark">{item.question}</p>

        <div className="flex flex-col gap-2.5" role="group" aria-label="Answer choices">
          {item.choices.map((choice) => {
            const selected = done?.answer === choice;
            const isCorrectOption = done && done.correct === choice;
            return (
              <button
                key={choice}
                type="button"
                disabled={Boolean(done) || busy}
                aria-pressed={selected}
                onClick={() => choose(choice)}
                className={`rounded-2xl border-2 px-4 py-3 text-base font-extrabold transition-transform ${
                  isCorrectOption ? 'gl-pop-in border-emerald-500 bg-emerald-300 text-emerald-900 shadow-[0_4px_0_#10b981]'
                  : done && selected ? 'gl-shake border-rose-300 bg-rose-100 text-rose-700 shadow-[0_4px_0_#fda4af]'
                  : done ? 'border-gray-200 bg-gray-50 text-gray-400'
                  : 'border-sky-300 bg-sky-100 text-sky-900 shadow-[0_4px_0_#7dd3fc] hover:-translate-y-0.5 active:translate-y-1'
                }`}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {done && (
          <p role="status" className={`gl-pop-in text-xl font-black ${done.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
            {done.isCorrect
              ? <>🎉 Great job! ⭐</>
              : <>Oops! Good try 💪 The answer is <span className="rounded-lg bg-white px-2 py-0.5 text-gl-green-dark">{done.correct}</span></>}
          </p>
        )}
        {error && <p role="alert" className="text-sm font-bold text-rose-700">{error}</p>}
      </div>

      <ActionBar
        left={<GameButton variant="ghost" className="px-5 py-2" disabled={index === 0} onClick={() => setIndex(index - 1)}>← Back</GameButton>}
        right={
          <GameButton variant={done && isLast ? 'gold' : 'primary'} disabled={done ? (isLast ? !allDone || finishing : false) : true} onClick={onPrimary} className="min-w-[8.5rem]">
            {done ? (isLast ? (finishing ? 'Saving…' : '🏁 Finish') : 'Next →') : 'Pick an answer'}
          </GameButton>
        }
      />
    </div>
  );
}
