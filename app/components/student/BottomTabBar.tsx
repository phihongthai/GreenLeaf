'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gift, Home, LineChart, Settings } from 'lucide-react';

/**
 * Fixed bottom navigation bar for students. Consolidates 4 sections so
 * young students always know where they are and can navigate back.
 */
const TABS = [
  { href: '/grades', label: 'Home', Icon: Home, match: ['/grades', '/missions'] },
  { href: '/profile', label: 'Rewards', Icon: Gift, match: [] },
  { href: '/journey', label: 'My Progress', Icon: LineChart, match: ['/journey', '/homework'] },
  { href: '/profile#settings', label: 'Settings', Icon: Settings, match: [] },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 inset-x-0 z-30 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-xl mx-auto px-4 pb-3">
        <ul className="flex gap-1 rounded-2xl border border-gray-100 bg-white/95 p-1.5 shadow-lg backdrop-blur">
          {TABS.map(({ href, label, Icon, match }) => {
            const active = label === 'Rewards'
              ? pathname === '/profile'
              : match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
            return (
              <li key={label} className="flex-1">
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
