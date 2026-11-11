'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gift, Home, LineChart, Settings } from 'lucide-react';
import LeafLogo from '@/components/brand/LeafLogo';

export interface UnitShellProfile {
  name: string;
  levelName: string;
  program: string;
  classCode: string | null;
}

const TABS = [
  { href: '/unit', label: 'Home', Icon: Home },
  { href: '/profile', label: 'Rewards', Icon: Gift },
  { href: '/journey', label: 'My Progress', Icon: LineChart },
  { href: '/profile?tab=settings', label: 'Settings', Icon: Settings },
];

// Deep green + gold shell shared by the Unit map, Mission and Task screens:
// top bar (logo, level/programme, Unit, class code, account) and bottom bar (Home, Rewards, My Progress, Settings).
export default function UnitShell({
  profile,
  unitTitle,
  backHref,
  children,
}: {
  profile: UnitShellProfile | null;
  unitTitle: string;
  backHref?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const initial = profile?.name?.trim().charAt(0).toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-[#0b2417] text-emerald-50 pb-24" style={{ backgroundImage: 'radial-gradient(circle at 50% 30%, #14412a 0%, #0b2417 70%)' }}>
      <header className="sticky top-0 z-20 border-b border-amber-400/30 bg-[#0b2417]/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-3 py-2 flex items-center gap-3">
          <Link href={backHref ?? '/unit'} className="flex items-center gap-2 shrink-0" aria-label="GreenLeaf home">
            <LeafLogo size="sm" />
            <span className="hidden sm:inline font-black text-amber-300 tracking-wide">GreenLeaf</span>
          </Link>
          <div className="flex-1 min-w-0 text-center">
            <p className="text-[11px] text-amber-300/80 truncate">{profile ? `${profile.levelName} · ${profile.program}` : ' '}</p>
            <p className="text-sm font-extrabold truncate">{unitTitle}</p>
          </div>
          {profile?.classCode && (
            <span className="shrink-0 rounded-full border border-amber-400/60 px-2.5 py-1 text-[11px] font-bold text-amber-300">
              Class {profile.classCode}
            </span>
          )}
          <span
            className="shrink-0 w-8 h-8 rounded-full bg-amber-400 text-[#0b2417] font-black flex items-center justify-center"
            title={profile?.name}
            aria-label={`Account: ${profile?.name ?? ''}`}
          >
            {initial}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5">{children}</main>

      <nav aria-label="Main navigation" className="fixed bottom-0 inset-x-0 z-20 border-t border-amber-400/30 bg-[#0b2417]/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <ul className="max-w-3xl mx-auto flex">
          {TABS.map(({ href, label, Icon }) => {
            const active = href === '/unit' ? pathname.startsWith('/unit') : pathname === href.split('?')[0];
            return (
              <li key={label} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-extrabold ${active ? 'text-amber-300' : 'text-emerald-100/60 hover:text-amber-200'}`}
                >
                  <Icon className="w-5 h-5" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
