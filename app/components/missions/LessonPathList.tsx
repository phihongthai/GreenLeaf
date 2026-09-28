'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { LESSON_PALETTE } from '@/lib/missionTheme';
import { getLessonEmoji } from '@/lib/lessonEmoji';
import type { Lesson, WordsExplorerContent } from '@/lib/types';

interface LessonWithProgress extends Lesson {
  totalMissions: number;
  completedMissions: number;
  topic: string;
}

// In-memory cache for instant route transitions
const lessonPathCache = new Map<string, LessonWithProgress[]>();

// Duolingo-style lesson path list: every lesson is tappable to start practicing,
// with a progress bar + checkmark for completed lessons. Shared between the student
// home page (/grades) and the grade lesson list (/missions/[gradeCode]).
export default function LessonPathList({ gradeId, gradeCode }: { gradeId: string; gradeCode: string }) {
  const cached = gradeId ? lessonPathCache.get(gradeId) : undefined;
  const [lessons, setLessons] = useState<LessonWithProgress[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached);

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

      // 2. Batch fetch ALL missions for all lessons in ONE query
      const { data: missionsData } = await supabase
        .from('greenleaf_missions')
        .select('id, lesson_id, type, content')
        .in('lesson_id', lessonIds);

      const allMissions = (missionsData ?? []) as { id: string; lesson_id: string; type: string; content: unknown }[];
      const allMissionIds = allMissions.map((m) => m.id);

      // 3. Batch fetch ALL user progress in ONE query
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

  if (loading) return <p className="text-center text-gray-400 text-sm py-10">Loading...</p>;
  if (lessons.length === 0) return <p className="text-center text-gray-400 text-sm py-10">No lessons for this level yet.</p>;

  return (
    <div className="space-y-3.5">
      {lessons.map((lesson, i) => {
        const done = lesson.totalMissions > 0 && lesson.completedMissions >= lesson.totalMissions;
        const gradient = LESSON_PALETTE[i % LESSON_PALETTE.length];
        const ratio = lesson.totalMissions > 0 ? Math.min(100, (lesson.completedMissions / lesson.totalMissions) * 100) : 0;
        return (
          <Link
            key={lesson.id}
            href={`/missions/${gradeCode}/${lesson.id}`}
            prefetch={true}
            className="gl-lesson-card flex items-center gap-5 bg-white rounded-3xl p-5 shadow-sm hover:shadow-lg border-l-4 border-transparent"
            style={{ borderLeftColor: done ? '#3A7D44' : undefined }}
          >
            <div
              className={`gl-lesson-icon relative w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-md text-4xl bg-gradient-to-br ${
                done ? 'from-emerald-400 to-green-500' : gradient
              }`}
            >
              {getLessonEmoji(lesson.topic)}
              {done && (
                <span className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </span>
              )}
            </div>
            <div className="flex-1 space-y-2.5">
              <p className="text-xl font-extrabold text-[#3A7D44]">Lesson {i + 1}: {lesson.title}</p>
              <div className="relative h-3 max-w-[14rem] bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${done ? 'from-emerald-400 to-green-500' : gradient}`}
                  style={{ width: `${ratio}%` }}
                />
                <span
                  aria-hidden
                  className="gl-lesson-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent"
                />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
