'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import ErrorText from '@/components/ErrorText';
import { MYSTERY_BOX_COST } from '@/lib/mysteryBox';

interface RequestRow {
  id: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  resolved_at: string | null;
  student_id: string;
  student: { name: string; username: string | null; grade: { name: string } | null } | null;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminMysteryBoxPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [leaves, setLeaves] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('greenleaf_mystery_box_requests')
      .select('id, status, created_at, resolved_at, student_id, student:greenleaf_profiles!student_id(name, username, grade:greenleaf_grades(name))')
      .order('created_at', { ascending: false })
      .limit(100);

    const list = (data as unknown as RequestRow[]) ?? [];
    setRows(list);

    const pendingIds = list.filter((r) => r.status === 'pending').map((r) => r.student_id);
    if (pendingIds.length > 0) {
      const { data: rewards } = await supabase.from('greenleaf_rewards').select('student_id, leaf_count').in('student_id', pendingIds);
      setLeaves(Object.fromEntries((rewards ?? []).map((r) => [r.student_id, r.leaf_count])));
    } else {
      setLeaves({});
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (url: string, requestId: string) => {
    setBusyId(requestId);
    setError(null);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? 'Something went wrong.');
      }
    } catch {
      setError('Something went wrong.');
    }
    await load();
    setBusyId(null);
  };

  const pending = rows.filter((r) => r.status === 'pending').reverse();
  const history = rows.filter((r) => r.status !== 'pending');

  return (
    <div className="min-h-screen gl-playful-bg px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <AppHeader icon="🎁" title="Mystery Box Requests" />

        {error && <ErrorText message={error} />}

        <section className="space-y-3 rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-sm font-extrabold text-gl-green">Pending ({pending.length})</h2>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : pending.length === 0 ? (
            <p className="text-sm text-gray-400">No pending requests.</p>
          ) : (
            <div className="space-y-2">
              {pending.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-gray-50 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-700">
                      {r.student?.name ?? '—'}
                      {r.student?.username && <span className="font-normal text-gray-400"> · {r.student.username}</span>}
                    </p>
                    <p className="text-xs text-gray-400">
                      {r.student?.grade?.name ?? '—'} · requested {formatDateTime(r.created_at)} · {leaves[r.student_id] ?? 0} Leaves
                    </p>
                  </div>
                  <button
                    onClick={() => act('/api/admin/mystery-box/confirm', r.id)}
                    disabled={busyId === r.id}
                    className="rounded-xl bg-gl-green px-3 py-2 text-sm font-extrabold text-white transition-colors hover:bg-gl-green-dark disabled:opacity-50"
                  >
                    Confirm (−{MYSTERY_BOX_COST})
                  </button>
                  <button
                    onClick={() => act('/api/mystery-box/cancel', r.id)}
                    disabled={busyId === r.id}
                    className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400">
            Confirm only after the student is at the center and has opened their box — confirming deducts {MYSTERY_BOX_COST} Leaves.
          </p>
        </section>

        <section className="space-y-3 rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-sm font-extrabold text-gl-green">History</h2>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400">Nothing yet.</p>
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {history.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 rounded-xl bg-gray-50 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-700">{r.student?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(r.resolved_at ?? r.created_at)}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${
                      r.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {r.status === 'completed' ? 'Completed' : 'Cancelled'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <AppFooter />
      </div>
    </div>
  );
}
