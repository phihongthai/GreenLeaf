'use client';

import Link from 'next/link';
import BottomTabBar from '@/components/student/BottomTabBar';
import LeafLogo from '@/components/brand/LeafLogo';
import SceneBackground from '@/components/decor/SceneBackground';
import FloatingDecor from '@/components/decor/FloatingDecor';

export interface UnitShellProfile {
  name: string;
  levelName: string;
  program: string;
  classCode: string | null;
}


// Same light look as the rest of the student app; shell shared by the Unit map, Mission and Task screens:
// top bar (logo, level/programme, Unit, class code, account) and bottom bar (Home, Rewards, My Progress, Settings).
export default function UnitShell({
  profile,
  unitTitle,
  children,
}: {
  profile: UnitShellProfile | null;
  unitTitle: string;
  children: React.ReactNode;
}) {
  const initial = profile?.name?.trim().charAt(0).toUpperCase() || '?';

  return (
    <div className="relative min-h-screen bg-[#f3f9f1] px-3 sm:px-6 pt-3 sm:pt-4 pb-40 md:pb-12 text-gl-green-dark">
      <SceneBackground />
      <FloatingDecor />

      <header className="relative z-10 max-w-6xl mx-auto">
        <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-emerald-100/70 px-4 py-2.5 flex items-center gap-3">
          <Link href="/grades" className="flex items-center gap-2 shrink-0" aria-label="GreenLeaf home">
            <LeafLogo size="sm" />
            <span className="hidden sm:inline font-black text-gl-green-dark tracking-wide">GreenLeaf</span>
          </Link>
          <div className="flex-1 min-w-0 text-center">
            <p className="text-[11px] text-gl-muted-dark truncate">{profile ? `${profile.levelName} · ${profile.program}` : ' '}</p>
            <p className="text-sm font-extrabold truncate">{unitTitle}</p>
          </div>
          {profile?.classCode && (
            <span className="shrink-0 rounded-full bg-gl-green-light px-2.5 py-1 text-[11px] font-bold text-gl-green-dark">
              Class {profile.classCode}
            </span>
          )}
          <span
            className="shrink-0 w-8 h-8 rounded-full bg-gl-green-light text-gl-green-dark font-black flex items-center justify-center"
            title={profile?.name}
            aria-label={`Account: ${profile?.name ?? ''}`}
          >
            {initial}
          </span>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto py-5">{children}</main>

      <BottomTabBar />
    </div>
  );
}
