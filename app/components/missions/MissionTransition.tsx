import { MISSION_THEME } from '@/lib/missionTheme';
import type { Mission } from '@/lib/types';
import type { MissionCompleteReward } from '@/lib/azure';

// Màn hình "chuyển tiếp" giữa các phần trong 1 Lesson: đóng phần vừa xong lại rõ ràng (thay vì
// nhảy thẳng sang phần kế tiếp), giới thiệu ngắn phần sắp học, học sinh bấm mới mở phần đó ra —
// giúp học sinh/phụ huynh dễ theo dõi cấu trúc bài học gồm mấy phần, đang ở đâu.
export default function MissionTransition({
  lessonTitle,
  missions,
  step,
  lastReward,
  onStart,
}: {
  lessonTitle: string;
  missions: Mission[];
  step: number;
  lastReward: MissionCompleteReward | null;
  onStart: () => void;
}) {
  const nextMission = missions[step];
  const nextTheme = MISSION_THEME[nextMission.type];
  const isFirst = step === 0;
  const prevTheme = !isFirst ? MISSION_THEME[missions[step - 1].type] : null;

  return (
    <div className="bg-white rounded-3xl shadow-sm p-8 text-center space-y-5 gl-pop-in">
      {isFirst ? (
        <>
          <div className="text-5xl">📖</div>
          <div>
            <p className="text-lg font-extrabold text-[#2E4A34]">{lessonTitle}</p>
            <p className="text-sm text-gray-400 mt-1">Bài học gồm {missions.length} phần, làm lần lượt từng phần nhé!</p>
          </div>
        </>
      ) : (
        <>
          <div className="text-5xl">✅</div>
          <div>
            <p className="text-lg font-extrabold text-emerald-600">Đã xong: {prevTheme?.label}!</p>
            {lastReward && lastReward.leavesEarned > 0 && (
              <p className="text-sm text-[#3A7D44] font-bold mt-1">+{lastReward.leavesEarned} 🍃</p>
            )}
          </div>
        </>
      )}

      <div className="flex justify-center gap-3">
        {missions.map((m, i) => {
          const theme = MISSION_THEME[m.type];
          const done = i < step;
          const active = i === step;
          return (
            <div key={m.id} className={`flex flex-col items-center gap-1 ${!done && !active ? 'opacity-40' : ''}`}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm bg-gradient-to-br ${theme.gradient} ${
                  active ? 'ring-2 ring-offset-2 ring-[#3A7D44]' : ''
                }`}
              >
                {done ? '✓' : theme.emoji}
              </div>
              <span className="text-[10px] font-bold text-gray-400">Phần {i + 1}</span>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-1">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Tiếp theo</p>
        <p className="font-extrabold text-[#2E4A34] flex items-center gap-1.5">
          <span>{nextTheme.emoji}</span> {nextTheme.label}
        </p>
        <p className="text-sm text-gray-500">{nextTheme.description}</p>
      </div>

      <button
        onClick={onStart}
        className={`w-full bg-gradient-to-r ${nextTheme.gradient} text-white font-extrabold py-3.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-sm`}
      >
        Bắt đầu {nextTheme.label} →
      </button>
    </div>
  );
}
