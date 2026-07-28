import { JOURNEY_STAGES, getJourneyStage } from '@/lib/journey';

export default function LearningJourneyTree({ growthScore }: { growthScore: number }) {
  const { current, next, progress } = getJourneyStage(growthScore);
  const currentIndex = JOURNEY_STAGES.findIndex((s) => s.stage === current.stage);

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

      {/* Bản đồ hành trình: đường zigzag dọc, dễ đọc trên màn hình điện thoại hẹp
          hơn là thanh ngang nhồi 5 chặng. */}
      <div className="bg-white rounded-3xl shadow-sm px-5 py-8">
        <ol className="relative mx-auto max-w-[17rem]" aria-label="Các chặng của hành trình">
          {/* đường chấm nối chạy dọc giữa, nằm dưới các node */}
          <span
            aria-hidden
            className="absolute inset-y-6 left-1/2 -translate-x-1/2 border-l-[3px] border-dashed border-gl-green/25"
          />

          {JOURNEY_STAGES.map((s, i) => {
            const reached = i <= currentIndex;
            const isCurrent = i === currentIndex;
            const left = i % 2 === 0;
              const node = (
                <div className="relative shrink-0">
                  {isCurrent && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/leafy/act_explore2.webp"
                        alt=""
                        aria-hidden
                        className="pointer-events-none absolute -top-11 left-1/2 h-12 w-auto -translate-x-1/2 drop-shadow-md gl-float"
                      />
                      <span
                        aria-hidden
                        className={`absolute inset-0 rounded-full bg-gradient-to-br ${s.gradient} gl-pulse-ring`}
                      />
                    </>
                  )}
                  <div
                    className={`relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-[3px] leading-none transition-all ${
                      Array.from(s.emoji).length > 1 ? 'text-base' : 'text-2xl'
                    } ${
                      isCurrent
                        ? `bg-gradient-to-br ${s.gradient} border-white shadow-lg`
                        : reached
                        ? 'border-gl-green bg-white'
                        : 'border-gray-200 bg-gray-50 opacity-50 grayscale'
                    }`}
                  >
                    <span aria-hidden>{s.emoji}</span>
                  </div>
                </div>
              );
              const label = (
                <div className={left ? 'text-left' : 'text-right'}>
                  <p
                    className={`gl-display text-base font-extrabold leading-tight ${
                      isCurrent ? 'text-gl-green' : reached ? 'text-gl-green-dark' : 'text-gray-300'
                    }`}
                  >
                    {s.label}
                  </p>
                  <p className="text-xs font-bold text-gl-muted">
                    {isCurrent ? 'Con đang ở đây' : reached ? 'Đã qua' : `Cần ${s.threshold} bước`}
                  </p>
                </div>
              );

              // chặng hiện tại chừa thêm chỗ phía trên cho Leafy khỏi đè chữ hàng trên
              return (
                <li
                  key={s.stage}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`relative grid grid-cols-2 items-center gap-3 py-3 ${isCurrent ? 'mt-9' : ''}`}
                >
                  {/* Node luôn ôm sát đường chấm ở giữa, chữ đẩy ra ngoài nên
                      không bao giờ đè lên đường nối. */}
                  {left ? (
                    <>
                      <div className="flex justify-end">{node}</div>
                      {label}
                    </>
                  ) : (
                    <>
                      {label}
                      <div className="flex justify-start">{node}</div>
                    </>
                  )}
                </li>
              );
          })}
        </ol>
      </div>
    </div>
  );
}
