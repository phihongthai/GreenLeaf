'use client';

import { useEffect, useMemo, useState } from 'react';
import { Volume2 } from 'lucide-react';
import Recorder from '@/components/Recorder';
import { audioToWav } from '@/lib/audio';
import { assessPronunciation } from '@/lib/azure';
import { playTTS, stopTTS } from '@/lib/tts';
import { postTask, type TaskProps } from './types';

interface Item { key: string; word: string; emoji?: string; imageUrl?: string }

function ScoreRing({ score }: { score: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-28 h-28" role="img" aria-label={`Pronunciation ${score} percent`}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="9" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#fbbf24" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-amber-300">{score}%</span>
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

  return (
    <div className="space-y-5">
      <p className="text-center text-sm text-emerald-100/70">Word {index + 1} of {items.length} · {handled} done</p>

      <div className="rounded-3xl border border-amber-400/30 bg-[#10331f] p-6 text-center space-y-4">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" className="mx-auto h-32 object-contain" />
        ) : (
          <div className="text-7xl" aria-hidden>{item.emoji ?? '🍃'}</div>
        )}
        <h2 className="text-4xl font-black text-amber-300">{item.word}</h2>
        <button type="button" onClick={listen} className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 font-extrabold text-[#0b2417] active:scale-95">
          <Volume2 className="w-5 h-5" aria-hidden /> Listen
        </button>

        <div className="flex justify-center min-h-[7rem]">
          {stat?.score != null && <ScoreRing score={stat.score} />}
        </div>

        {used < maxAttempts ? (
          <div className="flex flex-col items-center gap-2">
            <Recorder onRecordingComplete={onRecording} disabled={busy} maxSeconds={10} />
            <p className="text-xs text-emerald-100/60">{busy ? 'Checking…' : `Try ${Math.min(used + 1, maxAttempts)} of ${maxAttempts}`}</p>
          </div>
        ) : (
          <p className="text-sm font-bold text-amber-300">You used all {maxAttempts} tries for this word.</p>
        )}
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button type="button" disabled={index === 0} onClick={() => setIndex(index - 1)}
          className="rounded-full border border-amber-400/50 px-5 py-2 font-bold text-amber-300 disabled:opacity-30">Back</button>
        {index < items.length - 1 ? (
          <button type="button" disabled={used === 0} onClick={() => setIndex(index + 1)}
            className="rounded-full bg-amber-400 px-6 py-2 font-extrabold text-[#0b2417] disabled:opacity-40">Next</button>
        ) : (
          <button type="button" disabled={!allHandled || finishing} onClick={onAllDone}
            className="rounded-full bg-amber-400 px-6 py-2 font-extrabold text-[#0b2417] disabled:opacity-40">
            {finishing ? 'Saving…' : 'Finish'}
          </button>
        )}
      </div>
    </div>
  );
}
