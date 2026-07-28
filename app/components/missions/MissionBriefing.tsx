'use client';

import Leafy from '@/components/mascot/Leafy';
import { MISSION_THEME } from '@/lib/missionTheme';
import type { Mission } from '@/lib/types';

export default function MissionBriefing({
  missions,
  lessonTitle,
  onStart,
}: {
  missions: Mission[];
  lessonTitle: string;
  onStart: () => void;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-8 text-center space-y-5 gl-pop-in">
      <Leafy mood="point" size="md" entrance="slide-left" message={`Today's lesson: ${lessonTitle}`} />

      <div className="space-y-3 pt-2">
        {missions.map((m, i) => {
          const theme = MISSION_THEME[m.type];
          return (
            <div
              key={m.id}
              className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 py-4 text-left"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-md bg-gradient-to-br ${theme.gradient} shrink-0`}
              >
                {theme.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-[#3A7D44] text-base">
                  Mission {i + 1}: {theme.label}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">{theme.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onStart}
        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-extrabold py-4 rounded-2xl transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg text-lg"
      >
        Let&apos;s go! 🚀
      </button>
    </div>
  );
}
