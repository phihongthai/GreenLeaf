import { getJourneyStage } from '@/lib/journey';

export default function LearningJourneyTree({ growthScore }: { growthScore: number }) {
  const { current, next, progress } = getJourneyStage(growthScore);

  return (
    <div className="bg-white rounded-3xl shadow-sm p-8 text-center space-y-4">
      <div className="text-7xl">{current.emoji}</div>
      <p className="text-lg font-extrabold text-[#2E4A34]">{current.label}</p>

      {next ? (
        <div className="space-y-1.5">
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
            <div className="h-full bg-gradient-to-r from-[#3A7D44] to-emerald-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-400">Còn {Math.max(0, next.threshold - growthScore)} bước nữa để thành {next.label} {next.emoji}</p>
        </div>
      ) : (
        <p className="text-xs text-[#C9A876] font-bold">Đã đạt cấp độ cao nhất! 🎉</p>
      )}
    </div>
  );
}
