'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import TeacherNav from '@/components/teacher/TeacherNav';

interface ClassRow {
  id: string;
  name: string;
  ageRange: string;
  studentCount: number;
}

interface Stats {
  students: number;
  classes: number;
  pendingSubmissions: number;
}

export default function TeacherDashboardPage() {
  const [stats, setStats] = useState<Stats>({ students: 0, classes: 0, pendingSubmissions: 0 });
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const [{ data: grades }, { data: students }, { count: pending }] = await Promise.all([
        supabase.from('greenleaf_grades').select('id, name, age_range').order('order_index'),
        supabase.from('greenleaf_profiles').select('id, grade_id').eq('role', 'student'),
        // 'submitted' = học sinh đã nộp nhưng giáo viên chưa chấm ('graded').
        supabase
          .from('greenleaf_homework_submissions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'submitted'),
      ]);

      const studentRows = (students as { id: string; grade_id: string | null }[]) ?? [];
      const gradeRows = (grades as { id: string; name: string; age_range: string }[]) ?? [];

      setClasses(
        gradeRows.map((g) => ({
          id: g.id,
          name: g.name,
          ageRange: g.age_range,
          studentCount: studentRows.filter((s) => s.grade_id === g.id).length,
        }))
      );
      setStats({
        students: studentRows.length,
        classes: gradeRows.length,
        pendingSubmissions: pending ?? 0,
      });
      setLoading(false);
    };
    load();
  }, []);

  const STAT_CARDS = [
    { label: 'Học sinh', value: stats.students, tone: 'bg-emerald-50 text-gl-green' },
    { label: 'Lớp', value: stats.classes, tone: 'bg-sky-50 text-sky-700' },
    { label: 'Bài chờ chấm', value: stats.pendingSubmissions, tone: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="min-h-screen gl-playful-bg px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <TeacherNav active="dashboard" />

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3A7D44] to-[#213B26] pl-5 pr-4 pt-4 shadow-lg gl-pop-in">
          <div className="flex items-end gap-3">
            <div className="min-w-0 flex-1 pb-5">
              <p className="gl-display text-2xl font-extrabold leading-tight text-white">Chào thầy/cô!</p>
              <p className="mt-1 text-sm font-bold text-white/85">
                {stats.pendingSubmissions > 0
                  ? `Có ${stats.pendingSubmissions} bài viết đang chờ chấm.`
                  : 'Không có bài nào chờ chấm. Tuyệt vời!'}
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/leafy/outfit_presenting.webp"
              alt=""
              aria-hidden
              className="h-32 w-auto shrink-0 drop-shadow-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {STAT_CARDS.map((s) => (
            <div key={s.label} className={`rounded-2xl p-4 text-center ${s.tone}`}>
              <p className="text-3xl font-extrabold leading-none">{loading ? '—' : s.value}</p>
              <p className="mt-1.5 text-xs font-bold text-gl-muted">{s.label}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="gl-display mb-2 text-lg font-extrabold text-gl-green-dark">Các lớp</h2>
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-400">Đang tải...</p>
          ) : classes.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Chưa có lớp nào.</p>
          ) : (
            <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm">
              {classes.map((c) => (
                <li key={c.id}>
                  <Link
                    href="/teacher/students"
                    className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-bold text-gl-green-dark">{c.name}</p>
                      <p className="text-xs font-bold text-gl-muted">{c.ageRange}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-bold text-gl-green">{c.studentCount} học sinh</span>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
