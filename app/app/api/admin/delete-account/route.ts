import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  // Chỉ giáo viên mới được xoá tài khoản học sinh/phụ huynh. Xoá auth.users sẽ cascade xoá
  // greenleaf_profiles + toàn bộ dữ liệu con (progress, attempts, submissions, rewards...) —
  // xem greenleaf_profiles.id REFERENCES auth.users(id) ON DELETE CASCADE trong 0001_init.sql.
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
  const { userId } = body as { userId: string };

  if (!userId) {
    return NextResponse.json({ error: 'Thiếu userId' }, { status: 400 });
  }
  if (userId === user.id) {
    return NextResponse.json({ error: 'Không thể tự xoá tài khoản của chính mình' }, { status: 400 });
  }

  const { data: targetProfile } = await supabase.from('greenleaf_profiles').select('role').eq('id', userId).single();
  if (!targetProfile || !['student', 'parent'].includes(targetProfile.role)) {
    return NextResponse.json({ error: 'Chỉ xoá được tài khoản học sinh/phụ huynh' }, { status: 400 });
  }

  const serviceClient = createServiceClient();
  const { error } = await serviceClient.auth.admin.deleteUser(userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
