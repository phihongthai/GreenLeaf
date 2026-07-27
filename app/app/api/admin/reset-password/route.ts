import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  // Chỉ giáo viên mới được đặt lại mật khẩu cho học sinh/phụ huynh (không có email thật nên
  // không thể tự "quên mật khẩu" qua email như luồng chuẩn của Supabase Auth).
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }
  const { data: callerProfile } = await supabase.from('greenleaf_profiles').select('role').eq('id', user.id).single();
  if (callerProfile?.role !== 'teacher') {
    return NextResponse.json({ error: 'Chỉ giáo viên mới có quyền này' }, { status: 403 });
  }

  const body = await request.json();
  const { userId, newPassword } = body as { userId: string; newPassword: string };

  if (!userId) {
    return NextResponse.json({ error: 'Thiếu userId' }, { status: 400 });
  }
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Mật khẩu cần ít nhất 6 ký tự' }, { status: 400 });
  }

  const { data: targetProfile } = await supabase.from('greenleaf_profiles').select('role').eq('id', userId).single();
  if (!targetProfile || !['student', 'parent'].includes(targetProfile.role)) {
    return NextResponse.json({ error: 'Chỉ đặt lại được mật khẩu học sinh/phụ huynh' }, { status: 400 });
  }

  const serviceClient = createServiceClient();
  const { error } = await serviceClient.auth.admin.updateUserById(userId, { password: newPassword });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
