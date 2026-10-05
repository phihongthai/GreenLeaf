'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import LearningJourneyTree from '@/components/tree/LearningJourneyTree';
import StudentNavBar from '@/components/student/StudentNavBar';
import BadgesModal from '@/components/student/BadgesModal';
import BottomTabBar from '@/components/student/BottomTabBar';
import FloatingDecor from '@/components/decor/FloatingDecor';
import SceneBackground from '@/components/decor/SceneBackground';

export default function JourneyPage() {
  const [growthScore, setGrowthScore] = useState(0);
  const [leafCount, setLeafCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [badgesOpen, setBadgesOpen] = useState(false);
  const [userName, setUserName] = useState('Lyn');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [{ count: missionsCompleted }, { count: writingSubmitted }, { data: reward }, { data: profile }] = await Promise.all([
        supabase.from('greenleaf_student_progress').select('id', { count: 'exact', head: true }).eq('student_id', user.id).eq('status', 'completed'),
        supabase.from('greenleaf_homework_submissions').select('id', { count: 'exact', head: true }).eq('student_id', user.id),
        supabase.from('greenleaf_rewards').select('leaf_count').eq('student_id', user.id).maybeSingle(),
        supabase.from('greenleaf_profiles').select('name').eq('id', user.id).single(),
      ]);

      setGrowthScore((missionsCompleted ?? 0) + (writingSubmitted ?? 0));
      setLeafCount(reward?.leaf_count ?? 0);
      setUserName(profile?.name || 'Lyn');
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#f3f9f1] px-3 sm:px-6 pt-3 sm:pt-4 pb-28 md:pb-12 space-y-6">
      <SceneBackground />
      <FloatingDecor />

      <div className="max-w-6xl mx-auto">
        <StudentNavBar
          userName={userName}
          leafCount={leafCount}
          activeTab="progress"
          onOpenBadges={() => setBadgesOpen(true)}
        />
      </div>

      <div className="relative max-w-lg mx-auto space-y-6">
        {loading ? (
          <p className="text-center text-gray-400 text-sm py-10">Loading...</p>
        ) : (
          <>
            <LearningJourneyTree growthScore={growthScore} />
            <div className="flex justify-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm w-fit mx-auto border border-emerald-100">
              <span>🍃</span>
              <span className="font-bold text-[#3A7D44]">{leafCount} Leaves</span>
            </div>
          </>
        )}
      </div>

      <BadgesModal
        isOpen={badgesOpen}
        onClose={() => setBadgesOpen(false)}
        userId={userId}
        leafCount={leafCount}
        streakDays={0}
      />

      <BottomTabBar />
    </div>
  );
}
