'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import LeafLogo from '@/components/brand/LeafLogo';

const TABS = [
  { key: 'dashboard', label: '🏠 Tổng quan', href: '/teacher/dashboard' },
  { key: 'lessons', label: '📚 Lessons', href: '/teacher/lessons' },
  { key: 'homework', label: '✍️ Homework', href: '/teacher/homework' },
  { key: 'resources', label: '📁 Resource Library', href: '/teacher/resources' },
  { key: 'students', label: '👩‍🎓 Students', href: '/teacher/students' },
  { key: 'accounts', label: '🔑 Accounts', href: '/teacher/accounts' },
  { key: 'guide', label: '❓ Hướng dẫn', href: '/teacher/guide' },
];

export default function TeacherNav({ active }: { active: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="space-y-3">
      <Link href="/" className="flex w-fit items-center gap-2 group">
        <LeafLogo size="sm" />
        <span className="gl-display text-lg font-extrabold leading-tight text-gl-green group-hover:underline">
          GreenLeaf<span className="hidden sm:inline"> English Academy</span>
        </span>
      </Link>

      <div className="flex flex-wrap items-center gap-2 rounded-full bg-white p-1 shadow-sm">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            aria-current={active === t.key ? 'page' : undefined}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              active === t.key ? 'bg-gl-green text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </Link>
        ))}
        <div className="mx-1 h-5 w-px bg-gray-200" />
        <button
          onClick={handleLogout}
          className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-gray-500 transition-all hover:bg-red-50 hover:text-red-500"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
