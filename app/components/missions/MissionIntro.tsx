'use client';

import { useEffect } from 'react';
import Leafy from '@/components/mascot/Leafy';
import { MISSION_THEME } from '@/lib/missionTheme';
import { playTTS } from '@/lib/tts';
import { getTtsProfile } from '@/lib/ttsProfile';
import type { Mission } from '@/lib/types';

export default function MissionIntro({
  missions,
  step,
  gradeCode,
  onStart,
}: {
  missions: Mission[];
  step: number;
  gradeCode: string;
  onStart: () => void;
}) {
  const mission = missions[step];
  const theme = MISSION_THEME[mission.type];
  const missionNumber = step + 1;
  const { rate, voice } = getTtsProfile(gradeCode);

  useEffect(() => {
    const text = `Mission ${missionNumber}: ${theme.announce}!`;
    playTTS(text, rate, voice).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden gl-pop-in">
      <div className="px-8 pt-8 pb-6 text-center space-y-5">
        <Leafy
          mood="point"
          size="lg"
          entrance="slide-left"
          message={`Mission ${missionNumber}: ${theme.announce}!`}
        />

        <div className="space-y-2">
          <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${theme.gradient} text-white text-sm font-extrabold px-5 py-2 rounded-full shadow-sm`}>
            <span className="text-base">{theme.emoji}</span>
            Part {missionNumber}: {theme.label}
          </div>
          <p className="text-base text-gray-500 font-semibold">{theme.description}</p>
        </div>

        <div className="flex justify-center gap-3">
          {missions.map((m, i) => {
            const t = MISSION_THEME[m.type];
            const done = i < step;
            const active = i === step;
            return (
              <div key={m.id} className={`flex flex-col items-center gap-1 ${!done && !active ? 'opacity-40' : ''}`}>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg shadow-sm bg-gradient-to-br ${t.gradient} ${
                    active ? 'ring-2 ring-offset-2 ring-[#3A7D44]' : ''
                  }`}
                >
                  {done ? '✓' : t.emoji}
                </div>
                <span className="text-xs font-bold text-gray-500">Part {i + 1}</span>
              </div>
            );
          })}
        </div>

        <button
          onClick={onStart}
          className={`w-full bg-gradient-to-r ${theme.gradient} text-white font-extrabold py-4 rounded-2xl text-lg transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-md`}
        >
          {"Let's go! 🚀"}
        </button>
      </div>
    </div>
  );
}
