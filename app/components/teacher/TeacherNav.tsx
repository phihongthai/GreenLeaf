'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Compass } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import LeafLogo from '@/components/brand/LeafLogo';
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import { TEACHER_TOUR_SLIDES } from '@/components/onboarding/teacherTourSlides';
import { useOnboardingTour } from '@/lib/useOnboardingTour';

const TABS = [
  { key: 'dashboard', label: '🏠 Dashboard', href: '/teacher/dashboard' },
  { key: 'lessons', label: '📚 Lessons', href: '/teacher/lessons' },
  { key: 'unit', label: '🗺️ Unit', href: '/teacher/unit' },
  { key: 'homework', label: '✍️ Homework', href: '/teacher/homework' },
  { key: 'resources', label: '📁 Resource Library', href: '/teacher/resources' },
  { key: 'students', label: '👩‍🎓 Students', href: '/teacher/students' },
  { key: 'accounts', label: '🔑 Accounts', href: '/teacher/accounts' },
  { key: 'guide', label: '❓ Guide', href: '/teacher/guide' },
];

export default function TeacherNav({ active }: { active: string }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const { tourOpen, openTour, closeTour } = useOnboardingTour(userId);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null));
  }, []);

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
          onClick={openTour}
          className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-gray-500 transition-all hover:bg-emerald-50 hover:text-gl-green"
        >
          <Compass className="w-4 h-4" />
          <span className="hidden sm:inline">View tour</span>
        </button>
        <div className="mx-1 h-5 w-px bg-gray-200" />
        <button
          onClick={handleLogout}
          className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-gray-500 transition-all hover:bg-red-50 hover:text-red-500"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>

      <OnboardingTour
        open={tourOpen}
        slides={TEACHER_TOUR_SLIDES}
        guideHref="/teacher/guide"
        finishLabel="Got it, let's go →"
        onClose={closeTour}
      />
    </div>
  );
}
