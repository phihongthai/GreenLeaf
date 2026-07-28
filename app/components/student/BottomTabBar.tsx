'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, TreePine, PenLine, User } from 'lucide-react';

/**
 * Thanh điều hướng cố định đáy màn hình cho học sinh. Trước đây chỉ có 2 lối
 * (Hành trình, Bài tập) nằm rải rác từng trang; gom lại 4 mục dùng chung để
 * học sinh nhỏ tuổi luôn thấy mình đang ở đâu và quay về được.
 */
const TABS = [
  { href: '/grades', label: 'Học', Icon: Home },
  { href: '/journey', label: 'Hành trình', Icon: TreePine },
  { href: '/homework', label: 'Bài tập', Icon: PenLine },
  { href: '/profile', label: 'Hồ sơ', Icon: User },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed bottom-0 inset-x-0 z-30 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-xl mx-auto px-4 pb-3">
        <ul className="flex gap-1 rounded-2xl border border-gray-100 bg-white/95 p-1.5 shadow-lg backdrop-blur">
          {TABS.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex flex-col items-center gap-0.5 rounded-xl py-2 text-xs font-extrabold transition-colors ${
                    active
                      ? 'bg-gl-green-light text-gl-green-dark'
                      : 'text-gl-muted hover:bg-gl-cream hover:text-gl-green'
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
