'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import TeacherNav from '@/components/teacher/TeacherNav';
import type { Grade } from '@/lib/types';

interface Assignment {
  id: string;
  title: string;
  prompt: string;
  due_date: string | null;
  grade_id: string;
  grades?: { name: string };
}

export default function TeacherHomeworkPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const supabase = createClient();
    const [{ data: gradesData }, { data: assignmentsData }] = await Promise.all([
      supabase.from('greenleaf_grades').select('*').order('order_index'),
      supabase.from('greenleaf_homework_assignments').select('*, grades:greenleaf_grades(name)').order('created_at', { ascending: false }),
    ]);
    setGrades(gradesData ?? []);
    setAssignments((assignmentsData as Assignment[]) ?? []);
    if (gradesData && gradesData.length > 0) setGradeId((g) => g || gradesData[0].id);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSaving(true);
    await supabase.from('greenleaf_homework_assignments').insert({
      teacher_id: user.id,
      grade_id: gradeId,
      title,
      prompt,
      due_date: dueDate || null,
    });
    setTitle('');
    setPrompt('');
    setDueDate('');
    await load();
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-[#F7F4EC] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <TeacherNav active="homework" />

        <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
          <h2 className="font-bold text-gray-800">Giao bài tập mới</h2>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
          />
          <textarea
            required
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Đề bài..."
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
          />
          <div className="flex gap-3">
            <select
              value={gradeId}
              onChange={(e) => setGradeId(e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
            >
              {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#3A7D44] hover:bg-[#2E4A34] disabled:opacity-50 text-white font-bold py-2 px-5 rounded-xl text-sm transition-colors"
          >
            {saving ? 'Đang giao...' : 'Giao bài'}
          </button>
        </form>

        <div className="space-y-3">
          {assignments.map((a) => (
            <Link
              key={a.id}
              href={`/teacher/homework/${a.id}`}
              className="block bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">{a.title}</h3>
                <span className="text-xs text-gray-400">{a.grades?.name}</span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-1">{a.prompt}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
