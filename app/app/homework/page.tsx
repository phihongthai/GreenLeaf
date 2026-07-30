'use client';

import { useEffect, useState } from 'react';
import { PenLine } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AppHeader from '@/components/AppHeader';
import BottomTabBar from '@/components/student/BottomTabBar';

interface Assignment {
  id: string;
  due_date: string | null;
  topic: { title: string; prompt: string; grade_id: string } | null;
}

interface Submission {
  assignment_id: string;
  content_text: string;
  status: 'submitted' | 'graded';
}

export default function StudentHomeworkPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('greenleaf_profiles').select('grade_id').eq('id', user.id).single();
    if (!profile?.grade_id) {
      setLoading(false);
      return;
    }

    const { data: assignmentsData } = await supabase
      .from('greenleaf_homework_assignments')
      .select('id, due_date, topic:greenleaf_writing_topics!inner(title, prompt, grade_id)')
      .eq('topic.grade_id', profile.grade_id)
      .order('due_date', { ascending: true });

    const { data: submissionsData } = await supabase
      .from('greenleaf_homework_submissions')
      .select('assignment_id, content_text, status')
      .eq('student_id', user.id);

    setAssignments((assignmentsData as unknown as Assignment[]) ?? []);
    const map: Record<string, Submission> = {};
    (submissionsData ?? []).forEach((s) => { map[s.assignment_id] = s as Submission; });
    setSubmissions(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (assignmentId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSavingId(assignmentId);
    await supabase.from('greenleaf_homework_submissions').upsert(
      {
        assignment_id: assignmentId,
        student_id: user.id,
        content_text: drafts[assignmentId] ?? '',
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      },
      { onConflict: 'assignment_id,student_id' }
    );
    await load();
    setSavingId(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen gl-playful-bg px-4 pt-8 pb-32">
      <div className="max-w-2xl mx-auto space-y-6">
        <AppHeader icon="✍️" title="Homework" backHref="/grades" />

        {assignments.length === 0 && (
          <div className="bg-white rounded-3xl shadow-sm p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <PenLine className="w-7 h-7 text-[#3A7D44]" />
            </div>
            <p className="font-bold text-gray-700">No homework yet</p>
            <p className="text-sm text-gray-400 max-w-xs">When your teacher assigns new homework, it will appear here for you to complete.</p>
          </div>
        )}

        {assignments.map((a) => {
          const sub = submissions[a.id];
          return (
            <div key={a.id} className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-bold text-gray-800">{a.topic?.title}</h2>
                {sub && (
                  <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
                    sub.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {sub.status === 'graded' ? 'Graded' : 'Submitted'}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{a.topic?.prompt}</p>
              {a.due_date && <p className="text-xs text-gray-400">Due: {a.due_date}</p>}

              {sub ? (
                <p className="text-sm bg-gray-50 rounded-xl p-3 whitespace-pre-wrap">{sub.content_text}</p>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={5}
                    value={drafts[a.id] ?? ''}
                    onChange={(e) => setDrafts((d) => ({ ...d, [a.id]: e.target.value }))}
                    placeholder="Write your answer here..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
                  />
                  <button
                    onClick={() => handleSubmit(a.id)}
                    disabled={savingId === a.id || !(drafts[a.id] ?? '').trim()}
                    className="bg-[#3A7D44] hover:bg-[#2E4A34] disabled:opacity-50 text-white font-bold py-2 px-5 rounded-xl text-sm transition-colors"
                  >
                    {savingId === a.id ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <BottomTabBar />
    </div>
  );
}
