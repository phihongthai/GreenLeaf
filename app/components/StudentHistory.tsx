'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Attempt {
  id: string;
  score: number;
  status: 'completed' | 'try_again';
  created_at: string;
  mission: { title: string; type: string; lesson: { title: string; grade: { name: string } | null } | null } | null;
}

interface Submission {
  id: string;
  status: 'submitted' | 'graded';
  submitted_at: string | null;
  assignment: { topic: { title: string; grade: { name: string } | null } | null } | null;
}

interface StudentInfo {
  name: string;
  grade: { name: string } | null;
}

const MISSION_LABEL: Record<string, string> = {
  words_explorer: 'Words Explorer',
  phonics: 'Phonics/Sentence Builder',
  speaking_challenge: 'Speaking Challenge',
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function dateKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

export default function StudentHistory({ studentId }: { studentId: string }) {
  const [info, setInfo] = useState<StudentInfo | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [{ data: profile }, { data: attemptsData }, { data: submissionsData }] = await Promise.all([
        supabase.from('greenleaf_profiles').select('name, grade:greenleaf_grades(name)').eq('id', studentId).single(),
        supabase
          .from('greenleaf_mission_attempts')
          .select('id, score, status, created_at, mission:greenleaf_missions(title, type, lesson:greenleaf_lessons(title, grade:greenleaf_grades(name)))')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false }),
        supabase
          .from('greenleaf_homework_submissions')
          .select('id, status, submitted_at, assignment:greenleaf_homework_assignments(topic:greenleaf_writing_topics(title, grade:greenleaf_grades(name)))')
          .eq('student_id', studentId)
          .order('submitted_at', { ascending: false }),
      ]);

      setInfo(profile as unknown as StudentInfo);
      setAttempts((attemptsData as unknown as Attempt[]) ?? []);
      setSubmissions((submissionsData as unknown as Submission[]) ?? []);
      setLoading(false);
    };
    load();
  }, [studentId]);

  if (loading) return <p className="text-center text-gray-400 text-sm py-10">Đang tải...</p>;

  const dailyCounts = attempts.reduce<Record<string, number>>((acc, a) => {
    const k = dateKey(a.created_at);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  const days = Object.entries(dailyCounts).sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 14);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm p-6 text-center space-y-1">
        <p className="text-2xl font-extrabold text-[#2E4A34]">{info?.name}</p>
        <p className="text-sm text-gray-400">{info?.grade?.name}</p>
        <div className="flex justify-center gap-6 pt-3 text-sm">
          <span><strong className="text-[#3A7D44]">{attempts.length}</strong> lần luyện Speaking</span>
          <span><strong className="text-[#3A7D44]">{submissions.length}</strong> bài Writing đã nộp</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-5 space-y-3">
        <h2 className="font-extrabold text-[#2E4A34] flex items-center gap-2 text-sm">
          <CalendarDays className="w-4 h-4" /> Số lần học theo ngày (14 ngày gần nhất có hoạt động)
        </h2>
        {days.length === 0 ? (
          <p className="text-sm text-gray-400">Chưa có hoạt động Speaking nào.</p>
        ) : (
          <div className="space-y-1.5">
            {days.map(([date, count]) => (
              <div key={date} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20 shrink-0">{date}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-[#3A7D44] rounded-full"
                    style={{ width: `${Math.min(100, count * 20)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-[#3A7D44] w-16 text-right shrink-0">{count} lần</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-5 space-y-3">
        <h2 className="font-extrabold text-[#2E4A34] text-sm">🎤 Lịch sử luyện Speaking</h2>
        {attempts.length === 0 ? (
          <p className="text-sm text-gray-400">Chưa có lần luyện nào.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {attempts.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                {a.status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {a.mission?.lesson?.grade?.name && (
                      <span className="text-[10px] font-bold text-white bg-[#3A7D44] rounded-full px-2 py-0.5 shrink-0">
                        {a.mission.lesson.grade.name}
                      </span>
                    )}
                    <p className="text-sm font-semibold text-gray-700 truncate">
                      {a.mission?.lesson?.title ?? '—'} · {a.mission ? MISSION_LABEL[a.mission.type] ?? a.mission.type : '—'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">{formatDateTime(a.created_at)}</p>
                </div>
                <span className={`text-sm font-extrabold shrink-0 ${a.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {Math.round(a.score)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-5 space-y-3">
        <h2 className="font-extrabold text-[#2E4A34] text-sm">✍️ Bài Writing đã nộp</h2>
        {submissions.length === 0 ? (
          <p className="text-sm text-gray-400">Chưa nộp bài viết nào.</p>
        ) : (
          <div className="space-y-2">
            {submissions.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                  {s.assignment?.topic?.grade?.name && (
                    <span className="text-[10px] font-bold text-white bg-[#3A7D44] rounded-full px-2 py-0.5 shrink-0">
                      {s.assignment.topic.grade.name}
                    </span>
                  )}
                  <p className="text-sm font-semibold text-gray-700 truncate">{s.assignment?.topic?.title ?? '—'}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
                  s.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {s.status === 'graded' ? 'Đã chấm' : 'Đã nộp'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
