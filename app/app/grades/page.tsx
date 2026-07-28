'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TreePine, PenLine, HelpCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AppHeader from '@/components/AppHeader';
import FloatingDecor from '@/components/decor/FloatingDecor';
import SceneBackground from '@/components/decor/SceneBackground';
import LessonPathList from '@/components/missions/LessonPathList';
import FirstTimeGuide from '@/components/student/FirstTimeGuide';
import type { Grade } from '@/lib/types';

export default function GradesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [myGrade, setMyGrade] = useState<Grade | null>(null);
  const [leafCount, setLeafCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [{ data: profile }, { data: rewardData }, { count: todayAttempts }] = await Promise.all([
        user ? supabase.from('greenleaf_profiles').select('grade:greenleaf_grades(*)').eq('id', user.id).single() : Promise.resolve({ data: null }),
        user ? supabase.from('greenleaf_rewards').select('leaf_count, streak_days').eq('student_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
        user ? supabase.from('greenleaf_mission_attempts').select('id', { count: 'exact', head: true }).eq('student_id', user.id).gte('created_at', startOfToday.toISOString()) : Promise.resolve({ count: 0 }),
      ]);

      const grade = (profile as unknown as { grade: Grade | null } | null)?.grade ?? null;
      setMyGrade(grade);
      setLeafCount(rewardData?.leaf_count ?? 0);
      setStreakDays(rewardData?.streak_days ?? 0);
      setTodayCount(todayAttempts ?? 0);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="relative min-h-screen gl-playful-bg px-4 pt-8 pb-24">
      <SceneBackground />
      <FloatingDecor />
      <div className="relative max-w-xl mx-auto space-y-4">
        <AppHeader
          rightExtra={
            <div className="flex items-center gap-2.5">
              {streakDays > 0 && (
                <div className="flex items-center gap-1.5 bg-white rounded-full px-4 py-2 shadow-md">
                  <span className="gl-sparkle inline-block text-lg">🔥</span>
                  <span className="text-base font-extrabold text-[#3A7D44]">{streakDays}</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
                <span className="gl-sparkle inline-block text-lg">🍃</span>
                <span className="text-base font-extrabold text-[#3A7D44]">{leafCount} Leaves</span>
              </div>
              <Link
                href="/help"
                aria-label="Hướng dẫn sử dụng"
                className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md text-[#3A7D44] hover:bg-emerald-50 transition-colors shrink-0"
              >
                <HelpCircle className="w-6 h-6" />
              </Link>
            </div>
          }
        />

        <FirstTimeGuide userId={userId} />

        {!loading && myGrade && (
          <div className="bg-white rounded-2xl shadow-md px-5 py-4 flex items-center gap-4 gl-pop-in">
            <div className="text-4xl shrink-0 gl-float">🍀</div>
            <div className="flex-1 min-w-0">
              <p className="text-xl font-extrabold text-[#3A7D44] leading-tight">{myGrade.name}</p>
              <p className="text-sm font-bold text-gray-500 flex items-center gap-1.5 mt-0.5">
                {todayCount > 0 ? (
                  <><span>🎉</span> Hôm nay bạn đã luyện {todayCount} lần rồi, tuyệt vời!</>
                ) : streakDays > 0 ? (
                  <><span>🔥</span> Đừng để mất chuỗi {streakDays} ngày — học ngay hôm nay!</>
                ) : (
                  <><span>🎯</span> Chọn 1 bài bên dưới để bắt đầu nhé!</>
                )}
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-400 text-sm py-10">Đang tải...</p>
        ) : !myGrade ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center space-y-3">
            <p className="text-sm text-gray-500">Bạn chưa được gán cấp độ học. Liên hệ giáo viên hoặc tự chọn tại trang Hồ sơ.</p>
            <Link
              href="/profile"
              className="inline-block bg-[#3A7D44] hover:bg-[#2E4A34] text-white font-extrabold py-2.5 px-5 rounded-xl transition-colors"
            >
              Vào Hồ sơ để chọn cấp độ →
            </Link>
          </div>
        ) : (
          <LessonPathList gradeId={myGrade.id} gradeCode={myGrade.code} />
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 z-30">
        <div className="max-w-xl mx-auto px-4 pb-4">
          <div className="flex bg-white rounded-2xl shadow-lg p-2 gap-2 border border-gray-100">
            <Link
              href="/journey"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-base text-[#3A7D44] hover:bg-emerald-50 transition-colors"
            >
              <TreePine className="w-5 h-5" /> Learning Journey
            </Link>
            <div className="w-px bg-gray-100 my-1.5" />
            <Link
              href="/homework"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-base text-[#3A7D44] hover:bg-emerald-50 transition-colors"
            >
              <PenLine className="w-5 h-5" /> Homework
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
