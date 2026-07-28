'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import TeacherNav from '@/components/teacher/TeacherNav';
import type { Grade, WritingTopic } from '@/lib/types';

interface Assignment {
  id: string;
  due_date: string | null;
  created_at: string;
  topic: { title: string; grade_id: string } | null;
}

export default function TeacherHomeworkPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [topics, setTopics] = useState<WritingTopic[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const [showTopicForm, setShowTopicForm] = useState(false);
  const [topicGradeId, setTopicGradeId] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [topicPrompt, setTopicPrompt] = useState('');
  const [savingTopic, setSavingTopic] = useState(false);

  const [assignTopicId, setAssignTopicId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigning, setAssigning] = useState(false);

  const load = async () => {
    const supabase = createClient();
    const [{ data: gradesData }, { data: topicsData }, { data: assignmentsData }] = await Promise.all([
      supabase.from('greenleaf_grades').select('*').order('order_index'),
      supabase.from('greenleaf_writing_topics').select('*').order('created_at', { ascending: false }),
      supabase
        .from('greenleaf_homework_assignments')
        .select('id, due_date, created_at, topic:greenleaf_writing_topics(title, grade_id)')
        .order('created_at', { ascending: false }),
    ]);
    setGrades(gradesData ?? []);
    setTopics((topicsData as WritingTopic[]) ?? []);
    setAssignments((assignmentsData as unknown as Assignment[]) ?? []);
    if (gradesData && gradesData.length > 0) setTopicGradeId((g) => g || gradesData[0].id);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const gradeName = (id: string) => grades.find((g) => g.id === id)?.name ?? '—';

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim() || !topicPrompt.trim() || !topicGradeId) return;

    setSavingTopic(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('greenleaf_writing_topics').insert({
      grade_id: topicGradeId,
      title: topicTitle.trim(),
      prompt: topicPrompt.trim(),
      created_by: user?.id,
    });
    setTopicTitle('');
    setTopicPrompt('');
    setShowTopicForm(false);
    await load();
    setSavingTopic(false);
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Xoá đề bài này khỏi thư viện? Các lần đã giao dùng đề này cũng sẽ bị xoá.')) return;
    const supabase = createClient();
    await supabase.from('greenleaf_writing_topics').delete().eq('id', topicId);
    await load();
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTopicId) return;

    setAssigning(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('greenleaf_homework_assignments').insert({
      teacher_id: user?.id,
      topic_id: assignTopicId,
      due_date: dueDate || null,
    });
    setAssignTopicId('');
    setDueDate('');
    await load();
    setAssigning(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>;

  return (
    <div className="min-h-screen gl-playful-bg px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <TeacherNav active="homework" />

        {/* Giao bài: chọn đề có sẵn trong thư viện + hạn nộp */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
          <h2 className="font-extrabold text-gray-800 flex items-center gap-2"><Send className="w-4 h-4 text-[#3A7D44]" /> Giao bài tập</h2>
          {topics.length === 0 ? (
            <p className="text-sm text-gray-400">Thư viện chưa có đề bài nào — tạo đề bài mới bên dưới trước.</p>
          ) : (
            <form onSubmit={handleAssign} className="flex flex-wrap gap-3">
              <select
                required
                value={assignTopicId}
                onChange={(e) => setAssignTopicId(e.target.value)}
                className="flex-1 min-w-[200px] rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
              >
                <option value="" disabled>Chọn đề bài trong thư viện...</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{gradeName(t.grade_id)} — {t.title}</option>
                ))}
              </select>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
              />
              <button
                type="submit"
                disabled={assigning}
                className="bg-[#3A7D44] hover:bg-[#2E4A34] disabled:opacity-50 text-white font-bold py-2 px-5 rounded-xl text-sm transition-colors"
              >
                {assigning ? 'Đang giao...' : 'Giao bài'}
              </button>
            </form>
          )}
        </div>

        {/* Danh sách đã giao */}
        <div className="space-y-3">
          {assignments.map((a) => (
            <Link
              key={a.id}
              href={`/teacher/homework/${a.id}`}
              className="block bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">{a.topic?.title ?? '(đề bài đã bị xoá)'}</h3>
                <span className="text-xs text-gray-400 shrink-0">{a.topic ? gradeName(a.topic.grade_id) : ''}</span>
              </div>
              {a.due_date && <p className="text-xs text-gray-400 mt-1">Hạn nộp: {a.due_date}</p>}
            </Link>
          ))}
        </div>

        {/* Thư viện đề bài */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-[#3A7D44]">📚 Thư viện đề bài</h2>
            <button
              onClick={() => setShowTopicForm((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-bold text-[#3A7D44] hover:underline"
            >
              <Plus className="w-4 h-4" /> {showTopicForm ? 'Đóng' : 'Tạo đề bài mới'}
            </button>
          </div>

          {showTopicForm && (
            <form onSubmit={handleCreateTopic} className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
              <div className="flex gap-3">
                <select
                  value={topicGradeId}
                  onChange={(e) => setTopicGradeId(e.target.value)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
                >
                  {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <input
                  required
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder="Tiêu đề đề bài"
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
                />
              </div>
              <textarea
                required
                rows={3}
                value={topicPrompt}
                onChange={(e) => setTopicPrompt(e.target.value)}
                placeholder="Nội dung đề bài..."
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
              />
              <button
                type="submit"
                disabled={savingTopic}
                className="bg-[#3A7D44] hover:bg-[#2E4A34] disabled:opacity-50 text-white font-bold py-2 px-5 rounded-xl text-sm transition-colors"
              >
                {savingTopic ? 'Đang lưu...' : 'Thêm vào thư viện'}
              </button>
            </form>
          )}

          {topics.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Chưa có đề bài nào trong thư viện.</p>
          ) : (
            <div className="space-y-2">
              {topics.map((t) => (
                <div key={t.id} className="flex items-start gap-3 bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-700 text-sm">{t.title}</p>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-50 rounded-full px-2 py-0.5">{gradeName(t.grade_id)}</span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{t.prompt}</p>
                  </div>
                  <button onClick={() => handleDeleteTopic(t.id)} className="text-gray-300 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
