'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, BookOpen, Pencil } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import TeacherNav from '@/components/teacher/TeacherNav';
import LessonForm, { type LessonInitialData } from '@/components/teacher/LessonForm';
import type { Grade, Lesson, Mission, WordsExplorerContent, PhonicsContent, SpeakingChallengeContent } from '@/lib/types';

export default function TeacherLessonsPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gradeId, setGradeId] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [missionCounts, setMissionCounts] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editInitial, setEditInitial] = useState<LessonInitialData | null>(null);
  const [editLoading, setEditLoading] = useState<string | null>(null);
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
    setEditingLesson(null);
    setEditInitial(null);
    setLoading(true);
    await loadLessons(id);
    setLoading(false);
  };

  const handleDelete = async (lessonId: string) => {
    if (!confirm('Xoá bài học này? Toàn bộ mission và tiến độ học sinh liên quan sẽ bị xoá theo.')) return;
    const supabase = createClient();
    await supabase.from('greenleaf_lessons').delete().eq('id', lessonId);
    if (editingLesson?.id === lessonId) {
      setEditingLesson(null);
      setEditInitial(null);
    }
    await loadLessons(gradeId);
  };

  const handleEdit = async (lesson: Lesson) => {
    setShowForm(false);
    setEditLoading(lesson.id);
    const supabase = createClient();
    const { data: missionsData } = await supabase
      .from('greenleaf_missions')
      .select('*')
      .eq('lesson_id', lesson.id);

    const missions = (missionsData as Mission[]) ?? [];
    const wordsM = missions.find((m) => m.type === 'words_explorer');
    const phonicsM = missions.find((m) => m.type === 'phonics');
    const speakingM = missions.find((m) => m.type === 'speaking_challenge');
    const wordsContent = wordsM?.content as WordsExplorerContent | undefined;
    const phonicsContent = phonicsM?.content as PhonicsContent | undefined;
    const speakingContent = speakingM?.content as SpeakingChallengeContent | undefined;

    setEditInitial({
      lessonTitle: lesson.title,
      topic: wordsContent?.topic ?? '',
      words: wordsContent?.words?.length
        ? wordsContent.words.map((w) => ({ word: w.word, meaning: w.meaning ?? '' }))
        : [{ word: '', meaning: '' }, { word: '', meaning: '' }, { word: '', meaning: '' }, { word: '', meaning: '' }, { word: '', meaning: '' }],
      phonicsTitle: phonicsM?.title ?? '',
      highlight: phonicsContent?.highlight ?? '',
      lines: phonicsContent?.lines?.length
        ? phonicsContent.lines.map((l) => ({
            text: l.text,
            imageDescription: l.imageDescription ?? '',
            imageUrl: l.imageUrl ?? '',
          }))
        : [
            { text: '', imageDescription: '', imageUrl: '' },
            { text: '', imageDescription: '', imageUrl: '' },
            { text: '', imageDescription: '', imageUrl: '' },
            { text: '', imageDescription: '', imageUrl: '' },
          ],
      prompt: speakingContent?.prompt ?? '',
      script: speakingContent?.script ?? '',
      speakingImageDescription: speakingContent?.imageDescription ?? '',
      speakingImageUrl: speakingContent?.imageUrl ?? '',
    });
    setEditingLesson(lesson);
    setEditLoading(null);
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
          onClick={() => {
            setEditingLesson(null);
            setEditInitial(null);
            setShowForm((v) => !v);
          }}
          className="flex items-center gap-2 bg-white rounded-2xl px-5 py-3 shadow-sm hover:shadow-md transition-all font-extrabold text-[#3A7D44]"
        >
          <Plus className="w-5 h-5" /> {showForm ? 'Đóng form' : 'Tạo bài học mới'}
        </button>

        {showForm && gradeId && (
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <LessonForm
              key="create"
              gradeId={gradeId}
              onCreated={async () => {
                setShowForm(false);
                await loadLessons(gradeId);
              }}
            />
          </div>
        )}

        {editingLesson && editInitial && (
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <p className="font-extrabold text-sm text-[#3A7D44] mb-4">✏️ Sửa bài học: {editingLesson.title}</p>
            <LessonForm
              key={editingLesson.id}
              gradeId={gradeId}
              lessonId={editingLesson.id}
              initial={editInitial}
              onCreated={async () => {
                setEditingLesson(null);
                setEditInitial(null);
                await loadLessons(gradeId);
              }}
              onCancel={() => {
                setEditingLesson(null);
                setEditInitial(null);
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
                  onClick={() => handleEdit(lesson)}
                  disabled={editLoading === lesson.id}
                  className="text-gray-300 hover:text-[#3A7D44] transition-colors shrink-0 disabled:opacity-50"
                >
                  <Pencil className="w-4 h-4" />
                </button>
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
