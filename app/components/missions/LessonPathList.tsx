'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Lock, Gift, Sparkles, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getLessonEmoji } from '@/lib/lessonEmoji';
import type { Lesson, WordsExplorerContent } from '@/lib/types';

interface LessonWithProgress extends Lesson {
  totalMissions: number;
  completedMissions: number;
  topic: string;
}

// In-memory cache for instant route transitions
const lessonPathCache = new Map<string, LessonWithProgress[]>();

// Alternating path offsets for the zig-zag trail
const OFFSETS = [
  'justify-center',
  'justify-start pl-6 md:pl-16',
  'justify-center',
  'justify-end pr-6 md:pr-16',
];

export default function LessonPathList({ gradeId, gradeCode }: { gradeId: string; gradeCode: string }) {
  const cached = gradeId ? lessonPathCache.get(gradeId) : undefined;
  const [lessons, setLessons] = useState<LessonWithProgress[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached);
  const [lockedModalLesson, setLockedModalLesson] = useState<LessonWithProgress | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!gradeId) return;
      if (!lessonPathCache.has(gradeId)) {
        setLoading(true);
      }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Fetch lessons
      const { data: lessonsData } = await supabase
        .from('greenleaf_lessons')
        .select('*')
        .eq('grade_id', gradeId)
        .order('order_index');

      const lessonsList = (lessonsData as Lesson[]) ?? [];
      const lessonIds = lessonsList.map((l) => l.id);

      if (lessonIds.length === 0) {
        if (!active) return;
        lessonPathCache.set(gradeId, []);
        setLessons([]);
        setLoading(false);
        return;
      }

      // 2. Batch fetch ALL missions for all lessons
      const { data: missionsData } = await supabase
        .from('greenleaf_missions')
        .select('id, lesson_id, type, content')
        .in('lesson_id', lessonIds);

      const allMissions = (missionsData ?? []) as { id: string; lesson_id: string; type: string; content: unknown }[];
      const allMissionIds = allMissions.map((m) => m.id);

      // 3. Batch fetch ALL user progress
      let completedMissionIds = new Set<string>();
      if (user && allMissionIds.length > 0) {
        const { data: progressData } = await supabase
          .from('greenleaf_student_progress')
          .select('mission_id')
          .eq('student_id', user.id)
          .eq('status', 'completed')
          .in('mission_id', allMissionIds);

        completedMissionIds = new Set((progressData ?? []).map((p) => p.mission_id));
      }

      // Group missions by lesson
      const missionsByLesson = new Map<string, typeof allMissions>();
      for (const m of allMissions) {
        const list = missionsByLesson.get(m.lesson_id) ?? [];
        list.push(m);
        missionsByLesson.set(m.lesson_id, list);
      }

      const lessonsWithProgress: LessonWithProgress[] = lessonsList.map((lesson) => {
        const missions = missionsByLesson.get(lesson.id) ?? [];
        const wordsMission = missions.find((m) => m.type === 'words_explorer');
        const topic = (wordsMission?.content as WordsExplorerContent | undefined)?.topic ?? lesson.title;
        const completedMissions = missions.filter((m) => completedMissionIds.has(m.id)).length;
        return {
          ...lesson,
          totalMissions: missions.length,
          completedMissions,
          topic,
        };
      });

      if (!active) return;
      lessonPathCache.set(gradeId, lessonsWithProgress);
      setLessons(lessonsWithProgress);
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [gradeId]);

  if (loading) return <p className="text-center text-gray-400 text-sm py-12">Loading journey map...</p>;
  if (lessons.length === 0) return <p className="text-center text-gray-400 text-sm py-12">No lessons for this level yet.</p>;

  // Determine current lesson index: first uncompleted lesson that IS unlocked
  let currentFound = false;
  const lessonStates = lessons.map((lesson) => {
    const isDone = lesson.totalMissions > 0 && lesson.completedMissions >= lesson.totalMissions;
    const isUnlocked = lesson.is_unlocked ?? (lesson.order_index === 1);

    if (isDone) {
      return 'completed';
    }
    if (isUnlocked && !currentFound) {
      currentFound = true;
      return 'current';
    }
    if (!isUnlocked) {
      return 'locked';
    }
    // If unlocked but not the first one, still available
    return 'available';
  });

  return (
    <div className="relative py-4 pb-20">
      {/* Journey Map Header Banner */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 bg-emerald-100 text-[#2D5A34] text-xs font-black px-4 py-1.5 rounded-full shadow-sm">
          <span>🗺️</span>
          <span>LEARNING JOURNEY MAP</span>
        </span>
      </div>

      {/* Trail Container */}
      <div className="relative max-w-md mx-auto space-y-10">
        {lessons.map((lesson, i) => {
          const state = lessonStates[i];
          const isDone = state === 'completed';
          const isCurrent = state === 'current';
          const isLocked = state === 'locked';
          const offsetClass = OFFSETS[i % OFFSETS.length];

          return (
            <div key={lesson.id} className="relative">
              {/* Stepping Stones / Trail Connector */}
              {i < lessons.length - 1 && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-1 h-14 border-l-4 border-dashed border-emerald-300/70 pointer-events-none z-0" />
              )}

              {/* Treasure Landmark milestone after every 3 lessons */}
              {i > 0 && i % 3 === 0 && (
                <div className="flex justify-center my-6 z-10 relative">
                  <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-400 text-white px-5 py-2.5 rounded-full shadow-lg border-2 border-white transform hover:scale-105 transition-all">
                    <Gift className="w-5 h-5 animate-bounce" />
                    <span className="text-xs font-black tracking-wide">Mystery Chest Milestone!</span>
                    <Sparkles className="w-4 h-4 text-yellow-200" />
                  </div>
                </div>
              )}

              {/* Mushroom Node Item */}
              <div className={`flex ${offsetClass} z-10 relative`}>
                {isLocked ? (
                  // LOCKED NODE (non-link, triggers gentle prompt)
                  <button
                    type="button"
                    onClick={() => setLockedModalLesson(lesson)}
                    className="group flex flex-col items-center cursor-pointer transition-transform active:scale-95 text-center focus:outline-none"
                  >
                    {/* Mushroom Cap */}
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-b from-gray-200 to-gray-300 shadow-md flex items-center justify-center border-4 border-white">
                      <div className="text-4xl opacity-40 grayscale">{getLessonEmoji(lesson.topic)}</div>
                      <div className="absolute inset-0 bg-slate-900/30 rounded-full flex items-center justify-center backdrop-blur-[1px]">
                        <div className="w-10 h-10 rounded-full bg-slate-800/90 flex items-center justify-center shadow-lg">
                          <Lock className="w-5 h-5 text-amber-300" />
                        </div>
                      </div>
                    </div>
                    {/* Mushroom Stem & Label */}
                    <div className="mt-2 bg-white/90 backdrop-blur-sm px-3.5 py-1 rounded-full shadow-sm border border-gray-200">
                      <span className="text-xs font-black text-gray-400">Lesson {i + 1}: {lesson.title}</span>
                    </div>
                  </button>
                ) : (
                  // UNLOCKED NODE (Link)
                  <Link
                    href={`/missions/${gradeCode}/${lesson.id}`}
                    className={`group flex flex-col items-center transition-all hover:scale-105 active:scale-95 text-center ${
                      isCurrent ? 'gl-glow-pulse' : ''
                    }`}
                  >
                    {/* Current Indicator / Leafy speech bubble */}
                    {isCurrent && (
                      <div className="mb-2 animate-bounce flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-[#3A7D44] text-white text-xs font-black px-3.5 py-1 rounded-full shadow-md border border-white">
                        <span>🍃</span>
                        <span>Start Here!</span>
                      </div>
                    )}

                    {/* Mushroom Cap */}
                    <div
                      className={`relative w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-xl border-4 border-white transition-all ${
                        isDone
                          ? 'bg-gradient-to-b from-emerald-400 to-green-600 ring-4 ring-emerald-200'
                          : isCurrent
                          ? 'bg-gradient-to-b from-amber-400 to-emerald-500 ring-4 ring-yellow-300 shadow-emerald-400/40'
                          : 'bg-gradient-to-b from-teal-400 to-emerald-600'
                      }`}
                    >
                      <span>{getLessonEmoji(lesson.topic)}</span>

                      {/* Status Badges */}
                      {isDone && (
                        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
                          <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                        </div>
                      )}
                      {isCurrent && (
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Stem / Badge Label */}
                    <div
                      className={`mt-2 px-4 py-1.5 rounded-full shadow-md border transition-all ${
                        isDone
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : isCurrent
                          ? 'bg-gradient-to-r from-amber-400 to-emerald-500 text-white border-white'
                          : 'bg-white border-gray-100 text-[#3A7D44]'
                      }`}
                    >
                      <p className="text-xs font-black">
                        Lesson {i + 1}: {lesson.title}
                      </p>
                      {isDone && (
                        <p className="text-[10px] font-bold text-emerald-600 mt-0.5">
                          ✓ Completed • Replay
                        </p>
                      )}
                    </div>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gentle Modal when clicking a Locked Lesson */}
      {lockedModalLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 gl-pop-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 border-2 border-emerald-100 relative">
            <button
              onClick={() => setLockedModalLesson(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-gray-800">Lesson Locked!</h3>
              <p className="text-sm font-semibold text-gray-600 leading-relaxed">
                Your teacher will unlock <strong className="text-emerald-700">{lockedModalLesson.title}</strong> when your class is ready!
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setLockedModalLesson(null)}
                className="w-full bg-[#3A7D44] hover:bg-[#2D5A34] text-white font-extrabold py-3 rounded-2xl text-sm transition-all shadow-md"
              >
                Got it, Leafy! 🍃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
