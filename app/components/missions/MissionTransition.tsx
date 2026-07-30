import Leafy from '@/components/mascot/Leafy';
import { MISSION_THEME } from '@/lib/missionTheme';
import type { Mission } from '@/lib/types';
import type { MissionCompleteReward } from '@/lib/azure';

const COMPLETION_SPEECH: Record<number, string> = {
  1: 'Well done! Part 1 complete!',
  2: 'Awesome! You did great!',
  3: 'Excellent! All done!',
};

export default function MissionTransition({
  missions,
  step,
  lastReward,
  onStart,
}: {
  missions: Mission[];
  step: number;
  lastReward: MissionCompleteReward | null;
  onStart: () => void;
}) {
  const nextMission = missions[step];
  const nextTheme = MISSION_THEME[nextMission.type];
  const prevTheme = MISSION_THEME[missions[step - 1].type];
  const completionMsg = COMPLETION_SPEECH[step] ?? 'Well done!';

  return (
    <div className="bg-white rounded-3xl shadow-sm p-8 text-center space-y-5 gl-pop-in">
      <Leafy mood="cheer" size="md" entrance="pop" message={`${completionMsg} 🎉`} />

      <div>
        <p className="text-lg font-extrabold text-emerald-600">Done: {prevTheme.label}!</p>
        {lastReward && lastReward.leavesEarned > 0 && (
          <p className="text-base text-[#3A7D44] font-bold mt-1">+{lastReward.leavesEarned} 🍃</p>
        )}
      </div>

      <div className="flex justify-center gap-3">
        {missions.map((m, i) => {
          const theme = MISSION_THEME[m.type];
          const done = i < step;
          const active = i === step;
          return (
            <div key={m.id} className={`flex flex-col items-center gap-1 ${!done && !active ? 'opacity-40' : ''}`}>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg shadow-sm bg-gradient-to-br ${theme.gradient} ${
                  active ? 'ring-2 ring-offset-2 ring-[#3A7D44]' : ''
                }`}
              >
                {done ? '✓' : theme.emoji}
              </div>
              <span className="text-xs font-bold text-gray-500">Part {i + 1}</span>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-1">
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Up next</p>
        <p className="text-base font-extrabold text-[#3A7D44] flex items-center gap-1.5">
          <span>{nextTheme.emoji}</span> {nextTheme.label}
        </p>
        <p className="text-sm text-gray-500">{nextTheme.description}</p>
      </div>

      <button
        onClick={onStart}
        className={`w-full bg-gradient-to-r ${nextTheme.gradient} text-white font-extrabold py-4 rounded-2xl text-lg transition-all hover:-translate-y-0.5 shadow-md`}
      >
        {"Let's go!"}
      </button>
    </div>
  );
}
