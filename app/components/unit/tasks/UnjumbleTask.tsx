'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { dropTile, type DragFrom } from '@/lib/unscramble';
import { ActionBar, GameButton, buzz, revealAboveNav } from '../ui';
import { postTask, type TaskProps } from './types';

interface Item { key: string; words: string[]; hint?: { vi?: string; en?: string } }
interface Answered { answer: string; correct: string; isCorrect: boolean }
interface Drag { from: DragFrom; tile: number; x: number; y: number; gap: number | null }

const TILE_COLORS = [
  'border-orange-300 bg-orange-200 text-orange-900 shadow-[0_4px_0_#fdba74]',
  'border-sky-300 bg-sky-200 text-sky-900 shadow-[0_4px_0_#7dd3fc]',
  'border-pink-300 bg-pink-200 text-pink-900 shadow-[0_4px_0_#f9a8d4]',
  'border-violet-300 bg-violet-200 text-violet-900 shadow-[0_4px_0_#c4b5fd]',
  'border-amber-300 bg-amber-200 text-amber-900 shadow-[0_4px_0_#fcd34d]',
  'border-lime-300 bg-lime-200 text-lime-900 shadow-[0_4px_0_#bef264]',
];

// Same drag mechanics as Unscramble, but tiles hold a whole word (variable width) instead of one letter.
export default function UnjumbleTask({ task, previous, onAllDone, finishing }: TaskProps) {
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
  const [picked, setPicked] = useState<number[]>([]);
  const [lastPlaced, setLastPlaced] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);

  const rowRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const suppressClick = useRef(false);
  const activePointer = useRef<number | null>(null);
  const stopDrag = useRef<(() => void) | null>(null);
  const pickedRef = useRef(picked);
  useEffect(() => { pickedRef.current = picked; }, [picked]);
  useEffect(() => () => stopDrag.current?.(), []);

  const item = items[index];
  const done = answered[item.key];
  const doneCount = items.filter((i) => answered[i.key]).length;
  const allDone = doneCount === items.length;
  const isLast = index === items.length - 1;
  const tray = item.words.map((w, i) => ({ w, i })).filter(({ i }) => !picked.includes(i));
  const complete = picked.length === item.words.length;

  useEffect(() => {
    if (done) primaryRef.current?.focus({ preventScroll: true });
  }, [done]);
  useEffect(() => {
    if (complete || done) revealAboveNav(primaryRef.current);
  }, [complete, done, index]);

  const go = (next: number) => { setIndex(next); setPicked([]); setLastPlaced(null); setError(null); };

  const place = (next: number[], tile: number) => { setPicked(next); setLastPlaced(tile); };

  const submit = async () => {
    setBusy(true);
    setError(null);
    const answer = picked.map((i) => item.words[i]).join(' ');
    const res = await postTask<{ isCorrect?: boolean; correctAnswer?: string; error?: string }>('/api/tasks/answer', {
      taskId: task.id, itemKey: item.key, answer,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.status === 409 ? 'You already answered this sentence.' : 'Could not check your answer. Please try again.');
      return;
    }
    const isCorrect = Boolean(res.data.isCorrect);
    buzz(isCorrect);
    setAnswered((a) => ({ ...a, [item.key]: { answer, correct: res.data.correctAnswer ?? '', isCorrect } }));
  };

  const onPrimary = () => {
    if (!done) return void submit();
    if (isLast) onAllDone();
    else go(index + 1);
  };
  const primaryDisabled = done ? (isLast ? !allDone || finishing : false) : !complete || busy;
  const primaryLabel = done ? (isLast ? (finishing ? 'Saving…' : '🏁 Finish') : 'Next →') : busy ? 'Checking…' : '✓ Check';

  const gapAt = (x: number, y: number): number | null => {
    const row = rowRef.current;
    if (!row) return null;
    const r = row.getBoundingClientRect();
    const m = 28;
    if (x < r.left - m || x > r.right + m || y < r.top - m || y > r.bottom + m) return null;
    let best = 0;
    let bestD = Infinity;
    let after = false;
    slotRefs.current.forEach((el, i) => {
      if (!el) return;
      const b = el.getBoundingClientRect();
      const cx = b.left + b.width / 2;
      const cy = b.top + b.height / 2;
      const d = (x - cx) ** 2 + ((y - cy) * 2) ** 2;
      if (d < bestD) { bestD = d; best = i; after = x > cx; }
    });
    return best + (after ? 1 : 0);
  };

  const startPress = (e: React.PointerEvent, from: DragFrom, tile: number) => {
    if (done || e.button > 0 || activePointer.current !== null) return;
    activePointer.current = e.pointerId;
    const sx = e.clientX;
    const sy = e.clientY;
    let active = false;
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== activePointer.current) return;
      if (!active && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 8) return;
      active = true;
      setDrag({ from, tile, x: ev.clientX, y: ev.clientY, gap: gapAt(ev.clientX, ev.clientY) });
    };
    const cleanup = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      activePointer.current = null;
      stopDrag.current = null;
    };
    function end(ev: PointerEvent) {
      if (ev.pointerId !== activePointer.current) return;
      cleanup();
      if (!active) return;
      suppressClick.current = true;
      setTimeout(() => { suppressClick.current = false; }, 60);
      if (ev.type === 'pointerup') {
        const next = dropTile(pickedRef.current, tile, from, gapAt(ev.clientX, ev.clientY));
        place(next, tile);
      }
      setDrag(null);
    }
    stopDrag.current = cleanup;
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  };

  const shown = done ? done.answer.split(' ') : picked.map((i) => item.words[i]);

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
      <p className="mb-3 mt-2 text-center text-sm font-bold text-gl-muted-dark">Sentence {index + 1} of {items.length} · {doneCount} done</p>

      <div key={item.key} className="gl-step-in space-y-4 rounded-[2rem] border-2 border-emerald-200 bg-gradient-to-b from-white to-emerald-50/70 p-5 text-center shadow-[0_8px_0_#cdeac0] sm:p-6">
        {(item.hint?.vi || item.hint?.en) && (
          <p className="text-base font-bold text-gl-muted-dark">
            <span aria-hidden>💡 </span>
            {item.hint.vi && <span className="font-black text-gl-green-dark">{item.hint.vi}</span>}
            {item.hint.vi && item.hint.en && ' · '}
            {item.hint.en}
          </p>
        )}

        <div key={done ? `r-${done.isCorrect}` : 'r'} ref={rowRef}
          className={`flex flex-wrap justify-center gap-2 ${done && !done.isCorrect ? 'gl-shake' : ''}`} aria-label="Your answer">
          {item.words.map((_, slot) => {
            const word = shown[slot];
            const tileIndex = done ? null : picked[slot];
            const color = tileIndex != null ? TILE_COLORS[tileIndex % TILE_COLORS.length] : null;
            return (
              <button
                key={slot}
                ref={(el) => { slotRefs.current[slot] = el; }}
                type="button"
                disabled={Boolean(done) || word === undefined}
                onPointerDown={(e) => tileIndex != null && startPress(e, { kind: 'slot', slot }, tileIndex)}
                onClick={() => {
                  if (suppressClick.current || tileIndex == null) return;
                  place(picked.filter((p) => p !== tileIndex), tileIndex);
                }}
                aria-label={word ? `Word ${word}, tap to remove` : 'Empty'}
                className={`relative touch-none select-none whitespace-nowrap rounded-2xl border-2 px-3 py-2.5 text-base font-black transition-transform sm:px-4 sm:py-3 sm:text-lg ${
                  drag && tileIndex === drag.tile ? 'opacity-30' : ''} ${
                  tileIndex != null && tileIndex === lastPlaced ? 'gl-drop-in' : ''} ${
                  done
                    ? done.isCorrect
                      ? 'border-emerald-400 bg-emerald-300 text-emerald-900 shadow-[0_4px_0_#34d399]'
                      : 'border-rose-300 bg-rose-100 text-rose-700 shadow-[0_4px_0_#fda4af]'
                    : word && color
                    ? `${color} active:translate-y-1`
                    : 'min-w-[3.5rem] border-dashed border-emerald-300 bg-white/70'
                }`}
              >
                {word ?? ''}
                {drag && drag.gap === slot && <span aria-hidden className="pointer-events-none absolute -left-[7px] top-1 bottom-1 w-1 rounded-full bg-amber-500" />}
                {drag && drag.gap === item.words.length && slot === item.words.length - 1 && (
                  <span aria-hidden className="pointer-events-none absolute -right-[7px] top-1 bottom-1 w-1 rounded-full bg-amber-500" />
                )}
              </button>
            );
          })}
        </div>

        {!done && (
          <>
            <div className="flex min-h-[4.5rem] flex-wrap justify-center gap-2.5 rounded-2xl bg-emerald-100/60 p-3" aria-label="Words">
              {tray.map(({ w, i }) => (
                <button key={i} type="button"
                  onPointerDown={(e) => startPress(e, { kind: 'tray' }, i)}
                  onClick={() => { if (!suppressClick.current) place([...picked, i], i); }}
                  className={`touch-none select-none whitespace-nowrap rounded-2xl border-2 px-3 py-2.5 text-base font-black transition-transform hover:-translate-y-1 active:translate-y-1 sm:px-4 sm:py-3 sm:text-lg ${drag?.tile === i ? 'opacity-30' : ''} ${TILE_COLORS[i % TILE_COLORS.length]}`}>
                  {w}
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-gl-muted-dark">Tap a word, or drag it in between the others.</p>
          </>
        )}

        {done && (
          <p role="status" className={`gl-pop-in text-xl font-black ${done.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
            {done.isCorrect
              ? <>🎉 Great job! ⭐</>
              : <>Oops! Good try 💪 The answer is <span className="rounded-lg bg-white px-2 py-0.5 text-gl-green-dark">{done.correct}</span></>}
          </p>
        )}
        {error && <p role="alert" className="text-sm font-bold text-rose-700">{error}</p>}
      </div>

      {drag && (
        <div aria-hidden className={`pointer-events-none fixed z-50 flex scale-110 items-center justify-center whitespace-nowrap rounded-2xl border-2 px-3 py-2.5 text-base font-black shadow-xl ${TILE_COLORS[drag.tile % TILE_COLORS.length]}`}
          style={{ left: drag.x - 24, top: drag.y - 32 }}>
          {item.words[drag.tile]}
        </div>
      )}

      <ActionBar
        left={<GameButton variant="ghost" className="px-5 py-2" disabled={index === 0} onClick={() => go(index - 1)}>← Back</GameButton>}
        right={
          <GameButton ref={primaryRef} variant={done && isLast ? 'gold' : 'primary'} disabled={primaryDisabled} onClick={onPrimary} className="min-w-[8.5rem]">
            {primaryLabel}
          </GameButton>
        }
      />
    </div>
  );
}
