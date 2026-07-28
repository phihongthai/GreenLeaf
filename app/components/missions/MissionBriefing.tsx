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

      <div className="space-y-2.5 pt-2">
        {missions.map((m, i) => {
          const theme = MISSION_THEME[m.type];
          return (
            <div
              key={m.id}
              className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 text-left"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm bg-gradient-to-br ${theme.gradient} shrink-0`}
              >
                {theme.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-[#2E4A34] text-sm">
                  Mission {i + 1}: {theme.label}
                </p>
                <p className="text-xs text-gray-400">{theme.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onStart}
        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-extrabold py-3.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md text-base"
      >
        Let&apos;s go! 🚀
      </button>
    </div>
  );
}
