'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Lock, LockOpen, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { fetchLessonAccess } from '@/lib/lessonAccess';

interface Attempt {
  id: string;
  score: number;
  status: 'completed' | 'try_again';
  item_label: string | null;
  created_at: string;
  mission_id: string;
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
  grade_id: string | null;
  grade: { name: string } | null;
}

interface LessonRow {
  id: string;
  title: string;
  order_index: number;
  is_unlocked: boolean;
  missions: { id: string; type: string; title: string; order_index: number }[];
}

interface ProgressRow {
  mission_id: string;
  status: string;
}

interface ItemSummary {
  label: string;
  tries: number;
  best: number;
}

const MISSION_LABEL: Record<string, string> = {
  words_explorer: 'Words Explorer',
  phonics: 'Phonics/Sentence Builder',
  speaking_challenge: 'Speaking Challenge',
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function dateKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

export default function StudentHistory({ studentId }: { studentId: string }) {
  const [info, setInfo] = useState<StudentInfo | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [access, setAccess] = useState<Map<string, boolean>>(new Map());
  const [accessError, setAccessError] = useState<string | null>(null);
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [{ data: profile }, { data: attemptsData }, { data: submissionsData }] = await Promise.all([
        supabase.from('greenleaf_profiles').select('name, grade_id, grade:greenleaf_grades(name)').eq('id', studentId).single(),
        supabase
          .from('greenleaf_mission_attempts')
          .select('id, score, status, item_label, created_at, mission_id, mission:greenleaf_missions(title, type, lesson:greenleaf_lessons(title, grade:greenleaf_grades(name)))')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false }),
        supabase
          .from('greenleaf_homework_submissions')
          .select('id, status, submitted_at, assignment:greenleaf_homework_assignments(topic:greenleaf_writing_topics(title, grade:greenleaf_grades(name)))')
          .eq('student_id', studentId)
          .order('submitted_at', { ascending: false }),
      ]);

      const gradeId = (profile as { grade_id?: string | null } | null)?.grade_id;
      if (gradeId) {
        const [{ data: lessonData }, { data: progressData }, accessMap] = await Promise.all([
          supabase
            .from('greenleaf_lessons')
            .select('id, title, order_index, is_unlocked, missions:greenleaf_missions(id, type, title, order_index)')
            .eq('grade_id', gradeId)
            .order('order_index'),
          supabase.from('greenleaf_student_progress').select('mission_id, status').eq('student_id', studentId),
          fetchLessonAccess(supabase, studentId),
        ]);
        setAccess(accessMap);
        setLessons((lessonData as unknown as LessonRow[]) ?? []);
        setProgress((progressData as unknown as ProgressRow[]) ?? []);
      }

      setInfo(profile as unknown as StudentInfo);
      setAttempts((attemptsData as unknown as Attempt[]) ?? []);
      setSubmissions((submissionsData as unknown as Submission[]) ?? []);
      setLoading(false);
    };
    load();
  }, [studentId]);

  if (loading) return <p className="text-center text-gray-400 text-sm py-10">Loading...</p>;

  const dailyCounts = attempts.reduce<Record<string, number>>((acc, a) => {
    const k = dateKey(a.created_at);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  const days = Object.entries(dailyCounts).sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 14);

  const attemptsByMission = attempts.reduce<Record<string, Attempt[]>>((acc, a) => {
    (acc[a.mission_id] ??= []).push(a);
    return acc;
  }, {});
  const doneMissions = new Set(progress.filter((p) => p.status === 'completed').map((p) => p.mission_id));

  // attempts arrive newest-first, so the first one seen per item is the latest
  const summarize = (list: Attempt[]): ItemSummary[] => {
    const map = new Map<string, ItemSummary>();
    for (const a of list) {
      const label = a.item_label ?? '—';
      const cur = map.get(label);
      if (!cur) map.set(label, { label, tries: 1, best: a.score });
      else {
        cur.tries += 1;
        cur.best = Math.max(cur.best, a.score);
      }
    }
    return Array.from(map.values()).sort((x, y) => x.best - y.best);
  };

  // true/false force this lesson open/locked for the student; null removes the override (back to the class default)
  const setLessonAccess = async (lesson: LessonRow, unlocked: boolean | null) => {
    setAccessError(null);
    const supabase = createClient();
    const { error } = unlocked === null
      ? await supabase.from('greenleaf_student_lesson_access').delete().eq('student_id', studentId).eq('lesson_id', lesson.id)
      : await supabase.from('greenleaf_student_lesson_access').upsert({ student_id: studentId, lesson_id: lesson.id, unlocked });
    if (error) {
      setAccessError(error.message);
      return;
    }
    setAccess((prev) => {
      const next = new Map(prev);
      if (unlocked === null) next.delete(lesson.id);
      else next.set(lesson.id, unlocked);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm p-6 text-center space-y-1">
        <p className="text-2xl font-extrabold text-[#3A7D44]">{info?.name}</p>
        <p className="text-sm text-gray-400">{info?.grade?.name}</p>
        <div className="flex justify-center gap-6 pt-3 text-sm">
          <span><strong className="text-[#3A7D44]">{attempts.length}</strong> Speaking attempts</span>
          <span><strong className="text-[#3A7D44]">{submissions.length}</strong> Writing submissions</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-5 space-y-3">
        <h2 className="font-extrabold text-[#3A7D44] text-sm">📚 Progress by lesson</h2>
        {lessons.length === 0 ? (
          <p className="text-sm text-gray-400">No lessons for this level yet.</p>
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson) => {
              const missions = [...lesson.missions].sort((a, b) => a.order_index - b.order_index);
              const lessonAttempts = missions.flatMap((m) => attemptsByMission[m.id] ?? []);
              const done = missions.filter((m) => doneMissions.has(m.id)).length;
              const isOpen = openLesson === lesson.id;
              return (
                <div key={lesson.id} className="rounded-xl bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setOpenLesson(isOpen ? null : lesson.id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-2 p-3 text-left"
                  >
                    <span className="text-sm font-semibold text-gray-700 truncate">
                      {access.has(lesson.id) && (access.get(lesson.id) ? <LockOpen className="inline w-3 h-3 mr-1 text-emerald-600" aria-label="Opened for this student" /> : <Lock className="inline w-3 h-3 mr-1 text-red-600" aria-label="Locked for this student" />)}
                      {lesson.title}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
                      done === missions.length && missions.length > 0
                        ? 'bg-emerald-100 text-emerald-700'
                        : lessonAttempts.length > 0
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-200 text-gray-500'
                    }`}>
                      {lessonAttempts.length === 0 && done === 0 ? 'Not started' : `${done}/${missions.length} done`}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {access.has(lesson.id) ? (
                          <>
                            <span className={`font-bold px-2 py-1 rounded-full ${access.get(lesson.id) ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {access.get(lesson.id) ? 'Opened for this student' : 'Locked for this student'}
                            </span>
                            <button type="button" onClick={() => setLessonAccess(lesson, !access.get(lesson.id))}
                              className="inline-flex items-center gap-1 font-bold text-[#3A7D44] px-2 py-1 rounded-full bg-white border border-gray-200">
                              {access.get(lesson.id) ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
                              {access.get(lesson.id) ? 'Lock' : 'Open'}
                            </button>
                            <button type="button" onClick={() => setLessonAccess(lesson, null)}
                              className="font-bold text-gray-500 px-2 py-1 rounded-full bg-white border border-gray-200">
                              Use class default
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-500">Class default ({lesson.is_unlocked ? 'open' : 'opens after the previous lesson'})</span>
                            <button type="button" onClick={() => setLessonAccess(lesson, true)}
                              className="inline-flex items-center gap-1 font-bold text-[#3A7D44] px-2 py-1 rounded-full bg-white border border-gray-200">
                              <LockOpen className="w-3 h-3" /> Open for this student
                            </button>
                            <button type="button" onClick={() => setLessonAccess(lesson, false)}
                              className="inline-flex items-center gap-1 font-bold text-red-700 px-2 py-1 rounded-full bg-white border border-gray-200">
                              <Lock className="w-3 h-3" /> Lock for this student
                            </button>
                          </>
                        )}
                      </div>
                      {accessError && <p className="text-xs text-red-600">{accessError}</p>}
                      {missions.map((m) => {
                        const items = summarize(attemptsByMission[m.id] ?? []);
                        return (
                          <div key={m.id} className="space-y-1">
                            <p className="text-xs font-bold text-[#3A7D44]">
                              {MISSION_LABEL[m.type] ?? m.type} {doneMissions.has(m.id) ? '✓' : ''}
                            </p>
                            {items.length === 0 ? (
                              <p className="text-xs text-gray-400">No attempts.</p>
                            ) : (
                              items.map((it) => (
                                <div key={it.label} className="flex items-center gap-2 text-xs">
                                  <span className="flex-1 truncate text-gray-700">{it.label}</span>
                                  <span className="text-gray-400 shrink-0">{it.tries}×</span>
                                  <span className={`font-extrabold w-8 text-right shrink-0 ${it.best >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {Math.round(it.best)}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <p className="text-[11px] text-gray-400">Per item: number of tries and best score. Weakest items first.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-5 space-y-3">
        <h2 className="font-extrabold text-[#3A7D44] flex items-center gap-2 text-sm">
          <CalendarDays className="w-4 h-4" /> Daily activity (last 14 active days)
        </h2>
        {days.length === 0 ? (
          <p className="text-sm text-gray-400">No speaking activity yet.</p>
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
                <span className="text-xs font-bold text-[#3A7D44] w-16 text-right shrink-0">{count} times</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-5 space-y-3">
        <h2 className="font-extrabold text-[#3A7D44] text-sm">🎤 Speaking History</h2>
        {attempts.length === 0 ? (
          <p className="text-sm text-gray-400">No speaking attempts yet.</p>
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
                      {a.item_label && <span className="text-gray-400 font-normal"> — &quot;{a.item_label}&quot;</span>}
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
        <h2 className="font-extrabold text-[#3A7D44] text-sm">✍️ Writing Submissions</h2>
        {submissions.length === 0 ? (
          <p className="text-sm text-gray-400">No writing submissions yet.</p>
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
                  {s.status === 'graded' ? 'Graded' : 'Submitted'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
