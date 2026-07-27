'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { LESSON_PALETTE } from '@/lib/missionTheme';
import type { Lesson } from '@/lib/types';

interface LessonWithProgress extends Lesson {
  totalMissions: number;
  completedMissions: number;
}

// Danh sách bài học dạng "path" kiểu Duolingo: bài nào cũng bấm vào là luyện được ngay,
// có thanh tiến độ + dấu tick cho bài đã xong. Dùng chung cho trang chủ học sinh (/grades)
// và trang xem bài học theo cấp độ (/missions/[gradeCode]).
export default function LessonPathList({ gradeId, gradeCode }: { gradeId: string; gradeCode: string }) {
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { data: lessonsData } = await supabase
        .from('greenleaf_lessons')
        .select('*')
        .eq('grade_id', gradeId)
        .order('order_index');

      const lessonsWithProgress = await Promise.all(
        ((lessonsData as Lesson[]) ?? []).map(async (lesson) => {
          const { data: missions } = await supabase
            .from('greenleaf_missions')
            .select('id')
            .eq('lesson_id', lesson.id);
          const missionIds = (missions ?? []).map((m) => m.id);

          let completedMissions = 0;
          if (user && missionIds.length > 0) {
            const { count } = await supabase
              .from('greenleaf_student_progress')
              .select('id', { count: 'exact', head: true })
              .eq('student_id', user.id)
              .eq('status', 'completed')
              .in('mission_id', missionIds);
            completedMissions = count ?? 0;
          }

          return { ...lesson, totalMissions: missionIds.length, completedMissions };
        })
      );

      if (!active) return;
      setLessons(lessonsWithProgress);
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [gradeId]);

  if (loading) return <p className="text-center text-gray-400 text-sm py-10">Đang tải...</p>;
  if (lessons.length === 0) return <p className="text-center text-gray-400 text-sm py-10">Chưa có bài học nào cho cấp độ này.</p>;

  return (
    <div className="space-y-3">
      {lessons.map((lesson, i) => {
        const done = lesson.totalMissions > 0 && lesson.completedMissions >= lesson.totalMissions;
        const gradient = LESSON_PALETTE[i % LESSON_PALETTE.length];
        const ratio = lesson.totalMissions > 0 ? Math.min(100, (lesson.completedMissions / lesson.totalMissions) * 100) : 0;
        return (
          <Link
            key={lesson.id}
            href={`/missions/${gradeCode}/${lesson.id}`}
            className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                done ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white' : `bg-gradient-to-br ${gradient} text-white`
              }`}
            >
              {done ? <CheckCircle2 className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
            </div>
            <div className="flex-1 space-y-1.5">
              <p className="font-extrabold text-gray-700">Bài {i + 1}: {lesson.title}</p>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 max-w-[8rem] bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${done ? 'from-emerald-400 to-green-500' : gradient}`}
                    style={{ width: `${ratio}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">{lesson.completedMissions}/{lesson.totalMissions} mission</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
