'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { LayoutList, Map as MapIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import StudentNavBar from '@/components/student/StudentNavBar';
import StudentWorldMap from '@/components/missions/StudentWorldMap';
import LessonPathList from '@/components/missions/LessonPathList';
import BadgesModal from '@/components/student/BadgesModal';
import FirstTimeGuide from '@/components/student/FirstTimeGuide';
import BottomTabBar from '@/components/student/BottomTabBar';
import SceneBackground from '@/components/decor/SceneBackground';
import FloatingDecor from '@/components/decor/FloatingDecor';
import type { Grade, Lesson, WordsExplorerContent } from '@/lib/types';

interface LessonWithProgress extends Lesson {
  totalMissions: number;
  completedMissions: number;
  topic: string;
}

interface StudentHomeCache {
  userId: string | null;
  userName: string;
  myGrade: Grade | null;
  leafCount: number;
  streakDays: number;
  todayCount: number;
  lessons: LessonWithProgress[];
}

let homeCache: StudentHomeCache | null = null;

export default function GradesPage() {
  const [userId, setUserId] = useState<string | null>(homeCache?.userId ?? null);
  const [userName, setUserName] = useState<string>(homeCache?.userName ?? 'Lyn');
  const [myGrade, setMyGrade] = useState<Grade | null>(homeCache?.myGrade ?? null);
  const [leafCount, setLeafCount] = useState<number>(homeCache?.leafCount ?? 12);
  const [streakDays, setStreakDays] = useState<number>(homeCache?.streakDays ?? 0);
  const [todayCount, setTodayCount] = useState<number>(homeCache?.todayCount ?? 0);
  const [lessons, setLessons] = useState<LessonWithProgress[]>(homeCache?.lessons ?? []);
  const [loading, setLoading] = useState<boolean>(!homeCache);
  const [badgesOpen, setBadgesOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [{ data: profile }, { data: rewardData }, { count: todayAttempts }] = await Promise.all([
      user
        ? supabase
            .from('greenleaf_profiles')
            .select('name, grade:greenleaf_grades(*)')
            .eq('id', user.id)
            .single()
        : Promise.resolve({ data: null }),
      user
        ? supabase
            .from('greenleaf_rewards')
            .select('leaf_count, streak_days')
            .eq('student_id', user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      user
        ? supabase
            .from('greenleaf_mission_attempts')
            .select('id', { count: 'exact', head: true })
            .eq('student_id', user.id)
            .gte('created_at', startOfToday.toISOString())
        : Promise.resolve({ count: 0 }),
    ]);

    const grade = (profile as unknown as { grade: Grade | null } | null)?.grade ?? null;
    const currentName = profile?.name || 'Lyn';
    const currentLeaves = rewardData?.leaf_count ?? (user ? 0 : 12);
    const currentStreak = rewardData?.streak_days ?? 0;
    const currentAttempts = todayAttempts ?? 0;

    let loadedLessons: LessonWithProgress[] = [];

    // Load lessons with progress for grade
    if (grade?.id) {
      const { data: lessonsData } = await supabase
        .from('greenleaf_lessons')
        .select('*')
        .eq('grade_id', grade.id)
        .order('order_index');

      const lessonsList = (lessonsData as Lesson[]) ?? [];
      const lessonIds = lessonsList.map((l) => l.id);

      if (lessonIds.length > 0) {
        const [{ data: missionsData }, { data: progressData }] = await Promise.all([
          supabase
            .from('greenleaf_missions')
            .select('id, lesson_id, type, content')
            .in('lesson_id', lessonIds),
          user
            ? supabase
                .from('greenleaf_student_progress')
                .select('mission_id')
                .eq('student_id', user.id)
                .eq('status', 'completed')
            : Promise.resolve({ data: null }),
        ]);

        const allMissions = (missionsData ?? []) as {
          id: string;
          lesson_id: string;
          type: string;
          content: unknown;
        }[];
        const completedMissionIds = new Set((progressData ?? []).map((p) => p.mission_id));

        const missionsByLesson = new Map<string, typeof allMissions>();
        for (const m of allMissions) {
          const list = missionsByLesson.get(m.lesson_id) ?? [];
          list.push(m);
          missionsByLesson.set(m.lesson_id, list);
        }

        loadedLessons = lessonsList.map((lesson) => {
          const missions = missionsByLesson.get(lesson.id) ?? [];
          const wordsMission = missions.find((m) => m.type === 'words_explorer');
          const topic =
            (wordsMission?.content as WordsExplorerContent | undefined)?.topic ?? lesson.title;
          const completedMissions = missions.filter((m) => completedMissionIds.has(m.id)).length;
          return {
            ...lesson,
            totalMissions: missions.length,
            completedMissions,
            topic,
          };
        });
      }
    }

    const newCache: StudentHomeCache = {
      userId: user?.id ?? null,
      userName: currentName,
      myGrade: grade,
      leafCount: currentLeaves,
      streakDays: currentStreak,
      todayCount: currentAttempts,
      lessons: loadedLessons,
    };

    homeCache = newCache;
    setUserId(newCache.userId);
    setUserName(newCache.userName);
    setMyGrade(newCache.myGrade);
    setLeafCount(newCache.leafCount);
    setStreakDays(newCache.streakDays);
    setTodayCount(newCache.todayCount);
    setLessons(newCache.lessons);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="relative min-h-screen bg-[#f3f9f1] px-3 sm:px-6 pt-3 sm:pt-4 pb-28 md:pb-12 space-y-4">
      {/* Background Ambience */}
      <SceneBackground />
      <FloatingDecor />

      {/* Top Header Navigation Bar (matches design) */}
      <div className="max-w-6xl mx-auto">
        <StudentNavBar
          userName={userName}
          leafCount={leafCount}
          streakDays={streakDays}
          activeTab="map"
          onOpenBadges={() => setBadgesOpen(true)}
        />
      </div>

      <div className="max-w-6xl mx-auto space-y-4">
        {/* Onboarding hint for new students */}
        <FirstTimeGuide userId={userId} />

        {/* View Switcher & Title Row */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <span className="gl-display text-lg font-black text-[#26552c]">
              {myGrade ? `${myGrade.name} — Learning World` : 'Learning Map'}
            </span>
            {todayCount > 0 && (
              <span className="hidden sm:inline-flex text-[11px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                🎉 {todayCount} practice{todayCount > 1 ? 's' : ''} today
              </span>
            )}
          </div>

          {/* Toggle between Fantasy World Map and Path List */}
          <div className="flex items-center bg-white/90 backdrop-blur-xs p-1 rounded-full shadow-xs border border-emerald-100">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all ${
                viewMode === 'map'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-emerald-700'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all ${
                viewMode === 'list'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-emerald-700'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="w-full aspect-[16/9] rounded-3xl bg-emerald-50 border-2 border-emerald-100 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-black text-emerald-800">Opening GreenLeaf World Map...</p>
          </div>
        ) : !myGrade ? (
          <div className="bg-white rounded-3xl shadow-md p-8 text-center space-y-4 max-w-md mx-auto border-2 border-emerald-100">
            <span className="text-5xl">🌱</span>
            <h2 className="gl-display text-xl font-black text-gray-800">Welcome to GreenLeaf!</h2>
            <p className="text-sm text-gray-600">
              Please choose your level or ask your teacher to assign you to a class.
            </p>
            <Link
              href="/profile"
              className="inline-block bg-[#3a7d44] hover:bg-[#2d5a34] text-white font-black py-2.5 px-6 rounded-2xl shadow-md transition-all active:scale-95 text-sm"
            >
              Choose Level in Profile →
            </Link>
          </div>
        ) : viewMode === 'map' ? (
          /* 1. Fantasy Game World Map (exact match to user design) */
          <StudentWorldMap
            gradeCode={myGrade.code}
            gradeName={myGrade.name}
            lessons={lessons}
            userName={userName}
            onOpenBadges={() => setBadgesOpen(true)}
          />
        ) : (
          /* 2. Classic Path List fallback */
          <div className="max-w-xl mx-auto bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-emerald-100">
            <LessonPathList gradeId={myGrade.id} gradeCode={myGrade.code} />
          </div>
        )}
      </div>

      {/* Badges & Mystery Box Modal */}
      <BadgesModal
        isOpen={badgesOpen}
        onClose={() => setBadgesOpen(false)}
        userId={userId}
        leafCount={leafCount}
        streakDays={streakDays}
      />

      {/* Bottom Bar for Mobile screens */}
      <BottomTabBar />
    </div>
  );
}
