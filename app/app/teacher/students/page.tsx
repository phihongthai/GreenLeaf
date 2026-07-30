'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import TeacherNav from '@/components/teacher/TeacherNav';
import AppFooter from '@/components/AppFooter';

interface StudentRow {
  id: string;
  name: string;
  grades?: { name: string };
  rewards?: { leaf_count: number; streak_days: number }[];
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('greenleaf_profiles')
        .select('id, name, grades:greenleaf_grades(name), rewards:greenleaf_rewards(leaf_count, streak_days)')
        .eq('role', 'student')
        .order('name');
      setStudents((data as unknown as StudentRow[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen gl-playful-bg px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <TeacherNav active="students" />

        {loading ? (
          <p className="text-center text-gray-400 text-sm">Loading...</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
            {students.map((s) => {
              const reward = s.rewards?.[0];
              return (
                <Link
                  key={s.id}
                  href={`/teacher/students/${s.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-bold text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.grades?.name ?? '—'}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-[#3A7D44]">🍃 {reward?.leaf_count ?? 0}</span>
                    <span className="text-gray-400">🔥 {reward?.streak_days ?? 0}d</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </Link>
              );
            })}
            {students.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No students yet.</p>}
          </div>
        )}
      </div>
      <AppFooter />
    </div>
  );
}
