// Placeholder mascot — chưa có asset thật cho mèo "Brave", dùng emoji + animation tạm thời.
export default function BraveMascot({ message, size = 'md' }: { message?: string; size?: 'md' | 'lg' }) {
  const emojiSize = size === 'lg' ? 'text-8xl' : 'text-6xl';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <span className="absolute -top-3 -left-6 text-2xl gl-sparkle" style={{ animationDelay: '0.2s' }}>✨</span>
        <span className="absolute -top-1 -right-7 text-xl gl-sparkle" style={{ animationDelay: '0.7s' }}>⭐</span>
        <span className="absolute -bottom-2 -left-8 text-lg gl-sparkle" style={{ animationDelay: '1.1s' }}>🌟</span>
        <div className={`${emojiSize} drop-shadow-lg gl-float`}>🐱</div>
      </div>
      {message && (
        <div className="relative bg-white rounded-3xl px-6 py-4 shadow-lg border-2 border-[#3A7D44]/10 max-w-xs text-center gl-pop-in">
          <p className="text-base font-bold text-gray-700">{message}</p>
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-t-2 border-l-2 border-[#3A7D44]/10 rotate-45" />
        </div>
      )}
    </div>
  );
}
