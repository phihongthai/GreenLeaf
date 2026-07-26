'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Lesson } from '@/lib/types';

interface LessonWithProgress extends Lesson {
  totalMissions: number;
  completedMissions: number;
}

export default function LessonListPage() {
  const params = useParams<{ gradeCode: string }>();
  const [gradeName, setGradeName] = useState('');
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { data: grade } = await supabase
        .from('greenleaf_grades')
        .select('id, name')
        .eq('code', params.gradeCode)
        .single();

      if (!grade) {
        setLoading(false);
        return;
      }
      setGradeName(grade.name);

      const { data: lessonsData } = await supabase
        .from('greenleaf_lessons')
        .select('*')
        .eq('grade_id', grade.id)
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

      setLessons(lessonsWithProgress);
      setLoading(false);
    };
    load();
  }, [params.gradeCode]);

  return (
    <div className="min-h-screen gl-playful-bg px-4 py-8">
      <div className="max-w-xl mx-auto space-y-6">
        <Link
          href="/grades"
          className="inline-flex items-center gap-1.5 bg-white rounded-full pl-2.5 pr-3.5 py-1.5 text-sm font-bold text-[#3A7D44] shadow-sm hover:bg-emerald-50 hover:shadow transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Trang chính
        </Link>

        <h1 className="text-xl font-extrabold text-[#2E4A34] text-center">{gradeName}</h1>

        {loading ? (
          <p className="text-center text-gray-400 text-sm py-10">Đang tải...</p>
        ) : lessons.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">Chưa có bài học nào cho cấp độ này.</p>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, i) => {
              const done = lesson.totalMissions > 0 && lesson.completedMissions >= lesson.totalMissions;
              return (
                <Link
                  key={lesson.id}
                  href={`/missions/${params.gradeCode}/${lesson.id}`}
                  className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      done ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-50 text-[#C9A876]'
                    }`}
                  >
                    {done ? <CheckCircle2 className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-gray-700">Bài {i + 1}: {lesson.title}</p>
                    <p className="text-xs text-gray-400">{lesson.completedMissions}/{lesson.totalMissions} mission hoàn thành</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
