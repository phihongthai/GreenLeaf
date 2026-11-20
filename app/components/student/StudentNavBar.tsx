'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Map,
  BarChart2,
  Trophy,
  BookOpen,
  ChevronDown,
  User,
  LogOut,
  HelpCircle,
  Compass,
  Sparkles,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import BackgroundMusic from '@/components/student/BackgroundMusic';
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import { STUDENT_TOUR_SLIDES } from '@/components/onboarding/studentTourSlides';
import { useOnboardingTour } from '@/lib/useOnboardingTour';

interface StudentNavBarProps {
  userName?: string;
  leafCount?: number;
  streakDays?: number;
  onOpenBadges?: () => void;
  activeTab?: 'map' | 'progress' | 'badges' | 'library';
}

export default function StudentNavBar({
  userName = 'Lyn',
  leafCount = 12,
  streakDays = 0,
  onOpenBadges,
  activeTab = 'map',
}: StudentNavBarProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { tourOpen, openTour, closeTour } = useOnboardingTour(userId);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-emerald-100/70 px-4 py-2.5 flex items-center justify-between gap-3 select-none transition-all">
      {/* 1. Left Brand: GreenLeaf English Academy */}
      <Link href="/grades" className="flex items-center gap-2.5 group shrink-0">
        <div className="relative w-8 h-8 flex items-center justify-center">
          {/* Double Leaf Emblem */}
          <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 drop-shadow-sm group-hover:scale-105 transition-transform">
            <path
              d="M12 28C10 24 9 18 13 11C17 4 25 3 25 3C25 3 25.5 11 21.5 18C17.5 25 12 28 12 28Z"
              fill="url(#nav-leaf-grad1)"
            />
            <path
              d="M18 29C17 25 18 20 22 15C26 10 32 10 32 10C32 10 31.5 17 27.5 22C23.5 27 18 29 18 29Z"
              fill="url(#nav-leaf-grad2)"
            />
            <path
              d="M11 28C14 22 18 17 25 12"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeOpacity="0.6"
            />
            <defs>
              <linearGradient id="nav-leaf-grad1" x1="10" y1="5" x2="25" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6BCB4B" />
                <stop offset="1" stopColor="#357A38" />
              </linearGradient>
              <linearGradient id="nav-leaf-grad2" x1="18" y1="10" x2="32" y2="29" gradientUnits="userSpaceOnUse">
                <stop stopColor="#87E259" />
                <stop offset="1" stopColor="#439446" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tight text-[#2D5A34] leading-tight">
            GreenLeaf
          </span>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#729c78] leading-none">
            English Academy
          </span>
        </div>
      </Link>

      {/* 2. Middle Navigation Tabs (Desktop & Tablet) */}
      <div className="hidden md:flex items-center gap-2 lg:gap-3">
        {/* Tab 1: Learning Map */}
        <Link
          href="/grades"
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black transition-all ${
            activeTab === 'map'
              ? 'bg-[#e8f7ea] text-[#24582b] border border-[#a2dfaa] shadow-sm'
              : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <Map className="w-4 h-4 text-emerald-600" />
          <span>Learning Map</span>
        </Link>

        {/* Tab 2: My Progress */}
        <Link
          href="/journey"
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black transition-all ${
            activeTab === 'progress'
              ? 'bg-[#e8f7ea] text-[#24582b] border border-[#a2dfaa] shadow-sm'
              : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-gray-500" />
          <span>My Progress</span>
        </Link>

        {/* Tab 3: Badges */}
        <button
          type="button"
          onClick={onOpenBadges}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black transition-all ${
            activeTab === 'badges'
              ? 'bg-[#e8f7ea] text-[#24582b] border border-[#a2dfaa] shadow-sm'
              : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Badges</span>
        </button>

        {/* Tab 4: Library */}
        <Link
          href="/homework"
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black transition-all ${
            activeTab === 'library'
              ? 'bg-[#e8f7ea] text-[#24582b] border border-[#a2dfaa] shadow-sm'
              : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <BookOpen className="w-4 h-4 text-gray-500" />
          <span>Library</span>
        </Link>
      </div>

      {/* 3. Right User Profile & Leaves Counter */}
      <div className="flex items-center gap-2.5">
        {/* Streak indicator if active */}
        {streakDays > 0 && (
          <div
            className="hidden sm:flex items-center gap-1 bg-orange-50 border border-orange-200/80 px-2.5 py-1 rounded-full shadow-xs"
            title={`${streakDays} days streak!`}
          >
            <span className="text-sm">🔥</span>
            <span className="text-xs font-extrabold text-orange-600">{streakDays}</span>
          </div>
        )}

        {/* User Pill with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 rounded-full pl-1.5 pr-2.5 py-1 shadow-xs transition-colors"
          >
            {/* Mascot Avatar Icon */}
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border border-emerald-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/leafy/outfit_school.webp"
                alt="Avatar"
                className="w-full h-full object-cover scale-125"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="text-xs font-black text-gray-700 max-w-[80px] truncate">
              {userName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-emerald-100 py-2 z-50 gl-pop-in">
              <div className="px-3.5 py-2 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-400">Signed in as</p>
                <p className="text-sm font-black text-[#2e5933] truncate">{userName}</p>
              </div>

              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile & Level</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenBadges?.();
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Badges & Rewards</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  openTour();
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>View guided tour</span>
              </button>

              <Link
                href="/help"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Help & Audio Guide</span>
              </Link>

              <div className="px-3 py-1.5 flex items-center justify-between border-t border-gray-100">
                <span className="text-[11px] font-bold text-gray-500">Music:</span>
                <BackgroundMusic />
              </div>

              <div className="border-t border-gray-100 pt-1">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Leaves Currency Pill */}
        <button
          type="button"
          onClick={onOpenBadges}
          className="flex items-center gap-1.5 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/90 rounded-full px-3 py-1 shadow-xs transition-transform active:scale-95"
          title="Click to view Badges & Mystery Box"
        >
          <span className="text-base select-none">🍃</span>
          <span className="text-xs font-black text-[#26532d]">{leafCount}</span>
        </button>
      </div>

      <OnboardingTour
        open={tourOpen}
        slides={STUDENT_TOUR_SLIDES}
        guideHref="/help"
        finishLabel="Start learning →"
        onClose={closeTour}
      />
    </nav>
  );
}
