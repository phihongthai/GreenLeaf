'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MYSTERY_BOX_COST } from '@/lib/mysteryBox';
import ErrorText from '@/components/ErrorText';

/**
 * Locked below 100 Leaves ("🔒 Unlock at 100 Leaves"), unlocked with a Request button at 100+.
 * One pending request at a time (enforced by a DB unique index); the admin confirms at the
 * center, which deducts the Leaves. A student with 200 Leaves redeems one box, then requests again.
 */
export default function MysteryBox({ userId, leafCount }: { userId: string | null; leafCount: number }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPending = useCallback(async () => {
    if (!userId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('greenleaf_mystery_box_requests')
      .select('id')
      .eq('student_id', userId)
      .eq('status', 'pending')
      .maybeSingle();
    setPendingId(data?.id ?? null);
  }, [userId]);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const call = async (url: string, body?: object) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body ?? {}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      await loadPending();
      setBusy(false);
    }
  };

  const unlocked = leafCount >= MYSTERY_BOX_COST;
  const progress = Math.min(100, Math.round((leafCount / MYSTERY_BOX_COST) * 100));

  return (
    <div className="rounded-3xl bg-white p-4 shadow-md">
      <div className="flex items-center gap-4">
        <div
          className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-4xl ${
            unlocked ? 'bg-gradient-to-br from-amber-200 to-orange-300 gl-float' : 'bg-gray-100 grayscale'
          }`}
          aria-hidden
        >
          🎁
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="gl-display text-lg font-extrabold leading-tight text-gl-green">Mystery Box</p>

          {!unlocked && (
            <>
              <p className="text-sm font-bold text-gl-muted">🔒 Unlock at {MYSTERY_BOX_COST} Leaves</p>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100" aria-hidden>
                <div className="h-full rounded-full bg-gradient-to-r from-lime-300 to-green-500" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs font-bold text-gray-400">{leafCount} / {MYSTERY_BOX_COST} Leaves</p>
            </>
          )}

          {unlocked && !pendingId && (
            <>
              <p className="text-sm font-bold text-gl-green-dark">🔓 Unlocked! Ready to open at the center.</p>
              <button
                onClick={() => call('/api/mystery-box/request')}
                disabled={busy}
                className="rounded-xl bg-gradient-to-r from-[#4F9E58] to-[#2E4A34] px-4 py-2 text-sm font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {busy ? 'Sending...' : 'Request Mystery Box'}
              </button>
            </>
          )}

          {unlocked && pendingId && (
            <>
              <p className="text-sm font-bold text-amber-600">⏳ Request sent! Visit the center to open your box.</p>
              <button
                onClick={() => call('/api/mystery-box/cancel', { requestId: pendingId })}
                disabled={busy}
                className="text-xs font-bold text-gray-400 underline hover:text-red-500 disabled:opacity-60"
              >
                Cancel request
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="mt-3"><ErrorText message={error} /></div>}
    </div>
  );
}
