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
    <div className="bg-gradient-to-b from-white via-white to-emerald-50/40 rounded-[32px] shadow-[0_16px_36px_rgba(46,74,52,0.12),0_4px_0_#A7F3D0] overflow-hidden gl-pop-in border-4 border-white">
      <div className="px-6 pt-8 pb-7 text-center space-y-6">
        {/* Leafy Guide with short encouraging cue */}
        <Leafy
          mood="point"
          size="lg"
          entrance="slide-left"
          message="Listen and say it!"
        />

        {/* Action-First Visual Cue: Listen ➔ Say it! */}
        <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-emerald-100/90 via-teal-100/70 to-emerald-100/90 border-2 border-emerald-300 rounded-2xl py-3.5 px-6 shadow-inner">
          <div className="flex items-center gap-2 text-base md:text-lg font-black text-emerald-950">
            <span className="text-2xl md:text-3xl animate-bounce">🎧</span>
            <span>Listen</span>
          </div>
          <span className="text-emerald-600 font-black text-xl md:text-2xl animate-pulse">➔</span>
          <div className="flex items-center gap-2 text-base md:text-lg font-black text-emerald-950">
            <span className="text-2xl md:text-3xl">🗣️</span>
            <span>Say it!</span>
          </div>
        </div>

        {/* Minimal Context: Part indicator (keeps text minimal) */}
        <div className="inline-flex items-center gap-2 bg-white/90 border border-emerald-200 px-4 py-1.5 rounded-full text-xs md:text-sm font-black text-emerald-900 shadow-xs">
          <span>{theme.emoji}</span>
          <span>Part {missionNumber} of {missions.length}: {theme.label}</span>
        </div>

        {/* Upcoming Parts Dimmed (anticipation without cognitive overload) */}
        <div className="flex justify-center items-center gap-3 pt-1">
          {missions.map((m, i) => {
            const t = MISSION_THEME[m.type];
            const done = i < step;
            const active = i === step;
            return (
              <div
                key={m.id}
                className={`transition-all ${
                  active
                    ? 'scale-115 opacity-100'
                    : done
                    ? 'opacity-85 scale-95'
                    : 'opacity-40 scale-90'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white text-base font-black shadow-md bg-gradient-to-br ${t.gradient} ${
                    active ? 'ring-4 ring-emerald-300 ring-offset-2 shadow-emerald-400/50' : ''
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
          className={`w-full bg-gradient-to-r ${theme.gradient} hover:brightness-105 active:translate-y-1 text-white font-black py-4 px-8 rounded-2xl text-xl transition-all shadow-[0_8px_20px_rgba(16,185,129,0.35),0_4px_0_#065F46] flex items-center justify-center gap-2.5 gl-glow-pulse cursor-pointer`}
        >
          <span>Let&apos;s Start!</span>
          <span className="text-2xl">🚀</span>
        </button>
      </div>
    </div>
  );
}
