'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import LeafLogo from '@/components/brand/LeafLogo';

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
    <header className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        {/* Tên trung tâm luôn hiện ở mọi trang — phụ huynh mở app phải biết ngay
            đây là app của trung tâm nào. "/" tự điều hướng theo vai trò. */}
        <Link href="/" className="flex min-w-0 items-center gap-2 group">
          <LeafLogo size="sm" />
          <span className="gl-display truncate text-lg font-extrabold leading-tight text-gl-green group-hover:underline">
            GreenLeaf<span className="hidden sm:inline"> English Academy</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          {rightExtra}
          {name && (
            <Link href="/profile" className="hidden text-base font-bold text-gl-muted transition-colors hover:text-gl-green hover:underline sm:inline">
              {name}
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-bold text-gl-muted shadow-sm transition-all hover:bg-red-50 hover:text-red-500 hover:shadow"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </div>

      {(backHref || title) && (
        <div className="flex min-w-0 items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-white py-1.5 pl-2.5 pr-3.5 text-sm font-bold text-gl-green shadow-sm transition-all hover:bg-emerald-50 hover:shadow"
            >
              <ArrowLeft className="h-4 w-4" /> {backLabel}
            </Link>
          )}
          {title && (
            <h1 className="gl-display truncate text-xl font-extrabold text-gl-green-dark">
              {icon && <span className="mr-1.5">{icon}</span>}
              {title}
            </h1>
          )}
        </div>
      )}
    </header>
  );
}
