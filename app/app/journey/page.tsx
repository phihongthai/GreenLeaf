'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import LearningJourneyTree from '@/components/tree/LearningJourneyTree';
import AppHeader from '@/components/AppHeader';
import FloatingDecor from '@/components/decor/FloatingDecor';
import SceneBackground from '@/components/decor/SceneBackground';

export default function JourneyPage() {
  const [growthScore, setGrowthScore] = useState(0);
  const [leafCount, setLeafCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ count: missionsCompleted }, { count: writingSubmitted }, { data: reward }] = await Promise.all([
        supabase.from('greenleaf_student_progress').select('id', { count: 'exact', head: true }).eq('student_id', user.id).eq('status', 'completed'),
        supabase.from('greenleaf_homework_submissions').select('id', { count: 'exact', head: true }).eq('student_id', user.id),
        supabase.from('greenleaf_rewards').select('leaf_count').eq('student_id', user.id).maybeSingle(),
      ]);

      setGrowthScore((missionsCompleted ?? 0) + (writingSubmitted ?? 0));
      setLeafCount(reward?.leaf_count ?? 0);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="relative min-h-screen gl-playful-bg px-4 py-8">
      <SceneBackground />
      <FloatingDecor />
      <div className="relative max-w-lg mx-auto space-y-6">
        <AppHeader icon="🌳" title="Learning Journey" backHref="/grades" />

        {loading ? (
          <p className="text-center text-gray-400 text-sm py-10">Đang tải...</p>
        ) : (
          <>
            <LearningJourneyTree growthScore={growthScore} />
            <div className="flex justify-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm w-fit mx-auto">
              <span>🍃</span>
              <span className="font-bold text-[#3A7D44]">{leafCount} Leaves</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
