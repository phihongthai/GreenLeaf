'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AppHeader from '@/components/AppHeader';
import BottomTabBar from '@/components/student/BottomTabBar';
import BackgroundMusic from '@/components/student/BackgroundMusic';
import FloatingDecor from '@/components/decor/FloatingDecor';
import SceneBackground from '@/components/decor/SceneBackground';
import LessonPathList from '@/components/missions/LessonPathList';
import FirstTimeGuide from '@/components/student/FirstTimeGuide';
import MysteryBox from '@/components/student/MysteryBox';
import type { Grade } from '@/lib/types';

export default function GradesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [myGrade, setMyGrade] = useState<Grade | null>(null);
  const [leafCount, setLeafCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [{ data: profile }, { data: rewardData }, { count: todayAttempts }] = await Promise.all([
        user ? supabase.from('greenleaf_profiles').select('grade:greenleaf_grades(*)').eq('id', user.id).single() : Promise.resolve({ data: null }),
        user ? supabase.from('greenleaf_rewards').select('leaf_count, streak_days').eq('student_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
        user ? supabase.from('greenleaf_mission_attempts').select('id', { count: 'exact', head: true }).eq('student_id', user.id).gte('created_at', startOfToday.toISOString()) : Promise.resolve({ count: 0 }),
      ]);

      const grade = (profile as unknown as { grade: Grade | null } | null)?.grade ?? null;
      setMyGrade(grade);
      setLeafCount(rewardData?.leaf_count ?? 0);
      setStreakDays(rewardData?.streak_days ?? 0);
      setTodayCount(todayAttempts ?? 0);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="relative min-h-screen gl-playful-bg px-4 pt-8 pb-32">
      <SceneBackground />
      <FloatingDecor />
      <div className="relative max-w-xl mx-auto space-y-4">
        <AppHeader
          rightExtra={
            <div className="flex items-center gap-2.5">
              {streakDays > 0 && (
                <div
                  className="flex items-center gap-1.5 bg-white rounded-full px-4 py-2 shadow-md"
                  title={`${streakDays}-day learning streak`}
                >
                  <span className="gl-sparkle inline-block text-lg" aria-hidden>🔥</span>
                  <span className="text-base font-extrabold text-gl-streak">{streakDays}</span>
                  <span className="sr-only">day streak</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
                <span className="gl-sparkle inline-block text-lg" aria-hidden>🍃</span>
                <span className="text-base font-extrabold text-gl-green">{leafCount} Leaves</span>
              </div>
              <BackgroundMusic />
              <Link
                href="/help"
                aria-label="Help"
                className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md text-[#3A7D44] hover:bg-emerald-50 transition-colors shrink-0"
              >
                <HelpCircle className="w-6 h-6" />
              </Link>
            </div>
          }
        />

        <FirstTimeGuide userId={userId} />

        {!loading && <MysteryBox userId={userId} leafCount={leafCount} />}

        {/* Leafy stands at the bottom edge of the card so there's no padding-bottom. */}
        {!loading && myGrade && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3A7D44] to-[#213B26] pl-5 pr-4 pt-4 shadow-lg gl-pop-in">
            <div className="flex items-end gap-3">
              <div className="min-w-0 flex-1 pb-5">
                <p className="gl-display text-2xl font-extrabold leading-tight text-white">{myGrade.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-white/85">
                  {todayCount > 0 ? (
                    <><span aria-hidden>🎉</span> {"You've"} practiced {todayCount} time{todayCount > 1 ? 's' : ''} today, awesome!</>
                  ) : streakDays > 0 ? (
                    <><span aria-hidden>🔥</span> Awesome {streakDays} consecutive days!</>
                  ) : (
                    <><span aria-hidden>🎯</span> Pick a lesson below to get started!</>
                  )}
                </p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/leafy/outfit_school.webp"
                alt=""
                aria-hidden
                className="h-32 w-auto shrink-0 drop-shadow-lg"
              />
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-400 text-sm py-10">Loading...</p>
        ) : !myGrade ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center space-y-3">
            <p className="text-sm text-gray-500">{"You haven't been assigned a level yet. Contact your teacher or choose one in your Profile."}</p>
            <Link
              href="/profile"
              className="inline-block bg-[#3A7D44] hover:bg-[#2E4A34] text-white font-extrabold py-2.5 px-5 rounded-xl transition-colors"
            >
              Go to Profile to pick a level →
            </Link>
          </div>
        ) : (
          <LessonPathList gradeId={myGrade.id} gradeCode={myGrade.code} />
        )}
      </div>

      <BottomTabBar />
    </div>
  );
}
