'use client';

import { useEffect } from 'react';
import Leafy from '@/components/mascot/Leafy';
import { MISSION_THEME } from '@/lib/missionTheme';
import { playTTS, stopTTS } from '@/lib/tts';
import { getInstructionTtsProfile } from '@/lib/ttsProfile';
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
  const { rate, voice } = getInstructionTtsProfile(gradeCode);

  useEffect(() => {
    const text = `Listen and say it!`;
    playTTS(text, rate, voice).catch(() => {});
    return () => {
      stopTTS();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleStart = () => {
    stopTTS();
    onStart();
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden gl-pop-in border border-emerald-100">
      <div className="px-6 pt-7 pb-6 text-center space-y-5">
        {/* Leafy Guide with short encouraging cue */}
        <Leafy
          mood="point"
          size="lg"
          entrance="slide-left"
          message="Listen and say it!"
        />

        {/* Action-First Visual Cue: Listen ➔ Say it! */}
        <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-200/90 rounded-2xl py-3.5 px-6 shadow-sm">
          <div className="flex items-center gap-2 text-base md:text-lg font-black text-emerald-900">
            <span className="text-2xl md:text-3xl">🎧</span>
            <span>Listen</span>
          </div>
          <span className="text-emerald-500 font-black text-xl md:text-2xl animate-pulse">➔</span>
          <div className="flex items-center gap-2 text-base md:text-lg font-black text-emerald-900">
            <span className="text-2xl md:text-3xl">🗣️</span>
            <span>Say it!</span>
          </div>
        </div>

        {/* Minimal Context: Part indicator (keeps text minimal) */}
        <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-extrabold text-[#3A7D44]">
          <span>{theme.emoji}</span>
          <span>Part {missionNumber} of {missions.length}: {theme.label}</span>
        </div>

        {/* Upcoming Parts Dimmed (anticipation without cognitive overload) */}
        <div className="flex justify-center items-center gap-2.5 pt-1">
          {missions.map((m, i) => {
            const t = MISSION_THEME[m.type];
            const done = i < step;
            const active = i === step;
            return (
              <div
                key={m.id}
                className={`transition-all ${
                  active
                    ? 'scale-110 opacity-100'
                    : done
                    ? 'opacity-80 scale-95'
                    : 'opacity-30 scale-90'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-black shadow-sm bg-gradient-to-br ${t.gradient} ${
                    active ? 'ring-2 ring-offset-2 ring-emerald-500 shadow-emerald-200' : ''
                  }`}
                >
                  {done ? '✓' : t.emoji}
                </div>
              </div>
            );
          })}
        </div>

        {/* Prominent Action Button: GO! 🚀 */}
        <button
          onClick={handleStart}
          className={`w-full bg-gradient-to-r ${theme.gradient} text-white font-black py-4 px-8 rounded-2xl text-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2.5 gl-glow-pulse`}
        >
          <span>GO!</span>
          <span className="text-2xl">🚀</span>
        </button>
      </div>
    </div>
  );
}
