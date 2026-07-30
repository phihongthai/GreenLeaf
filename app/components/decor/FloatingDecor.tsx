interface DecorItem {
  emoji: string;
  className: string;
  delay?: string;
}

const DEFAULT_ITEMS: DecorItem[] = [
  { emoji: '🍃', className: 'top-6 left-[5%] text-2xl', delay: '0s' },
  { emoji: '⭐', className: 'top-24 right-[6%] text-xl', delay: '0.4s' },
  { emoji: '🦋', className: 'top-[38%] left-[2%] text-2xl', delay: '0.9s' },
  { emoji: '✨', className: 'bottom-28 right-[4%] text-lg', delay: '1.3s' },
  { emoji: '🌸', className: 'bottom-12 left-[8%] text-xl', delay: '0.6s' },
  { emoji: '☁️', className: 'top-12 right-[22%] text-2xl', delay: '1.6s' },
];

// Floating decorative elements behind content — pure CSS/emoji, no image assets needed.
// Place inside a `relative` parent; component uses absolute + pointer-events-none so it won't block clicks.
export default function FloatingDecor({ items = DEFAULT_ITEMS }: { items?: DecorItem[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((it, i) => (
        <span
          key={i}
          className={`absolute opacity-60 gl-float drop-shadow-sm ${it.className}`}
          style={{ animationDelay: it.delay }}
        >
          {it.emoji}
        </span>
      ))}
    </div>
  );
}
