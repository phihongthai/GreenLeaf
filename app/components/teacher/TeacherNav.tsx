'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const TABS = [
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
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex gap-2 bg-white rounded-full p-1 shadow-sm">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`text-sm font-bold px-4 py-1.5 rounded-full transition-colors ${
              active === t.key ? 'bg-[#3A7D44] text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 text-sm font-bold text-gray-500 shadow-sm hover:bg-red-50 hover:text-red-500 hover:shadow transition-all shrink-0"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Đăng xuất</span>
      </button>
    </div>
  );
}
