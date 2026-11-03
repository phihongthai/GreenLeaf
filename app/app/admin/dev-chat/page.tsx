'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import ErrorText from '@/components/ErrorText';
import type { DevRequestStatus } from '@/lib/devRequests';

interface DevRequest {
  id: string;
  prompt: string;
  status: DevRequestStatus;
  summary: string | null;
  run_url: string | null;
  pr_url: string | null;
  created_at: string;
}

const STATUS_LABEL: Record<DevRequestStatus, { text: string; className: string }> = {
  queued: { text: 'Queued', className: 'bg-gray-200 text-gray-600' },
  running: { text: 'Working…', className: 'bg-amber-100 text-amber-700' },
  needs_review: { text: 'Needs your review', className: 'bg-blue-100 text-blue-700' },
  merged: { text: 'Deployed', className: 'bg-emerald-100 text-emerald-700' },
  failed: { text: 'Failed', className: 'bg-red-100 text-red-600' },
  no_changes: { text: 'No changes', className: 'bg-gray-200 text-gray-600' },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function AdminDevChatPage() {
  const [items, setItems] = useState<DevRequest[]>([]);
  const [prompt, setPrompt] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/dev-requests');
    if (res.ok) setItems((await res.json()).requests ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const active = items.some((i) => i.status === 'queued' || i.status === 'running');
  useEffect(() => {
    if (!active) return;
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [active, load]);

  const send = async () => {
    if (!prompt.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/dev-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? 'Something went wrong.');
      } else {
        setPrompt('');
      }
    } catch {
      setError('Something went wrong.');
    }
    await load();
    setSending(false);
  };

  return (
    <div className="min-h-screen gl-playful-bg px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <AppHeader icon="🛠️" title="Site Changes" />

        <nav className="flex gap-2 text-sm font-bold">
          <Link href="/admin/mystery-box" className="rounded-xl bg-white px-3 py-2 text-gray-500 shadow-sm">Mystery Box</Link>
          <span className="rounded-xl bg-gl-green px-3 py-2 text-white">Site Changes</span>
        </nav>

        {error && <ErrorText message={error} />}

        <section className="space-y-3 rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-sm font-extrabold text-gl-green">Ask Claude to change the website</h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={4000}
            rows={4}
            placeholder="Describe the change, e.g. “Make the Mystery Box button on the learn page orange”."
            className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-gl-green"
          />
          <button
            onClick={send}
            disabled={sending || active || !prompt.trim()}
            className="rounded-xl bg-gl-green px-4 py-2 text-sm font-extrabold text-white transition-colors hover:bg-gl-green-dark disabled:opacity-50"
          >
            {active ? 'A request is running…' : sending ? 'Sending…' : 'Send'}
          </button>
          <p className="text-xs text-gray-400">
            Claude edits the code, and if lint and build pass, the change is merged and deployed automatically.
            Changes to workflows, migrations or env files are held for manual review.
          </p>
        </section>

        <section className="space-y-3 rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-sm font-extrabold text-gl-green">History</h2>
          {items.length === 0 ? (
            <p className="text-sm text-gray-400">Nothing yet.</p>
          ) : (
            <div className="space-y-2">
              {items.map((i) => (
                <div key={i.id} className="space-y-1 rounded-xl bg-gray-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="whitespace-pre-wrap text-sm font-semibold text-gray-700">{i.prompt}</p>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${STATUS_LABEL[i.status].className}`}>
                      {STATUS_LABEL[i.status].text}
                    </span>
                  </div>
                  {i.summary && <p className="text-xs text-gray-500">{i.summary}</p>}
                  <p className="text-xs text-gray-400">
                    {formatDateTime(i.created_at)}
                    {i.pr_url && <> · <a href={i.pr_url} target="_blank" rel="noreferrer" className="underline">Pull request</a></>}
                    {i.run_url && <> · <a href={i.run_url} target="_blank" rel="noreferrer" className="underline">Run log</a></>}
                  </p>
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
