'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AppHeader from '@/components/AppHeader';

interface Assignment {
  id: string;
  title: string;
  prompt: string;
}

interface Submission {
  id: string;
  student_id: string;
  content_text: string;
  status: 'submitted' | 'graded';
  submitted_at: string;
  profiles?: { name: string };
}

export default function AssignmentSubmissionsPage() {
  const params = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const supabase = createClient();
    const [{ data: assignmentData }, { data: submissionsData }] = await Promise.all([
      supabase.from('greenleaf_homework_assignments').select('id, title, prompt').eq('id', params.id).single(),
      supabase
        .from('greenleaf_homework_submissions')
        .select('id, student_id, content_text, status, submitted_at, profiles:greenleaf_profiles(name)')
        .eq('assignment_id', params.id)
        .order('submitted_at', { ascending: false }),
    ]);
    setAssignment(assignmentData);
    setSubmissions((submissionsData as unknown as Submission[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [params.id]);

  const markGraded = async (submissionId: string) => {
    const supabase = createClient();
    await supabase
      .from('greenleaf_homework_submissions')
      .update({ status: 'graded', graded_at: new Date().toISOString() })
      .eq('id', submissionId);
    await load();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>;
  if (!assignment) return <div className="min-h-screen flex items-center justify-center text-gray-400">Không tìm thấy bài tập.</div>;

  return (
    <div className="min-h-screen bg-[#F7F4EC] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <AppHeader backHref="/teacher/homework" backLabel="Danh sách bài tập" />

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h1 className="font-extrabold text-lg text-[#2E4A34]">{assignment.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{assignment.prompt}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-500">{submissions.length} bài nộp</h2>
          {submissions.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl shadow-sm p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800">{s.profiles?.name ?? 'Học sinh'}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  s.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {s.status === 'graded' ? 'Đã chấm' : 'Đã nộp'}
                </span>
              </div>
              <p className="text-sm bg-gray-50 rounded-xl p-3 whitespace-pre-wrap">{s.content_text}</p>
              {s.status === 'submitted' && (
                <button
                  onClick={() => markGraded(s.id)}
                  className="text-sm font-bold text-[#3A7D44] hover:underline"
                >
                  Đánh dấu đã chấm
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
