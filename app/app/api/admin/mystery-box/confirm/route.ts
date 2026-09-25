import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const { requestId } = (await request.json()) as { requestId?: string };
  if (!requestId) return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: profile } = await supabase.from('greenleaf_profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can confirm a Mystery Box' }, { status: 403 });
  }

  // Balance check + deduction + event log + status change happen atomically inside this function.
  const { data, error } = await createServiceClient().rpc('greenleaf_confirm_mystery_box', {
    p_request_id: requestId,
    p_admin_id: user.id,
  });
  if (error) {
    console.error('[mystery-box] confirm failed:', error.message);
    return NextResponse.json({ error: 'Could not confirm the request' }, { status: 500 });
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.ok) {
    const messages: Record<string, string> = {
      not_found: 'Request not found',
      not_pending: 'This request is no longer pending',
      insufficient_leaves: 'The student no longer has enough Leaves',
    };
    return NextResponse.json({ error: messages[result?.reason] ?? 'Could not confirm the request' }, { status: 409 });
  }
  return NextResponse.json({ ok: true, newBalance: result.new_balance });
}
