'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X } from 'lucide-react';
import Leafy, { type LeafyMood } from '@/components/mascot/Leafy';

export interface TourSlide {
  mood: LeafyMood;
  accent: string; // tailwind gradient classes, e.g. "from-sky-400 to-blue-500"
  title: string;
  body: string;
}

export default function OnboardingTour({
  open,
  slides,
  guideHref,
  finishLabel,
  onClose,
}: {
  open: boolean;
  slides: TourSlide[];
  guideHref: string;
  finishLabel: string;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  const slide = slides[step];
  const isLast = step === slides.length - 1;

  const finish = () => {
    setStep(0);
    onClose();
  };

  // Rendered into document.body via a portal: a naive `fixed inset-0` here
  // would otherwise be scoped to whichever ancestor nav bar renders this
  // (e.g. one with backdrop-blur), since filter/backdrop-filter establish a
  // new containing block for fixed-position descendants.
  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/45 p-4">
      <div className="flex min-h-full items-center justify-center">
        <div className={`relative w-full max-w-sm rounded-3xl bg-gradient-to-br ${slide.accent} p-1 shadow-2xl gl-pop-in`}>
          <div className="relative space-y-5 rounded-[1.35rem] bg-white px-6 pb-6 pt-10 text-center">
            <button
              type="button"
              onClick={finish}
              aria-label="Skip tour"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex justify-center">
              <Leafy key={step} mood={slide.mood} size="md" entrance="pop" />
            </div>

            <div className="space-y-2">
              <h2 className="gl-display text-xl font-extrabold text-gl-green-dark">{slide.title}</h2>
              <p className="text-sm leading-relaxed text-gray-500">{slide.body}</p>
            </div>

            <div className="flex justify-center gap-1.5">
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === step ? 'w-5 bg-gl-green' : 'w-2 bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {isLast ? (
              <div className="space-y-2 pt-1">
                <button
                  onClick={finish}
                  className="w-full rounded-xl bg-gl-green py-3 font-extrabold text-white transition-colors hover:bg-gl-green-dark"
                >
                  {finishLabel}
                </button>
                <Link
                  href={guideHref}
                  onClick={finish}
                  className="block text-center text-xs font-bold text-gray-400 transition-colors hover:text-gl-green"
                >
                  View full guide
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <button onClick={finish} className="text-xs font-bold text-gray-400 transition-colors hover:text-gray-600">
                  Skip
                </button>
                <div className="flex items-center gap-2">
                  {step > 0 && (
                    <button
                      onClick={() => setStep((s) => s - 1)}
                      className="rounded-xl px-4 py-2 text-sm font-bold text-gray-400 transition-colors hover:text-gray-600"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={() => setStep((s) => s + 1)}
                    className="rounded-xl bg-gl-green px-5 py-2 text-sm font-extrabold text-white transition-colors hover:bg-gl-green-dark"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
