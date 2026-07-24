'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import BraveMascot from '@/components/mascot/BraveMascot';
import type { Grade } from '@/lib/types';

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [leafCount, setLeafCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const [{ data: gradesData }, { data: rewardData }] = await Promise.all([
        supabase.from('greenleaf_grades').select('*').order('order_index'),
        user ? supabase.from('greenleaf_rewards').select('leaf_count').eq('student_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
      ]);

      setGrades(gradesData ?? []);
      setLeafCount(rewardData?.leaf_count ?? 0);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F4EC] px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex justify-end">
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm">
            <span>🍃</span>
            <span className="font-bold text-[#2E4A34]">{leafCount} Leaves</span>
          </div>
        </div>

        <BraveMascot size="lg" message="Hello, my name's Brave. Welcome to GreenLeaf. Let's have fun!" />

        <div>
          <h2 className="text-center text-lg font-extrabold text-[#2E4A34] mb-4">Chọn cấp độ của bạn</h2>
          {loading ? (
            <p className="text-center text-gray-400 text-sm">Đang tải...</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {grades.map((grade) => (
                <Link
                  key={grade.id}
                  href={`/missions/${grade.code}`}
                  className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center space-y-1"
                >
                  <div className="text-3xl">
                    {grade.code === 'kindergarten' ? '🧸' : grade.code === 'kids1' ? '🚗' : grade.code === 'kids2' ? '🏙️' : '🎓'}
                  </div>
                  <p className="font-bold text-gray-700">{grade.name}</p>
                  <p className="text-xs text-gray-400">{grade.age_range}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center gap-6 text-sm">
          <Link href="/journey" className="text-[#3A7D44] font-semibold hover:underline">🌳 Learning Journey</Link>
          <Link href="/homework" className="text-[#3A7D44] font-semibold hover:underline">✍️ Homework</Link>
        </div>
      </div>
    </div>
  );
}
