import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  // Only teachers can reset passwords for students/parents (no real email, so they
  // cannot use the standard Supabase Auth "forgot password" email flow).
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
  const { userId, newPassword } = body as { userId: string; newPassword: string };

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const { data: targetProfile } = await supabase.from('greenleaf_profiles').select('role').eq('id', userId).single();
  if (!targetProfile || !['student', 'parent'].includes(targetProfile.role)) {
    return NextResponse.json({ error: 'Can only reset passwords for student/parent accounts' }, { status: 400 });
  }

  const serviceClient = createServiceClient();
  const { error } = await serviceClient.auth.admin.updateUserById(userId, { password: newPassword });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
