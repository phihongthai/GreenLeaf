import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const ROLE_HOME: Record<string, string> = {
  student: '/grades',
  teacher: '/teacher/dashboard',
  parent: '/parent/dashboard',
  admin: '/admin/mystery-box',
};

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('greenleaf_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  redirect(ROLE_HOME[profile?.role ?? ''] ?? '/login');
}
