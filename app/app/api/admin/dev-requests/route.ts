import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { DEV_REQUEST_MAX_LENGTH } from '@/lib/devRequests';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Not logged in' }, { status: 401 }) };
  const { data: profile } = await supabase.from('greenleaf_profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Only admins can perform this action' }, { status: 403 }) };
  }
  return { user, supabase };
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { data, error } = await auth.supabase
    .from('greenleaf_dev_requests')
    .select('id, prompt, status, summary, run_url, pr_url, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ requests: data });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const token = process.env.GITHUB_DISPATCH_TOKEN;
  const repo = process.env.GITHUB_REPO; // "owner/name"
  if (!token || !repo || !process.env.DEV_CALLBACK_SECRET) {
    return NextResponse.json({ error: 'Dev chat is not configured on the server' }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { prompt?: string } | null;
  const prompt = body?.prompt?.trim();
  if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  if (prompt.length > DEV_REQUEST_MAX_LENGTH) {
    return NextResponse.json({ error: `Prompt must be at most ${DEV_REQUEST_MAX_LENGTH} characters` }, { status: 400 });
  }

  const service = createServiceClient();

  // One run at a time: concurrent branches against the same files would conflict on merge.
  const { count } = await service
    .from('greenleaf_dev_requests')
    .select('id', { count: 'exact', head: true })
    .in('status', ['queued', 'running'])
    .gt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());
  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: 'A request is already running. Wait for it to finish.' }, { status: 429 });
  }

  const { data: row, error: insertError } = await service
    .from('greenleaf_dev_requests')
    .insert({ admin_id: auth.user.id, prompt })
    .select('id')
    .single();
  if (insertError || !row) {
    return NextResponse.json({ error: insertError?.message ?? 'Could not save request' }, { status: 500 });
  }

  const res = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/admin-request.yml/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      ref: process.env.GITHUB_BASE_BRANCH ?? 'main',
      inputs: { request_id: row.id, prompt },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    await service
      .from('greenleaf_dev_requests')
      .update({ status: 'failed', summary: `Could not start the workflow (${res.status})`, updated_at: new Date().toISOString() })
      .eq('id', row.id);
    console.error('[dev-requests] dispatch failed', res.status, detail);
    return NextResponse.json({ error: 'Could not start the workflow' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, id: row.id });
}
