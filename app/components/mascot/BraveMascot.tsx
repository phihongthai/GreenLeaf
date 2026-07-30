type Mood = 'idle' | 'happy' | 'cheer' | 'thinking' | 'oops';

const MOOD_STYLES: Record<Mood, { cat: string; sparkles: string[]; ring: string }> = {
  idle: { cat: '🐱', sparkles: ['✨', '⭐', '🌟'], ring: 'border-[#3A7D44]/10' },
  happy: { cat: '😻', sparkles: ['✨', '💚', '⭐'], ring: 'border-emerald-300' },
  cheer: { cat: '😻', sparkles: ['🎉', '✨', '🎊'], ring: 'border-[#C9A876]/50' },
  thinking: { cat: '🐱', sparkles: ['💭', '❓', '✨'], ring: 'border-sky-200' },
  oops: { cat: '🙀', sparkles: ['💦', '❗', '✨'], ring: 'border-amber-200' },
};

// Placeholder mascot — no real asset for "Brave" cat yet, using emoji + animation.
export default function BraveMascot({
  message,
  size = 'md',
  mood = 'idle',
}: {
  message?: string;
  size?: 'md' | 'lg';
  mood?: Mood;
}) {
  const emojiSize = size === 'lg' ? 'text-8xl' : 'text-6xl';
  const { cat, sparkles, ring } = MOOD_STYLES[mood];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <span className="absolute -top-3 -left-6 text-2xl gl-sparkle" style={{ animationDelay: '0.2s' }}>{sparkles[0]}</span>
        <span className="absolute -top-1 -right-7 text-xl gl-sparkle" style={{ animationDelay: '0.7s' }}>{sparkles[1]}</span>
        <span className="absolute -bottom-2 -left-8 text-lg gl-sparkle" style={{ animationDelay: '1.1s' }}>{sparkles[2]}</span>
        <div className={`${emojiSize} drop-shadow-lg gl-float`}>{cat}</div>
      </div>
      {message && (
        <div className={`relative bg-white rounded-3xl px-6 py-4 shadow-lg border-2 ${ring} max-w-xs text-center gl-pop-in`}>
          <p className="text-base font-bold text-gray-700">{message}</p>
          <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-t-2 border-l-2 ${ring} rotate-45`} />
        </div>
      )}
    </div>
  );
}
