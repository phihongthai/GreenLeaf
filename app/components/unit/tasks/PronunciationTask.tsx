'use client';

import { useEffect, useMemo, useState } from 'react';
import { Volume2 } from 'lucide-react';
import Recorder from '@/components/Recorder';
import { audioToWav } from '@/lib/audio';
import { assessPronunciation } from '@/lib/azure';
import { playTTS, stopTTS } from '@/lib/tts';
import { ActionBar, GameButton } from '../ui';
import { postTask, type TaskProps } from './types';

interface Item { key: string; word: string; emoji?: string; imageUrl?: string }

function ScoreRing({ score }: { score: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  // fills from empty on first paint so the ring "grows" to the score
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(score));
    return () => cancelAnimationFrame(t);
  }, [score]);
  return (
    <div className="gl-pop-in relative h-28 w-28" role="img" aria-label={`Pronunciation ${score} percent`}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e1efe3" strokeWidth="9" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="url(#gl-ring)" strokeWidth="9" strokeLinecap="round"
          className="gl-ring" strokeDasharray={c} strokeDashoffset={c * (1 - shown / 100)} />
        <defs>
          <linearGradient id="gl-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-gl-green-dark">{score}%</span>
    </div>
  );
}

export default function PronunciationTask({ task, previous, onAllDone, finishing }: TaskProps) {
  const items = useMemo(() => (task.content.items as Item[]) ?? [], [task]);
  const maxAttempts = Number(task.content.maxAttempts ?? 3);

  // item key -> { attempts used, latest score }
  const [stats, setStats] = useState<Record<string, { attempts: number; score: number | null }>>(() => {
    const s: Record<string, { attempts: number; score: number | null }> = {};
    for (const r of previous) {
      const cur = s[r.item_key];
      if (!cur || r.attempt_no > cur.attempts) s[r.item_key] = { attempts: r.attempt_no, score: r.score };
    }
    return s;
  });
  const [index, setIndex] = useState(() => {
    const firstOpen = items.findIndex((i) => !previous.some((r) => r.item_key === i.key));
    return firstOpen === -1 ? 0 : firstOpen;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const item = items[index];
  const stat = stats[item.key];
  const used = stat?.attempts ?? 0;
  const handled = items.filter((i) => (stats[i.key]?.attempts ?? 0) > 0).length;
  const allHandled = handled === items.length;

  useEffect(() => () => stopTTS(), []);

  const listen = () => {
    setError(null);
    playTTS(item.word).catch(() => setError('Could not play the sound.'));
  };

  const onRecording = async (blob: Blob) => {
    stopTTS();
    setBusy(true);
    setError(null);
    try {
      const wav = await audioToWav(blob);
      const result = await assessPronunciation(wav, item.word);
      const score = Math.round(result.overallScore);
      const saved = await postTask<{ attemptNo?: number; error?: string }>('/api/tasks/pronunciation', {
        taskId: task.id, itemKey: item.key, score: result.overallScore, token: result.token,
      });
      if (!saved.ok) throw new Error(saved.data.error ?? 'save failed');
      setStats((s) => ({ ...s, [item.key]: { attempts: saved.data.attemptNo ?? used + 1, score } }));
    } catch (e) {
      console.error(e);
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const next = () => setIndex(index + 1);
  const isLast = index === items.length - 1;

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-1.5" aria-hidden>
        {items.map((it, n) => (
          <span key={it.key}
            className={`h-3 w-3 rounded-full transition-all ${
              (stats[it.key]?.attempts ?? 0) > 0 ? 'bg-emerald-400'
              : n === index ? 'bg-amber-400 scale-125 ring-2 ring-amber-200'
              : 'bg-gray-200'
            }`} />
        ))}
      </div>
      <p className="mb-3 mt-2 text-center text-sm font-bold text-gl-muted-dark">Word {index + 1} of {items.length} · {handled} done</p>

      <div key={item.key} className="gl-step-in space-y-4 rounded-[2rem] border-2 border-emerald-200 bg-gradient-to-b from-white to-emerald-50/70 p-5 text-center shadow-[0_8px_0_#cdeac0] sm:p-6">
        <div className="gl-float mx-auto flex h-32 w-32 [@media(max-height:700px)]:h-24 [@media(max-height:700px)]:w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 shadow-inner">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt="" className="h-24 object-contain" />
          ) : (
            <span className="text-7xl" aria-hidden>{item.emoji ?? '🍃'}</span>
          )}
        </div>
        <h2 className="gl-display text-5xl font-black text-gl-green-dark">{item.word}</h2>
        <GameButton variant="gold" onClick={listen} className="inline-flex items-center gap-2 px-6">
          <Volume2 className="h-5 w-5" aria-hidden /> Listen
        </GameButton>

        <div className="flex min-h-[7rem] justify-center">
          {stat?.score != null && <ScoreRing key={`${item.key}-${used}`} score={stat.score} />}
        </div>

        {used < maxAttempts ? (
          <div className="flex flex-col items-center gap-2">
            <Recorder onRecordingComplete={onRecording} disabled={busy} maxSeconds={10} />
            <div className="flex items-center gap-1.5" role="img" aria-label={busy ? 'Checking' : `Try ${Math.min(used + 1, maxAttempts)} of ${maxAttempts}`}>
              {Array.from({ length: maxAttempts }, (_, n) => (
                <span key={n} className={`h-3 w-3 rounded-full ${n < used ? 'bg-emerald-400' : n === used ? 'bg-amber-400 ring-2 ring-amber-200' : 'bg-gray-200'}`} />
              ))}
              <span className="ml-1 text-xs font-bold text-gl-muted-dark">{busy ? 'Checking…' : `Try ${Math.min(used + 1, maxAttempts)} of ${maxAttempts}`}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm font-bold text-gl-green-dark">You used all {maxAttempts} tries for this word.</p>
        )}
        {error && <p role="alert" className="text-sm font-bold text-rose-700">{error}</p>}
      </div>

      <ActionBar
        left={<GameButton variant="ghost" className="px-5 py-2" disabled={index === 0} onClick={() => setIndex(index - 1)}>← Back</GameButton>}
        right={
          isLast ? (
            <GameButton variant="gold" disabled={!allHandled || finishing} onClick={onAllDone} className="min-w-[8.5rem]">
              {finishing ? 'Saving…' : '🏁 Finish'}
            </GameButton>
          ) : (
            <GameButton disabled={used === 0} onClick={next} className="min-w-[8.5rem]">Next →</GameButton>
          )
        }
      />
    </div>
  );
}
