'use client';

import { useEffect, useState } from 'react';

export type LeafyMood = 'idle' | 'wave' | 'cheer' | 'point' | 'think';
export type LeafySize = 'sm' | 'md' | 'lg';
export type LeafyEntrance = 'none' | 'slide-left' | 'pop';

const FACE: Record<LeafyMood, string> = {
  idle: '🍀',
  wave: '🍀',
  cheer: '🍀',
  point: '🍀',
  think: '🍀',
};

const ACCENT: Record<LeafyMood, string[]> = {
  idle: ['✨', '🌟'],
  wave: ['👋', '✨'],
  cheer: ['🎉', '🎊', '⭐'],
  point: ['👉', '✨'],
  think: ['💭', '✨'],
};

const ANIM: Record<LeafyMood, string> = {
  idle: 'gl-float',
  wave: 'gl-wave',
  cheer: 'gl-bounce-jump',
  point: 'gl-float',
  think: 'gl-float',
};

const SIZE_CLS: Record<LeafySize, { emoji: string; bubble: string; accent: string }> = {
  sm: { emoji: 'text-5xl', bubble: 'text-sm max-w-[12rem] px-3.5 py-2.5', accent: 'text-base' },
  md: { emoji: 'text-7xl', bubble: 'text-base max-w-[18rem] px-5 py-3.5', accent: 'text-lg' },
  lg: { emoji: 'text-8xl', bubble: 'text-lg max-w-sm px-6 py-4', accent: 'text-xl' },
};

export default function Leafy({
  mood = 'idle',
  size = 'md',
  message,
  entrance = 'none',
  className = '',
}: {
  mood?: LeafyMood;
  size?: LeafySize;
  message?: string;
  entrance?: LeafyEntrance;
  className?: string;
}) {
  const [entered, setEntered] = useState(entrance === 'none');
  const s = SIZE_CLS[size];
  const accents = ACCENT[mood];

  useEffect(() => {
    if (entrance !== 'none') {
      const t = setTimeout(() => setEntered(true), 50);
      return () => clearTimeout(t);
    }
  }, [entrance]);

  const entranceCls =
    entrance === 'slide-left'
      ? entered ? 'gl-slide-in-left' : 'opacity-0 -translate-x-full'
      : entrance === 'pop'
      ? entered ? 'gl-pop-in' : 'opacity-0 scale-50'
      : '';

  return (
    <div className={`flex flex-col items-center gap-3 ${entranceCls} ${className}`}>
      <div className="relative">
        {accents.map((a, i) => (
          <span
            key={i}
            className={`absolute gl-sparkle ${s.accent} ${
              i === 0 ? '-top-2 -left-5' : i === 1 ? '-top-1 -right-6' : '-bottom-1 -left-7'
            }`}
            style={{ animationDelay: `${i * 0.4}s` }}
          >
            {a}
          </span>
        ))}
        <div className={`${s.emoji} drop-shadow-lg ${ANIM[mood]}`}>
          {FACE[mood]}
        </div>
      </div>
      {message && (
        <div className={`relative bg-white rounded-2xl shadow-lg border-2 border-emerald-200 text-center gl-pop-in ${s.bubble}`}>
          <p className="font-extrabold text-[#2E4A34] leading-snug">{message}</p>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t-2 border-l-2 border-emerald-200 rotate-45" />
        </div>
      )}
    </div>
  );
}
