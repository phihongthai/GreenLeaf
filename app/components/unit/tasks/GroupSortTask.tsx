'use client';

import { useMemo, useState } from 'react';
import { ActionBar, GameButton, buzz } from '../ui';
import { postTask, type TaskProps } from './types';

interface Group { id: string; name: string }
interface Item { key: string; text: string; groupId: string }
interface Answered { answer: string; correct: string; isCorrect: boolean }

export default function GroupSortTask({ task, previous, onAllDone, finishing }: TaskProps) {
  const items = useMemo(() => (task.content.items as Item[]) ?? [], [task]);
  const groups = useMemo(() => (task.content.groups as Group[]) ?? [], [task]);
  const groupName = useMemo(() => new Map(groups.map((g) => [g.id, g.name])), [groups]);

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

  const allDone = items.every((i) => answered[i.key]);
  const doneCount = items.filter((i) => answered[i.key]).length;

  const check = async (item: Item, groupId: string) => {
    if (busyKey || answered[item.key]) return;
    setChoice((c) => ({ ...c, [item.key]: groupId }));
    setBusyKey(item.key);
    setError(null);
    const res = await postTask<{ isCorrect?: boolean; correctAnswer?: string }>('/api/tasks/answer', {
      taskId: task.id, itemKey: item.key, answer: groupId,
    });
    setBusyKey(null);
    if (!res.ok) {
      setError(res.status === 409 ? 'You already sorted this one.' : 'Could not check your answer. Please try again.');
      return;
    }
    const isCorrect = Boolean(res.data.isCorrect);
    buzz(isCorrect);
    setAnswered((a) => ({ ...a, [item.key]: { answer: groupId, correct: res.data.correctAnswer ?? '', isCorrect } }));
  };

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-1.5" aria-hidden>
        {items.map((it) => (
          <span key={it.key}
            className={`h-3 w-3 rounded-full transition-all ${
              answered[it.key]?.isCorrect ? 'bg-emerald-400' : answered[it.key] ? 'bg-orange-300' : choice[it.key] ? 'bg-amber-400' : 'bg-gray-200'
            }`} />
        ))}
      </div>
      <p className="mb-3 mt-2 text-center text-sm font-bold text-gl-muted-dark">{doneCount} of {items.length} sorted</p>

      <ol className="space-y-3">
        {items.map((item, n) => {
          const done = answered[item.key];
          return (
            <li key={item.key} className={`space-y-3 rounded-3xl border-2 bg-white p-4 ${done ? (done.isCorrect ? 'border-emerald-300' : 'border-rose-200') : 'border-emerald-200'}`}>
              <p className="font-bold">{n + 1}. {item.text}</p>
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Group for ${item.text}`}>
                {groups.map((g) => {
                  const selected = (done ? done.answer : choice[item.key]) === g.id;
                  const isCorrectOption = done && done.correct === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      disabled={Boolean(done) || busyKey === item.key}
                      aria-pressed={selected}
                      onClick={() => check(item, g.id)}
                      className={`rounded-full border-2 px-4 py-2 text-sm font-extrabold transition-transform ${
                        isCorrectOption ? 'gl-pop-in border-emerald-500 bg-emerald-300 text-emerald-900 shadow-[0_4px_0_#10b981]'
                        : done && selected ? 'gl-shake border-rose-300 bg-rose-100 text-rose-700 shadow-[0_4px_0_#fda4af]'
                        : done ? 'border-gray-200 bg-gray-50 text-gray-400'
                        : selected ? `border-amber-500 bg-amber-400 text-white -translate-y-0.5 ${busyKey === item.key ? 'animate-pulse' : ''}`
                        : 'border-amber-300 bg-amber-100 text-amber-900 shadow-[0_4px_0_#fcd34d] hover:-translate-y-0.5 active:translate-y-1'
                      }`}
                    >
                      {g.name}
                    </button>
                  );
                })}
              </div>
              {done && (
                <p role="status" className={`gl-pop-in text-base font-black ${done.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {done.isCorrect ? <>🎉 Great job! ⭐</> : <>Oops! Good try 💪 It belongs in <span className="rounded-lg bg-white px-2 py-0.5 text-gl-green-dark">{groupName.get(done.correct) ?? done.correct}</span></>}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {error && <p role="alert" className="mt-3 text-center text-sm font-bold text-rose-700">{error}</p>}
      <ActionBar
        left={<span className="px-3 text-sm font-bold text-gl-muted-dark">{doneCount}/{items.length}</span>}
        right={
          <GameButton variant="gold" disabled={!allDone || finishing} onClick={onAllDone} className="min-w-[8.5rem]">
            {finishing ? 'Saving…' : '🏁 Finish'}
          </GameButton>
        }
      />
    </div>
  );
}
