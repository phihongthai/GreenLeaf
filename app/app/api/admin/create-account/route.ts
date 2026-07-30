import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const USERNAME_RE = /^[a-zA-Z0-9_.]{3,30}$/;

export async function POST(request: NextRequest) {
  // Only teachers can create username/password accounts for students/parents.
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
  const { role, username, password, name, gradeCode } = body as {
    role: 'student' | 'parent';
    username: string;
    password: string;
    name: string;
    gradeCode?: string;
  };

  if (!['student', 'parent'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }
  if (!username || !USERNAME_RE.test(username)) {
    return NextResponse.json({ error: 'Username must be 3-30 characters, only letters/numbers/underscores/dots' }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
  }
  if (role === 'student' && !gradeCode) {
    return NextResponse.json({ error: 'Students must have a level selected' }, { status: 400 });
  }

  const serviceClient = createServiceClient();
  const email = `${username.toLowerCase()}@greenleaf.local`;

  const { data: created, error } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role,
      name: name.trim(),
      username: username.toLowerCase(),
      grade_code: role === 'student' ? gradeCode : null,
    },
  });

  if (error) {
    const message = error.message.includes('already been registered')
      ? 'Username already exists, choose a different one'
      : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, userId: created.user?.id });
}
