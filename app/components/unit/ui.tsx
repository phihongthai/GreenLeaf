'use client';

import { forwardRef, useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';

// Small shared kit so every Unit screen feels like the same game: chunky 3D buttons,
// a sticky action bar, a Leafy loader and a confetti burst.

type Variant = 'primary' | 'gold' | 'ghost';

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-[#56b963] to-[#3a7d44] text-white shadow-[0_5px_0_#1c3f22] active:translate-y-1 active:shadow-[0_1px_0_#1c3f22]',
  gold:
    'bg-gradient-to-b from-amber-400 to-orange-500 text-white shadow-[0_5px_0_#b45309] active:translate-y-1 active:shadow-[0_1px_0_#b45309]',
  ghost:
    'border-2 border-emerald-200 bg-white text-gl-green-dark shadow-[0_4px_0_#cdeac0] active:translate-y-1 active:shadow-[0_1px_0_#cdeac0]',
};

export const GameButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }>(
  function GameButton({ variant = 'primary', className = '', type = 'button', ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={`rounded-full px-7 py-2.5 font-black transition-transform focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-400 disabled:opacity-40 disabled:shadow-none disabled:active:translate-y-0 ${VARIANT[variant]} ${className}`}
        {...props}
      />
    );
  }
);

/**
 * Back on the left, the one main action on the right. It sits in the page flow (a sticky bar would hide the
 * letter tray on short screens); callers scroll the main button into view when it becomes usable.
 */
export function ActionBar({ left, right }: { left?: ReactNode; right?: ReactNode }) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-3xl bg-white/80 p-2 shadow-sm backdrop-blur">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

/** Leafy bobbing while a screen loads, instead of bare "Loading…" text. */
export function LeafyLoader({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12" role="status" aria-live="polite">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/leafy/hero_wave.webp" alt="" className="gl-float h-28 w-28 object-contain" />
      <p className="text-sm font-bold text-gl-muted-dark">{label}</p>
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-2xl bg-emerald-100/80 ${className}`} />;
}

const BITS = ['🍃', '⭐', '🎉', '🌟', '🍀', '✨'];

/** One-off falling confetti; removes itself after the animation. Pure decoration (aria-hidden). */
export function Confetti() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setOn(false), 4200);
    return () => clearTimeout(t);
  }, []);
  if (!on) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {Array.from({ length: 22 }, (_, i) => (
        <span
          key={i}
          className="gl-confetti absolute text-2xl"
          style={{
            left: `${(i * 37) % 100}%`,
            top: 0,
            ['--gl-drift' as string]: `${((i * 53) % 80) - 40}px`,
            ['--gl-delay' as string]: `${(i % 7) * 0.12}s`,
            ['--gl-dur' as string]: `${2.4 + (i % 5) * 0.3}s`,
          }}
        >
          {BITS[i % BITS.length]}
        </span>
      ))}
    </div>
  );
}

/** Short buzz on phones that support it; silently ignored elsewhere. */
export function buzz(ok: boolean) {
  try {
    navigator.vibrate?.(ok ? 25 : [40, 40, 40]);
  } catch {
    /* not supported */
  }
}

/** Scroll just enough that `el` sits above the bottom tab bar (scrollIntoView ignores the fixed bar). */
export function revealAboveNav(el: HTMLElement | null) {
  if (!el) return;
  const nav = document.querySelector<HTMLElement>('nav[aria-label="Main navigation"] ul');
  const limit = (nav?.getBoundingClientRect().top ?? window.innerHeight) - 12;
  const over = el.getBoundingClientRect().bottom - limit;
  if (over > 0) window.scrollBy({ top: over, behavior: 'smooth' });
}
