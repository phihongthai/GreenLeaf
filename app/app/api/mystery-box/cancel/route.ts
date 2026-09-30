import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/auth';

// Students can cancel their own pending request; admins can cancel any pending request.
export async function POST(request: NextRequest) {
  const { requestId } = (await request.json()) as { requestId?: string };
  if (!requestId) return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });

  const { user, supabase } = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: profile } = await supabase.from('greenleaf_profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin';
  if (!isAdmin && profile?.role !== 'student') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  const db = createServiceClient();
  let query = db
    .from('greenleaf_mystery_box_requests')
    .update({ status: 'cancelled', resolved_at: new Date().toISOString(), resolved_by: user.id })
    .eq('id', requestId)
    .eq('status', 'pending');
  if (!isAdmin) query = query.eq('student_id', user.id);

  const { data, error } = await query.select('id');
  if (error) {
    console.error('[mystery-box] cancel failed:', error.message);
    return NextResponse.json({ error: 'Could not cancel the request' }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'No pending request found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
