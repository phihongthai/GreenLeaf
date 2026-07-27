'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, TreePine, PenLine, Pencil } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AppHeader from '@/components/AppHeader';
import FloatingDecor from '@/components/decor/FloatingDecor';
import { getJourneyStage } from '@/lib/journey';
import type { Grade } from '@/lib/types';

const GRADE_THEME: Record<string, { emoji: string; gradient: string }> = {
  kindergarten: { emoji: '🧸', gradient: 'from-amber-300 to-orange-400' },
  kids1: { emoji: '🚗', gradient: 'from-sky-400 to-blue-500' },
  kids2: { emoji: '🏙️', gradient: 'from-violet-400 to-purple-500' },
  teens: { emoji: '🎓', gradient: 'from-teal-500 to-cyan-600' },
};

function themeOf(code: string) {
  return GRADE_THEME[code] ?? { emoji: '📘', gradient: 'from-gray-300 to-gray-400' };
}

export default function GradesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [myGrade, setMyGrade] = useState<Grade | null>(null);
  const [leafCount, setLeafCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [growthScore, setGrowthScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showOtherGrades, setShowOtherGrades] = useState(false);
  const [changingGrade, setChangingGrade] = useState(false);
  const [savingGrade, setSavingGrade] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [{ data: gradesData }, { data: profile }, { data: rewardData }, { count: todayAttempts }, { count: missionsCompleted }, { count: writingSubmitted }] = await Promise.all([
        supabase.from('greenleaf_grades').select('*').order('order_index'),
        user ? supabase.from('greenleaf_profiles').select('grade_id').eq('id', user.id).single() : Promise.resolve({ data: null }),
        user ? supabase.from('greenleaf_rewards').select('leaf_count, streak_days').eq('student_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
        user ? supabase.from('greenleaf_mission_attempts').select('id', { count: 'exact', head: true }).eq('student_id', user.id).gte('created_at', startOfToday.toISOString()) : Promise.resolve({ count: 0 }),
        user ? supabase.from('greenleaf_student_progress').select('id', { count: 'exact', head: true }).eq('student_id', user.id).eq('status', 'completed') : Promise.resolve({ count: 0 }),
        user ? supabase.from('greenleaf_homework_submissions').select('id', { count: 'exact', head: true }).eq('student_id', user.id) : Promise.resolve({ count: 0 }),
      ]);

      const allGrades = gradesData ?? [];
      setGrades(allGrades);
      setMyGrade(allGrades.find((g) => g.id === profile?.grade_id) ?? null);
      setLeafCount(rewardData?.leaf_count ?? 0);
      setStreakDays(rewardData?.streak_days ?? 0);
      setTodayCount(todayAttempts ?? 0);
      setGrowthScore((missionsCompleted ?? 0) + (writingSubmitted ?? 0));
      setLoading(false);
    };
    load();
  }, []);

  const otherGrades = grades.filter((g) => g.id !== myGrade?.id);
  const { current: journeyStage, next: nextStage, progress: journeyProgress } = getJourneyStage(growthScore);

  const handleChangeGrade = async (gradeId: string) => {
    if (!userId || gradeId === myGrade?.id) {
      setChangingGrade(false);
      return;
    }
    setSavingGrade(true);
    const supabase = createClient();
    const { error } = await supabase.from('greenleaf_profiles').update({ grade_id: gradeId }).eq('id', userId);
    if (!error) {
      setMyGrade(grades.find((g) => g.id === gradeId) ?? null);
    }
    setSavingGrade(false);
    setChangingGrade(false);
  };

  return (
    <div className="relative min-h-screen gl-playful-bg px-4 py-8">
      <FloatingDecor />
      <div className="relative max-w-md mx-auto space-y-4">
        <AppHeader
          rightExtra={
            <div className="flex items-center gap-2">
              {streakDays > 0 && (
                <div className="flex items-center gap-1.5 bg-white rounded-full px-3.5 py-1.5 shadow-md">
                  <span className="gl-sparkle inline-block">🔥</span>
                  <span className="font-extrabold text-[#2E4A34]">{streakDays}</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-md">
                <span className="gl-sparkle inline-block">🍃</span>
                <span className="font-extrabold text-[#2E4A34]">{leafCount} Leaves</span>
              </div>
            </div>
          }
        />

        {/* Hero: mascot + greeting trên nền màu thương hiệu, card cấp độ nối liền phía dưới */}
        <div className="bg-white rounded-[2rem] shadow-lg overflow-hidden gl-pop-in">
          <div className="relative bg-gradient-to-br from-[#3A7D44] to-emerald-600 px-6 pt-9 pb-20 text-center overflow-hidden">
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10" />
            <div className="absolute top-14 -left-10 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute top-4 left-8 text-xl gl-sparkle text-white/80">✨</div>
            <div className="absolute top-6 right-12 text-lg gl-sparkle text-white/80" style={{ animationDelay: '0.6s' }}>⭐</div>

            <div className="relative text-7xl gl-float drop-shadow-lg">🐱</div>
            <p className="relative text-sm font-bold text-white/95 mt-5 max-w-[16rem] mx-auto leading-relaxed">
              Hello, my name&apos;s Brave. Welcome to GreenLeaf. Let&apos;s have fun!
            </p>
          </div>

          <div className="px-5 pb-5 -mt-10 relative">
            {loading ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <p className="text-sm text-gray-400">Đang tải...</p>
              </div>
            ) : myGrade ? (
              <div className="bg-white rounded-2xl shadow-md p-6 text-center space-y-3">
                <div className={`w-16 h-16 mx-auto -mt-12 mb-1 rounded-2xl bg-gradient-to-br ${themeOf(myGrade.code).gradient} flex items-center justify-center text-3xl shadow-lg ring-4 ring-white`}>
                  {themeOf(myGrade.code).emoji}
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1.5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Cấp độ của bạn</p>
                    <button
                      onClick={() => setChangingGrade((v) => !v)}
                      className="text-gray-300 hover:text-[#3A7D44] transition-colors"
                      aria-label="Đổi cấp độ"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xl font-extrabold text-[#2E4A34]">{myGrade.name}</p>
                </div>

                {changingGrade && (
                  <div className="bg-emerald-50 rounded-xl p-3 space-y-2 text-left">
                    <p className="text-xs font-bold text-[#2E4A34]">Chọn cấp độ chính thức mới:</p>
                    <select
                      defaultValue={myGrade.id}
                      disabled={savingGrade}
                      onChange={(e) => handleChangeGrade(e.target.value)}
                      className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3A7D44] disabled:opacity-50"
                    >
                      {grades.map((g) => (
                        <option key={g.id} value={g.id}>{g.name} ({g.age_range})</option>
                      ))}
                    </select>
                    {savingGrade && <p className="text-[11px] text-gray-400">Đang lưu...</p>}
                  </div>
                )}

                <p className="text-xs font-bold text-gray-500 flex items-center justify-center gap-1.5">
                  {todayCount > 0 ? (
                    <><span>🎉</span> Hôm nay bạn đã luyện {todayCount} lần rồi, tuyệt vời!</>
                  ) : streakDays > 0 ? (
                    <><span>🔥</span> Đừng để mất chuỗi {streakDays} ngày — học ngay hôm nay!</>
                  ) : (
                    <><span>🎯</span> Hôm nay bạn chưa luyện bài nào — bắt đầu nhé!</>
                  )}
                </p>

                <Link
                  href={`/missions/${myGrade.code}`}
                  className={`gl-glow-pulse group block bg-gradient-to-r ${themeOf(myGrade.code).gradient} text-white font-extrabold py-3 rounded-xl hover:-translate-y-0.5 active:scale-95 transition-transform`}
                >
                  Bắt đầu học →
                </Link>

                {nextStage && (
                  <Link href="/journey" className="block bg-gray-50 hover:bg-emerald-50 rounded-xl px-3 py-2.5 transition-colors">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 mb-1.5">
                      <span className="flex items-center gap-1"><span>{journeyStage.emoji}</span> {journeyStage.label}</span>
                      <span className="flex items-center gap-1"><span>{nextStage.emoji}</span> {nextStage.label}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`gl-bar-fill h-full rounded-full bg-gradient-to-r ${journeyStage.gradient}`}
                        style={{ width: `${journeyProgress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      Còn {Math.max(0, nextStage.threshold - growthScore)} hoạt động nữa để lên {nextStage.label}! 🌟
                    </p>
                  </Link>
                )}

                {otherGrades.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setShowOtherGrades((v) => !v)}
                      className="mx-auto flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-[#3A7D44] transition-colors"
                    >
                      Xem thử cấp độ khác {showOtherGrades ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {showOtherGrades && (
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {otherGrades.map((grade) => {
                          const t = themeOf(grade.code);
                          return (
                            <Link
                              key={grade.id}
                              href={`/missions/${grade.code}`}
                              className={`group rounded-xl p-0.5 bg-gradient-to-br ${t.gradient} hover:shadow-md hover:-translate-y-0.5 transition-all`}
                            >
                              <div className="bg-white rounded-[0.6rem] p-2 text-center space-y-0.5">
                                <div className="text-xl transition-transform group-hover:scale-110">{t.emoji}</div>
                                <p className="font-bold text-gray-600 text-[11px] leading-tight">{grade.name}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md p-5 space-y-3">
                <p className="text-center text-sm font-extrabold text-[#2E4A34]">Chọn cấp độ của bạn</p>
                <div className="grid grid-cols-2 gap-3">
                  {grades.map((grade) => {
                    const t = themeOf(grade.code);
                    return (
                      <Link
                        key={grade.id}
                        href={`/missions/${grade.code}`}
                        className={`group rounded-2xl p-0.5 bg-gradient-to-br ${t.gradient} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all`}
                      >
                        <div className="bg-white rounded-[0.85rem] p-4 text-center space-y-1">
                          <div className="text-3xl transition-transform group-hover:scale-110">{t.emoji}</div>
                          <p className="font-extrabold text-gray-700 text-sm">{grade.name}</p>
                          <p className="text-[11px] text-gray-400">{grade.age_range}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex bg-white rounded-2xl shadow-sm p-1.5 gap-1.5">
          <Link
            href="/journey"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm text-[#3A7D44] hover:bg-emerald-50 transition-colors"
          >
            <TreePine className="w-4 h-4" /> Learning Journey
          </Link>
          <div className="w-px bg-gray-100 my-1" />
          <Link
            href="/homework"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm text-[#3A7D44] hover:bg-emerald-50 transition-colors"
          >
            <PenLine className="w-4 h-4" /> Homework
          </Link>
        </div>
      </div>
    </div>
  );
}
