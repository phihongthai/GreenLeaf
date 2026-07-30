'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';

interface Assignment {
  id: string;
  topic: { title: string; prompt: string } | null;
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
      supabase.from('greenleaf_homework_assignments').select('id, topic:greenleaf_writing_topics(title, prompt)').eq('id', params.id).single(),
      supabase
        .from('greenleaf_homework_submissions')
        .select('id, student_id, content_text, status, submitted_at, profiles:greenleaf_profiles(name)')
        .eq('assignment_id', params.id)
        .order('submitted_at', { ascending: false }),
    ]);
    setAssignment(assignmentData as unknown as Assignment);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  if (!assignment) return <div className="min-h-screen flex items-center justify-center text-gray-400">Assignment not found.</div>;

  return (
    <div className="min-h-screen gl-playful-bg px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <AppHeader backHref="/teacher/homework" backLabel="Assignment list" />

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h1 className="font-extrabold text-lg text-[#3A7D44]">{assignment.topic?.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{assignment.topic?.prompt}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-500">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</h2>
          {submissions.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl shadow-sm p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800">{s.profiles?.name ?? 'Student'}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  s.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {s.status === 'graded' ? 'Graded' : 'Submitted'}
                </span>
              </div>
              <p className="text-sm bg-gray-50 rounded-xl p-3 whitespace-pre-wrap">{s.content_text}</p>
              {s.status === 'submitted' && (
                <button
                  onClick={() => markGraded(s.id)}
                  className="text-sm font-bold text-[#3A7D44] hover:underline"
                >
                  Mark as graded
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
