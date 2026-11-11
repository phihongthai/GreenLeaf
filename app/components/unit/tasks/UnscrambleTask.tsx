'use client';

import { useMemo, useState } from 'react';
import { postTask, type TaskProps } from './types';

interface Item { key: string; letters: string[]; emoji?: string; imageUrl?: string }
interface Answered { answer: string; correct: string; isCorrect: boolean }

export default function UnscrambleTask({ task, previous, onAllDone, finishing }: TaskProps) {
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
  // positions (indices into item.letters) the child has tapped, in order. Each tile is tracked by
  // its index, so repeated letters (e.g. the two "a" in "grandfather") stay independent.
  const [picked, setPicked] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const item = items[index];
  const done = answered[item.key];
  const doneCount = items.filter((i) => answered[i.key]).length;
  const allDone = doneCount === items.length;
  const tray = item.letters.map((l, i) => ({ l, i })).filter(({ i }) => !picked.includes(i));
  const complete = picked.length === item.letters.length;

  const go = (next: number) => { setIndex(next); setPicked([]); setError(null); };

  const submit = async () => {
    setBusy(true);
    setError(null);
    const answer = picked.map((i) => item.letters[i]).join('');
    const res = await postTask<{ isCorrect?: boolean; correctAnswer?: string; error?: string }>('/api/tasks/answer', {
      taskId: task.id, itemKey: item.key, answer,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.status === 409 ? 'You already answered this word.' : 'Could not check your answer. Please try again.');
      return;
    }
    setAnswered((a) => ({ ...a, [item.key]: { answer, correct: res.data.correctAnswer ?? '', isCorrect: Boolean(res.data.isCorrect) } }));
  };

  const shown = done ? done.answer.split('') : picked.map((i) => item.letters[i]);

  return (
    <div className="space-y-5">
      <p className="text-center text-sm text-emerald-100/70">Word {index + 1} of {items.length} · {doneCount} done</p>

      <div className="rounded-3xl border border-amber-400/30 bg-[#10331f] p-6 text-center space-y-5">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" className="mx-auto h-28 object-contain" />
        ) : (
          <div className="text-6xl" aria-hidden>{item.emoji ?? '🍃'}</div>
        )}

        {/* answer slots */}
        <div className="flex flex-wrap justify-center gap-2" aria-label="Your answer">
          {item.letters.map((_, slot) => {
            const letter = shown[slot];
            const tileIndex = done ? null : picked[slot];
            return (
              <button
                key={slot}
                type="button"
                disabled={Boolean(done) || letter === undefined}
                onClick={() => tileIndex != null && setPicked(picked.filter((p) => p !== tileIndex))}
                aria-label={letter ? `Letter ${letter}, tap to remove` : 'Empty'}
                className={`w-11 h-12 sm:w-12 sm:h-14 rounded-xl border-2 text-2xl font-black uppercase ${
                  done
                    ? done.isCorrect ? 'border-emerald-300 bg-emerald-500/30 text-emerald-100' : 'border-red-300 bg-red-500/25 text-red-100'
                    : letter ? 'border-amber-300 bg-amber-400 text-[#0b2417]' : 'border-dashed border-amber-300/40 bg-transparent'
                }`}
              >
                {letter ?? ''}
              </button>
            );
          })}
        </div>

        {/* tray */}
        {!done && (
          <div className="flex flex-wrap justify-center gap-2" aria-label="Letters">
            {tray.map(({ l, i }) => (
              <button key={i} type="button" onClick={() => setPicked([...picked, i])}
                className="w-11 h-12 sm:w-12 sm:h-14 rounded-xl bg-emerald-100 text-2xl font-black uppercase text-[#0b2417] active:scale-95">
                {l}
              </button>
            ))}
          </div>
        )}

        {done ? (
          <p role="status" className={`font-extrabold ${done.isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
            {done.isCorrect ? 'Correct!' : <>Not quite. The answer is <span className="text-amber-300">{done.correct}</span></>}
          </p>
        ) : (
          <button type="button" disabled={!complete || busy} onClick={submit}
            className="rounded-full bg-amber-400 px-8 py-2.5 font-extrabold text-[#0b2417] disabled:opacity-40">
            {busy ? 'Checking…' : 'Check'}
          </button>
        )}
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button type="button" disabled={index === 0} onClick={() => go(index - 1)}
          className="rounded-full border border-amber-400/50 px-5 py-2 font-bold text-amber-300 disabled:opacity-30">Back</button>
        {index < items.length - 1 ? (
          <button type="button" disabled={!done} onClick={() => go(index + 1)}
            className="rounded-full bg-amber-400 px-6 py-2 font-extrabold text-[#0b2417] disabled:opacity-40">Next</button>
        ) : (
          <button type="button" disabled={!allDone || finishing} onClick={onAllDone}
            className="rounded-full bg-amber-400 px-6 py-2 font-extrabold text-[#0b2417] disabled:opacity-40">
            {finishing ? 'Saving…' : 'Finish'}
          </button>
        )}
      </div>
    </div>
  );
}
