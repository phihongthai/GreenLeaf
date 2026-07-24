'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import TeacherNav from '@/components/teacher/TeacherNav';

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
    <div className="min-h-screen bg-[#F7F4EC] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <TeacherNav active="students" />

        {loading ? (
          <p className="text-center text-gray-400 text-sm">Đang tải...</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
            {students.map((s) => {
              const reward = s.rewards?.[0];
              return (
                <div key={s.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="font-bold text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.grades?.name ?? '—'}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-[#2E4A34]">🍃 {reward?.leaf_count ?? 0}</span>
                    <span className="text-gray-400">🔥 {reward?.streak_days ?? 0}d</span>
                  </div>
                </div>
              );
            })}
            {students.length === 0 && <p className="text-center text-gray-400 text-sm py-8">Chưa có học sinh nào.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
