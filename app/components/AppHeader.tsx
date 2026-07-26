'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AppHeader({
  title,
  icon,
  backHref,
  backLabel = 'Trang chính',
  rightExtra,
}: {
  title?: string;
  icon?: string;
  backHref?: string;
  backLabel?: string;
  rightExtra?: React.ReactNode;
}) {
  const router = useRouter();
  const [name, setName] = useState('');

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('greenleaf_profiles').select('name').eq('id', user.id).single();
      setName(profile?.name ?? '');
    };
    load();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center gap-1.5 shrink-0 bg-white rounded-full pl-2.5 pr-3.5 py-1.5 text-sm font-bold text-[#3A7D44] shadow-sm hover:bg-emerald-50 hover:shadow transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> {backLabel}
          </Link>
        )}
        {title && (
          <h1 className="text-xl font-extrabold text-[#2E4A34] truncate">
            {icon && <span className="mr-1.5">{icon}</span>}
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {rightExtra}
        {name && (
          <Link href="/profile" className="hidden sm:inline text-sm text-gray-500 font-semibold hover:text-[#3A7D44] hover:underline transition-colors">
            {name}
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 text-sm font-bold text-gray-500 shadow-sm hover:bg-red-50 hover:text-red-500 hover:shadow transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
