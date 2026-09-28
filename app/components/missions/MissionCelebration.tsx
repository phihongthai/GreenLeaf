'use client';

import { useEffect } from 'react';
import Leafy from '@/components/mascot/Leafy';
import { MISSION_THEME } from '@/lib/missionTheme';
import { playTTS, stopTTS } from '@/lib/tts';
import { getInstructionTtsProfile } from '@/lib/ttsProfile';
import type { Mission } from '@/lib/types';
import type { MissionCompleteReward } from '@/lib/azure';

const CHEERS = ['Hooray!', 'Yay!', 'Awesome!', 'Amazing!'];

export default function MissionCelebration({
  missions,
  completedStep,
  reward,
  gradeCode,
  onContinue,
}: {
  missions: Mission[];
  completedStep: number;
  reward: MissionCompleteReward;
  gradeCode: string;
  onContinue: () => void;
}) {
  const mission = missions[completedStep];
  const theme = MISSION_THEME[mission.type];
  const partNumber = completedStep + 1;
  const { rate, voice } = getInstructionTtsProfile(gradeCode);

  useEffect(() => {
    const cheer = CHEERS[completedStep % CHEERS.length];
    playTTS(cheer, rate, voice).catch(() => {});
    return () => {
      stopTTS();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedStep]);

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 text-center space-y-6 gl-pop-in overflow-hidden relative">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="absolute gl-sparkle text-2xl pointer-events-none"
          style={{
            top: `${10 + (i * 17) % 60}%`,
            left: `${5 + (i * 23) % 85}%`,
            animationDelay: `${i * 0.3}s`,
          }}
        >
          {['⭐', '🎉', '✨', '🌟', '🎊', '💫'][i]}
        </span>
      ))}

      <Leafy mood="cheer" size="lg" entrance="pop" />

      <div className="space-y-3">
        <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${theme.gradient} text-white font-extrabold px-6 py-2.5 rounded-full shadow-md text-base`}>
          <span className="text-lg">✅</span>
          Part {partNumber}: {theme.label}
        </div>
        <p className="gl-display text-2xl font-extrabold text-emerald-600">
          Complete!
        </p>
      </div>

      {reward.leavesEarned > 0 && (
        <div className="flex items-center justify-center gap-2 gl-pop-in" style={{ animationDelay: '0.3s' }}>
          <span className="text-4xl gl-coin-ting">🍃</span>
          <span className="gl-display text-3xl font-extrabold text-gl-green">
            +{reward.leavesEarned} Leaves
          </span>
        </div>
      )}

      <div className="flex justify-center gap-3">
        {missions.map((m, i) => {
          const t = MISSION_THEME[m.type];
          const done = i <= completedStep;
          return (
            <div key={m.id} className={`flex flex-col items-center gap-1 ${!done ? 'opacity-40' : ''}`}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm shadow-sm bg-gradient-to-br ${t.gradient}`}
              >
                {done ? '✓' : t.emoji}
              </div>
              <span className="text-[10px] font-bold text-gray-500">Part {i + 1}</span>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => {
          stopTTS();
          onContinue();
        }}
        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-extrabold py-4 rounded-2xl text-lg transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-md"
      >
        Continue →
      </button>
    </div>
  );
}
