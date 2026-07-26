'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import TeacherNav from '@/components/teacher/TeacherNav';
import LessonForm from '@/components/teacher/LessonForm';
import type { Grade, Lesson } from '@/lib/types';

export default function TeacherLessonsPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gradeId, setGradeId] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [missionCounts, setMissionCounts] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadLessons = async (targetGradeId: string) => {
    const supabase = createClient();
    const { data: lessonsData } = await supabase
      .from('greenleaf_lessons')
      .select('*')
      .eq('grade_id', targetGradeId)
      .order('order_index');

    const list = (lessonsData as Lesson[]) ?? [];
    setLessons(list);

    const counts: Record<string, number> = {};
    await Promise.all(
      list.map(async (lesson) => {
        const { count } = await supabase
          .from('greenleaf_missions')
          .select('id', { count: 'exact', head: true })
          .eq('lesson_id', lesson.id);
        counts[lesson.id] = count ?? 0;
      })
    );
    setMissionCounts(counts);
  };

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: gradesData } = await supabase.from('greenleaf_grades').select('*').order('order_index');
      setGrades(gradesData ?? []);
      const firstId = gradesData?.[0]?.id ?? '';
      setGradeId(firstId);
      if (firstId) await loadLessons(firstId);
      setLoading(false);
    };
    init();
  }, []);

  const handleGradeChange = async (id: string) => {
    setGradeId(id);
    setShowForm(false);
    setLoading(true);
    await loadLessons(id);
    setLoading(false);
  };

  const handleDelete = async (lessonId: string) => {
    if (!confirm('Xoá bài học này? Toàn bộ mission và tiến độ học sinh liên quan sẽ bị xoá theo.')) return;
    const supabase = createClient();
    await supabase.from('greenleaf_lessons').delete().eq('id', lessonId);
    await loadLessons(gradeId);
  };

  return (
    <div className="min-h-screen gl-playful-bg px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <TeacherNav active="lessons" />

        <div className="flex gap-2 overflow-x-auto pb-1">
          {grades.map((g) => (
            <button
              key={g.id}
              onClick={() => handleGradeChange(g.id)}
              className={`shrink-0 text-sm font-bold px-4 py-2 rounded-full transition-colors ${
                gradeId === g.id ? 'bg-[#3A7D44] text-white' : 'bg-white text-gray-500 shadow-sm hover:bg-gray-50'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-white rounded-2xl px-5 py-3 shadow-sm hover:shadow-md transition-all font-extrabold text-[#3A7D44]"
        >
          <Plus className="w-5 h-5" /> {showForm ? 'Đóng form' : 'Tạo bài học mới'}
        </button>

        {showForm && gradeId && (
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <LessonForm
              gradeId={gradeId}
              onCreated={async () => {
                setShowForm(false);
                await loadLessons(gradeId);
              }}
            />
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-400 text-sm py-10">Đang tải...</p>
        ) : lessons.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">Chưa có bài học nào cho cấp độ này.</p>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, i) => (
              <div key={lesson.id} className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#3A7D44] shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-gray-700">Bài {i + 1}: {lesson.title}</p>
                  <p className="text-xs text-gray-400">{missionCounts[lesson.id] ?? 0} mission</p>
                </div>
                <button
                  onClick={() => handleDelete(lesson.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
