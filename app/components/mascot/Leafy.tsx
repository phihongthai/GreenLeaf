'use client';

import { useEffect, useState } from 'react';

export type LeafyMood = 'idle' | 'wave' | 'cheer' | 'point' | 'think' | 'happy' | 'explore' | 'teamwork';
export type LeafySize = 'sm' | 'md' | 'lg';
export type LeafyEntrance = 'none' | 'slide-left' | 'pop';

/**
 * Ảnh Leafy thật thay cho emoji. Vài tư thế dùng chung một file vì bộ asset từ
 * bản thiết kế chưa có đủ (hero_wave.png vượt giới hạn tải của DesignSync).
 */
const ART: Record<LeafyMood, string> = {
  idle: '/leafy/outfit_school.webp',
  wave: '/leafy/outfit_school.webp',
  cheer: '/leafy/act_winner2.webp',
  point: '/leafy/outfit_presenting.webp',
  think: '/leafy/emo_thinking2.webp',
  happy: '/leafy/emo_happy2.webp',
  explore: '/leafy/act_explore2.webp',
  teamwork: '/leafy/act_teamwork2.webp',
};

const ACCENT: Record<LeafyMood, string[]> = {
  idle: ['✨', '🌟'],
  wave: ['👋', '✨'],
  cheer: ['🎉', '🎊', '⭐'],
  point: ['👉', '✨'],
  think: ['💭', '✨'],
  happy: ['✨', '🌟'],
  explore: ['🔍', '✨'],
  teamwork: ['🤝', '✨'],
};

const ANIM: Record<LeafyMood, string> = {
  idle: 'gl-float',
  wave: 'gl-wave',
  cheer: 'gl-bounce-jump',
  point: 'gl-float',
  think: 'gl-float',
  happy: 'gl-float',
  explore: 'gl-float',
  teamwork: 'gl-float',
};

const SIZE_CLS: Record<LeafySize, { art: string; bubble: string; accent: string }> = {
  sm: { art: 'h-16', bubble: 'text-sm max-w-[12rem] px-3.5 py-2.5', accent: 'text-base' },
  md: { art: 'h-28', bubble: 'text-base max-w-[18rem] px-5 py-3.5', accent: 'text-lg' },
  lg: { art: 'h-44', bubble: 'text-lg max-w-sm px-6 py-4', accent: 'text-xl' },
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
  const [artError, setArtError] = useState(false);
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
        <div className={ANIM[mood]}>
          {artError ? (
            <div className={`${s.art} aspect-square grid place-items-center text-6xl`}>🍀</div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ART[mood]}
              alt="Leafy"
              className={`${s.art} w-auto object-contain drop-shadow-lg`}
              onError={() => setArtError(true)}
            />
          )}
        </div>
      </div>
      {message && (
        <div className={`relative bg-white rounded-2xl shadow-lg border-2 border-emerald-200 text-center gl-pop-in ${s.bubble}`}>
          <p className="gl-display font-extrabold text-gl-green leading-snug">{message}</p>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t-2 border-l-2 border-emerald-200 rotate-45" />
        </div>
      )}
    </div>
  );
}
