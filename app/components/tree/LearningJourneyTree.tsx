import { JOURNEY_STAGES, getJourneyStage } from '@/lib/journey';

export default function LearningJourneyTree({ growthScore }: { growthScore: number }) {
  const { current, next, progress } = getJourneyStage(growthScore);
  const currentIndex = JOURNEY_STAGES.findIndex((s) => s.stage === current.stage);
  const roadmapProgress = (currentIndex / (JOURNEY_STAGES.length - 1)) * 100;

  return (
    <div className="space-y-5">
      {/* Hero: giai đoạn hiện tại, to và sống động */}
      <div className={`rounded-[2rem] p-1 bg-gradient-to-br ${current.gradient} shadow-xl gl-pop-in`}>
        <div className="relative overflow-hidden bg-white/95 rounded-[1.7rem] p-8 text-center space-y-3">
          <span className="absolute top-5 left-8 text-xl gl-sparkle">✨</span>
          <span className="absolute top-9 right-10 text-lg gl-sparkle" style={{ animationDelay: '0.6s' }}>🌟</span>
          <span className="absolute bottom-6 left-12 text-base gl-sparkle" style={{ animationDelay: '1.1s' }}>⭐</span>

          <div className="text-8xl gl-float">{current.emoji}</div>
          <p className="text-2xl font-extrabold text-[#3A7D44]">{current.label}</p>

          {next ? (
            <div className="space-y-1.5 pt-1">
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
                <div
                  className={`h-full bg-gradient-to-r ${current.gradient} rounded-full transition-all duration-700`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm font-semibold text-gray-500">
                Còn {Math.max(0, next.threshold - growthScore)} bước nữa để thành{' '}
                <span className="font-extrabold text-[#3A7D44]">{next.label} {next.emoji}</span>
              </p>
            </div>
          ) : (
            <p className="text-sm font-extrabold text-[#C9A876]">🎉 Đã đạt cấp độ cao nhất — Garden!</p>
          )}
        </div>
      </div>

      {/* Bản đồ hành trình: toàn bộ 5 chặng */}
      <div className="bg-white rounded-3xl shadow-sm p-6 pt-8">
        <div className="relative flex items-start justify-between">
          <div className="absolute top-6 left-6 right-6 h-1.5 bg-gray-100 rounded-full" />
          <div
            className={`absolute top-6 left-6 h-1.5 bg-gradient-to-r ${current.gradient} rounded-full transition-all duration-700`}
            style={{ width: `${roadmapProgress}%`, maxWidth: 'calc(100% - 3rem)' }}
          />

          {JOURNEY_STAGES.map((s, i) => {
            const reached = i <= currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <div key={s.stage} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-[3px] transition-all ${
                    isCurrent
                      ? `bg-gradient-to-br ${s.gradient} border-white shadow-lg scale-125 gl-float`
                      : reached
                      ? 'bg-white border-[#3A7D44]'
                      : 'bg-gray-50 border-gray-200 grayscale opacity-50'
                  }`}
                >
                  {s.emoji}
                </div>
                <span
                  className={`text-[10px] font-bold text-center leading-tight ${
                    isCurrent ? 'text-[#3A7D44]' : reached ? 'text-gray-500' : 'text-gray-300'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
