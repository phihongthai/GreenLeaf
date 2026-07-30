import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  // Only teachers can delete student/parent accounts. Deleting from auth.users cascades to
  // greenleaf_profiles + all child data (progress, attempts, submissions, rewards...) —
  // see greenleaf_profiles.id REFERENCES auth.users(id) ON DELETE CASCADE in 0001_init.sql.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }
  const { data: callerProfile } = await supabase.from('greenleaf_profiles').select('role').eq('id', user.id).single();
  if (callerProfile?.role !== 'teacher') {
    return NextResponse.json({ error: 'Only teachers can perform this action' }, { status: 403 });
  }

  const body = await request.json();
  const { userId } = body as { userId: string };

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  if (userId === user.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  const { data: targetProfile } = await supabase.from('greenleaf_profiles').select('role').eq('id', userId).single();
  if (!targetProfile || !['student', 'parent'].includes(targetProfile.role)) {
    return NextResponse.json({ error: 'Can only delete student/parent accounts' }, { status: 400 });
  }

  const serviceClient = createServiceClient();
  const { error } = await serviceClient.auth.admin.deleteUser(userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
