'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import BraveMascot from '@/components/mascot/BraveMascot';
import AppHeader from '@/components/AppHeader';
import type { Grade } from '@/lib/types';

const GRADE_EMOJI: Record<string, string> = {
  kindergarten: '🧸',
  kids1: '🚗',
  kids2: '🏙️',
  teens: '🎓',
};

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [myGrade, setMyGrade] = useState<Grade | null>(null);
  const [leafCount, setLeafCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showOtherGrades, setShowOtherGrades] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const [{ data: gradesData }, { data: profile }, { data: rewardData }] = await Promise.all([
        supabase.from('greenleaf_grades').select('*').order('order_index'),
        user ? supabase.from('greenleaf_profiles').select('grade_id').eq('id', user.id).single() : Promise.resolve({ data: null }),
        user ? supabase.from('greenleaf_rewards').select('leaf_count').eq('student_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
      ]);

      const allGrades = gradesData ?? [];
      setGrades(allGrades);
      setMyGrade(allGrades.find((g) => g.id === profile?.grade_id) ?? null);
      setLeafCount(rewardData?.leaf_count ?? 0);
      setLoading(false);
    };
    load();
  }, []);

  const otherGrades = grades.filter((g) => g.id !== myGrade?.id);

  return (
    <div className="min-h-screen bg-[#F7F4EC] px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <AppHeader
          rightExtra={
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm">
              <span>🍃</span>
              <span className="font-bold text-[#2E4A34]">{leafCount} Leaves</span>
            </div>
          }
        />

        <BraveMascot size="lg" message="Hello, my name's Brave. Welcome to GreenLeaf. Let's have fun!" />

        {loading ? (
          <p className="text-center text-gray-400 text-sm">Đang tải...</p>
        ) : myGrade ? (
          <Link
            href={`/missions/${myGrade.code}`}
            className="block bg-white rounded-3xl p-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center space-y-2"
          >
            <div className="text-5xl">{GRADE_EMOJI[myGrade.code] ?? '📘'}</div>
            <p className="text-sm font-semibold text-gray-400">Cấp độ của bạn</p>
            <p className="text-2xl font-extrabold text-[#2E4A34]">{myGrade.name}</p>
            <span className="inline-block mt-2 bg-[#3A7D44] text-white font-bold px-6 py-2.5 rounded-xl">
              Bắt đầu học →
            </span>
          </Link>
        ) : (
          <div>
            <h2 className="text-center text-lg font-extrabold text-[#2E4A34] mb-4">Chọn cấp độ của bạn</h2>
            <div className="grid grid-cols-2 gap-4">
              {grades.map((grade) => (
                <Link
                  key={grade.id}
                  href={`/missions/${grade.code}`}
                  className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center space-y-1"
                >
                  <div className="text-3xl">{GRADE_EMOJI[grade.code] ?? '📘'}</div>
                  <p className="font-bold text-gray-700">{grade.name}</p>
                  <p className="text-xs text-gray-400">{grade.age_range}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && myGrade && otherGrades.length > 0 && (
          <div>
            <button
              onClick={() => setShowOtherGrades((v) => !v)}
              className="mx-auto flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Xem thử cấp độ khác {showOtherGrades ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showOtherGrades && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {otherGrades.map((grade) => (
                  <Link
                    key={grade.id}
                    href={`/missions/${grade.code}`}
                    className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-center space-y-1"
                  >
                    <div className="text-2xl">{GRADE_EMOJI[grade.code] ?? '📘'}</div>
                    <p className="font-bold text-gray-600 text-sm">{grade.name}</p>
                    <p className="text-xs text-gray-400">{grade.age_range}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center gap-6 text-sm">
          <Link href="/journey" className="text-[#3A7D44] font-semibold hover:underline">🌳 Learning Journey</Link>
          <Link href="/homework" className="text-[#3A7D44] font-semibold hover:underline">✍️ Homework</Link>
        </div>
      </div>
    </div>
  );
}
