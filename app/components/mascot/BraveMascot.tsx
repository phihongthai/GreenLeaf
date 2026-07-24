// Placeholder mascot — chưa có asset thật cho mèo "Brave", dùng emoji + bubble chat tạm thời.
export default function BraveMascot({ message, size = 'md' }: { message?: string; size?: 'md' | 'lg' }) {
  const emojiSize = size === 'lg' ? 'text-7xl' : 'text-5xl';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${emojiSize} drop-shadow-sm`}>🐱</div>
      {message && (
        <div className="relative bg-white rounded-2xl px-5 py-3 shadow-md max-w-xs text-center">
          <p className="text-sm font-semibold text-gray-700">{message}</p>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45" />
        </div>
      )}
    </div>
  );
}
