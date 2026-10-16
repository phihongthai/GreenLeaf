'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LayoutList, Map as MapIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import FloatingDecor from '@/components/decor/FloatingDecor';
import SceneBackground from '@/components/decor/SceneBackground';
import StudentNavBar from '@/components/student/StudentNavBar';
import StudentWorldMap from '@/components/missions/StudentWorldMap';
import LessonPathList from '@/components/missions/LessonPathList';
import type { Grade, Lesson, WordsExplorerContent } from '@/lib/types';

interface LessonWithProgress extends Lesson {
  totalMissions: number;
  completedMissions: number;
  topic: string;
}

export default function LessonListPage() {
  const params = useParams<{ gradeCode: string }>();
  const [grade, setGrade] = useState<Grade | null>(null);
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [userName, setUserName] = useState('Lyn');
  const [leafCount, setLeafCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [{ data: gradeData }, { data: profile }, { data: rewardData }] = await Promise.all([
      supabase.from('greenleaf_grades').select('*').eq('code', params.gradeCode).single(),
      user ? supabase.from('greenleaf_profiles').select('name').eq('id', user.id).single() : Promise.resolve({ data: null }),
      user ? supabase.from('greenleaf_rewards').select('leaf_count, streak_days').eq('student_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
    ]);

    if (gradeData) {
      setGrade(gradeData);
      setUserName(profile?.name || 'Lyn');
      setLeafCount(rewardData?.leaf_count ?? 0);
      setStreakDays(rewardData?.streak_days ?? 0);

      // Load lessons with progress
      const { data: lessonsData } = await supabase
        .from('greenleaf_lessons')
        .select('*')
        .eq('grade_id', gradeData.id)
        .order('order_index');

      const lessonsList = (lessonsData as Lesson[]) ?? [];
      const lessonIds = lessonsList.map((l) => l.id);

      if (lessonIds.length > 0) {
        const [{ data: missionsData }, { data: progressData }] = await Promise.all([
          supabase.from('greenleaf_missions').select('id, lesson_id, type, content').in('lesson_id', lessonIds),
          user
            ? supabase.from('greenleaf_student_progress').select('mission_id').eq('student_id', user.id).eq('status', 'completed')
            : Promise.resolve({ data: null }),
        ]);

        const allMissions = (missionsData ?? []) as { id: string; lesson_id: string; type: string; content: unknown }[];
        const completedMissionIds = new Set((progressData ?? []).map((p) => p.mission_id));

        const missionsByLesson = new Map<string, typeof allMissions>();
        for (const m of allMissions) {
          const list = missionsByLesson.get(m.lesson_id) ?? [];
          list.push(m);
          missionsByLesson.set(m.lesson_id, list);
        }

        const loadedLessons = lessonsList.map((lesson) => {
          const mList = missionsByLesson.get(lesson.id) ?? [];
          const wordsMission = mList.find((m) => m.type === 'words_explorer');
          const topic = (wordsMission?.content as WordsExplorerContent | undefined)?.topic ?? lesson.title;
          const completedMissions = mList.filter((m) => completedMissionIds.has(m.id)).length;
          return {
            ...lesson,
            totalMissions: mList.length,
            completedMissions,
            topic,
          };
        });

        setLessons(loadedLessons);
      }
    }
    setLoading(false);
  }, [params.gradeCode]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="relative min-h-screen bg-[#f3f9f1] px-3 sm:px-6 pt-3 sm:pt-4 pb-28 md:pb-12 space-y-4">
      <SceneBackground />
      <FloatingDecor />

      <div className="max-w-6xl mx-auto">
        <StudentNavBar
          userName={userName}
          leafCount={leafCount}
          streakDays={streakDays}
          activeTab="map"
        />
      </div>

      <div className="max-w-6xl mx-auto space-y-4">
        {/* View Toggle Bar */}
        <div className="flex items-center justify-between px-2">
          <Link
            href="/grades"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gl-green hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Levels
          </Link>

          <div className="inline-flex items-center p-1 bg-white/90 backdrop-blur-xs rounded-2xl shadow-xs border border-emerald-100">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-emerald-700'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>World Map</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-emerald-700'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Trail View</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-center text-gray-400 text-sm py-16 font-bold">Loading world map...</p>
        ) : viewMode === 'map' ? (
          <StudentWorldMap
            gradeCode={params.gradeCode}
            gradeName={grade?.name || 'GreenLeaf World'}
            lessons={lessons}
            userName={userName}
          />
        ) : (
          <div className="max-w-md mx-auto">
            <LessonPathList gradeId={grade?.id || ''} gradeCode={params.gradeCode} />
          </div>
        )}
      </div>
    </div>
  );
}
