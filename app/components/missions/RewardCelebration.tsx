'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Leafy from '@/components/mascot/Leafy';
import type { MissionCompleteReward } from '@/lib/azure';

const LEAF_POSITIONS = [
  { left: '15%', delay: '0s' },
  { left: '35%', delay: '0.15s' },
  { left: '50%', delay: '0.3s' },
  { left: '65%', delay: '0.1s' },
  { left: '80%', delay: '0.25s' },
];

export default function RewardCelebration({
  totalLeaves,
  lastReward,
  gradeCode,
}: {
  totalLeaves: number;
  lastReward: MissionCompleteReward | null;
  gradeCode: string;
}) {
  const router = useRouter();
  const [showLeaves, setShowLeaves] = useState(false);
  const [showTotal, setShowTotal] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowLeaves(true), 600);
    const t2 = setTimeout(() => setShowTotal(true), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-sm p-8 text-center space-y-5 gl-pop-in relative overflow-hidden">
      <Leafy
        mood="cheer"
        size="lg"
        entrance="pop"
        message="Amazing!! You finished today's adventure! 🎉"
      />

      {showLeaves && (
        <div className="relative h-16">
          {LEAF_POSITIONS.map((pos, i) => (
            <span
              key={i}
              className="absolute top-0 text-2xl gl-leaf-fall"
              style={{ left: pos.left, animationDelay: pos.delay }}
            >
              🍃
            </span>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {showTotal && (
          <div className="gl-pop-in">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl px-6 py-3">
              <span className="text-3xl gl-coin-ting">🍃</span>
              <span className="text-2xl font-extrabold text-[#2E4A34]">+{totalLeaves} Leaves</span>
            </div>
          </div>
        )}

        {lastReward?.bonusAwarded && showTotal && (
          <p className="text-base text-[#C9A876] font-extrabold gl-pop-in" style={{ animationDelay: '0.2s' }}>
            🌟 +3 Leaves Bonus!
          </p>
        )}

        {lastReward && lastReward.streakDays > 1 && showTotal && (
          <p className="text-sm text-gray-500 font-bold gl-pop-in" style={{ animationDelay: '0.3s' }}>
            🔥 Streak: {lastReward.streakDays} ngày
          </p>
        )}
      </div>

      {showTotal && (
        <div className="flex flex-wrap gap-3 justify-center pt-2 gl-pop-in" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={() => router.push(`/missions/${gradeCode}`)}
            className="bg-[#3A7D44] hover:bg-[#2E4A34] text-white font-extrabold py-3.5 px-8 rounded-2xl text-lg transition-colors shadow-md"
          >
            Bài học khác
          </button>
          <Link
            href="/journey"
            className="bg-white border-2 border-[#3A7D44] text-[#3A7D44] font-extrabold py-3.5 px-8 rounded-2xl text-lg transition-colors"
          >
            Xem cây 🌳
          </Link>
        </div>
      )}
    </div>
  );
}
