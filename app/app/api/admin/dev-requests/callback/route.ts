import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { verifyCallback, type DevRequestStatus } from '@/lib/devRequests';

const STATUSES: DevRequestStatus[] = ['running', 'needs_review', 'merged', 'failed', 'no_changes'];

// Called by the GitHub Actions workflow (not a browser), authenticated with an HMAC signature.
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    requestId?: string;
    status?: DevRequestStatus;
    summary?: string;
    runUrl?: string;
    prUrl?: string;
    signature?: string;
  } | null;

  if (!body?.requestId || !body.status || !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  if (!verifyCallback(body.requestId, body.status, body.signature ?? '')) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const update: Record<string, unknown> = { status: body.status, updated_at: new Date().toISOString() };
  if (body.summary) update.summary = body.summary.slice(0, 2000);
  if (body.runUrl) update.run_url = body.runUrl;
  if (body.prUrl) update.pr_url = body.prUrl;

  const { error } = await createServiceClient().from('greenleaf_dev_requests').update(update).eq('id', body.requestId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
