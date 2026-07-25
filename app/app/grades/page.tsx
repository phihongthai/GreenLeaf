'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, TreePine, PenLine } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import BraveMascot from '@/components/mascot/BraveMascot';
import AppHeader from '@/components/AppHeader';
import type { Grade } from '@/lib/types';

const GRADE_THEME: Record<string, { emoji: string; gradient: string; ring: string }> = {
  kindergarten: { emoji: '🧸', gradient: 'from-amber-300 to-orange-400', ring: 'ring-amber-200' },
  kids1: { emoji: '🚗', gradient: 'from-sky-400 to-blue-500', ring: 'ring-sky-200' },
  kids2: { emoji: '🏙️', gradient: 'from-violet-400 to-purple-500', ring: 'ring-violet-200' },
  teens: { emoji: '🎓', gradient: 'from-teal-500 to-cyan-600', ring: 'ring-teal-200' },
};

function themeOf(code: string) {
  return GRADE_THEME[code] ?? { emoji: '📘', gradient: 'from-gray-300 to-gray-400', ring: 'ring-gray-200' };
}

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
    <div className="min-h-screen gl-playful-bg px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <AppHeader
          rightExtra={
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-md">
              <span className="gl-sparkle inline-block">🍃</span>
              <span className="font-extrabold text-[#2E4A34]">{leafCount} Leaves</span>
            </div>
          }
        />

        <BraveMascot size="lg" message="Hello, my name's Brave. Welcome to GreenLeaf. Let's have fun!" />

        {loading ? (
          <p className="text-center text-gray-400 text-sm">Đang tải...</p>
        ) : myGrade ? (
          <Link
            href={`/missions/${myGrade.code}`}
            className={`group block rounded-[2rem] p-1 bg-gradient-to-br ${themeOf(myGrade.code).gradient} shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all gl-pop-in`}
          >
            <div className="bg-white/95 rounded-[1.7rem] p-8 text-center space-y-2">
              <div className="text-7xl transition-transform group-hover:scale-110 group-hover:-rotate-6 duration-300">
                {themeOf(myGrade.code).emoji}
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Cấp độ của bạn</p>
              <p className="text-3xl font-extrabold text-[#2E4A34]">{myGrade.name}</p>
              <span
                className={`inline-block mt-3 bg-gradient-to-r ${themeOf(myGrade.code).gradient} text-white font-extrabold px-8 py-3 rounded-2xl shadow-md group-hover:scale-105 group-active:scale-95 transition-transform`}
              >
                Bắt đầu học →
              </span>
            </div>
          </Link>
        ) : (
          <div>
            <h2 className="text-center text-xl font-extrabold text-[#2E4A34] mb-4">Chọn cấp độ của bạn</h2>
            <div className="grid grid-cols-2 gap-4">
              {grades.map((grade) => {
                const t = themeOf(grade.code);
                return (
                  <Link
                    key={grade.id}
                    href={`/missions/${grade.code}`}
                    className={`group rounded-3xl p-1 bg-gradient-to-br ${t.gradient} shadow-md hover:shadow-xl hover:-translate-y-1 transition-all`}
                  >
                    <div className="bg-white/95 rounded-[1.35rem] p-5 text-center space-y-1">
                      <div className="text-4xl transition-transform group-hover:scale-110">{t.emoji}</div>
                      <p className="font-extrabold text-gray-700">{grade.name}</p>
                      <p className="text-xs text-gray-400">{grade.age_range}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {!loading && myGrade && otherGrades.length > 0 && (
          <div>
            <button
              onClick={() => setShowOtherGrades((v) => !v)}
              className="mx-auto flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-[#3A7D44] transition-colors"
            >
              Xem thử cấp độ khác {showOtherGrades ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showOtherGrades && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {otherGrades.map((grade) => {
                  const t = themeOf(grade.code);
                  return (
                    <Link
                      key={grade.id}
                      href={`/missions/${grade.code}`}
                      className={`group rounded-2xl p-0.5 bg-gradient-to-br ${t.gradient} opacity-80 hover:opacity-100 shadow-sm hover:shadow-md transition-all`}
                    >
                      <div className="bg-white/95 rounded-[1rem] p-4 text-center space-y-1">
                        <div className="text-2xl">{t.emoji}</div>
                        <p className="font-bold text-gray-600 text-sm">{grade.name}</p>
                        <p className="text-xs text-gray-400">{grade.age_range}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Link
            href="/journey"
            className="flex items-center gap-2 bg-white rounded-2xl px-5 py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold text-[#3A7D44]"
          >
            <TreePine className="w-5 h-5" /> Learning Journey
          </Link>
          <Link
            href="/homework"
            className="flex items-center gap-2 bg-white rounded-2xl px-5 py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold text-[#3A7D44]"
          >
            <PenLine className="w-5 h-5" /> Homework
          </Link>
        </div>
      </div>
    </div>
  );
}
