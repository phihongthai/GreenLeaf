'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const SLIDES = [
  {
    emoji: '👋',
    title: 'Welcome to GreenLeaf!',
    body: 'This is your English practice app with Leafy. Let\'s explore together!',
  },
  {
    emoji: '📚',
    title: 'Pick a lesson',
    body: 'The home page shows your lessons. Tap a lesson card to start practicing.',
  },
  {
    emoji: '🎤',
    title: 'Listen, then record',
    body: 'Each lesson has 3 parts. Listen to the sample first, then tap the green button to record yourself. Tap the red button when done.',
  },
  {
    emoji: '🍃',
    title: 'Pass to earn Leaves!',
    body: 'Score 80% or higher to earn Leaves and move to the next part.',
  },
  {
    emoji: '🔥',
    title: 'Practice every day',
    body: 'Practice daily to keep your streak going. Bring your Leaves to the academy to redeem prizes!',
  },
];

const storageKey = (userId: string) => `greenleaf_onboarding_seen_${userId}`;

export default function FirstTimeGuide({ userId }: { userId: string | null }) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!userId) return;
    try {
      if (!localStorage.getItem(storageKey(userId))) setVisible(true);
    } catch {
      // localStorage unavailable (incognito mode...) — skip, don't block the app.
    }
  }, [userId]);

  const dismiss = () => {
    setVisible(false);
    if (userId) {
      try {
        localStorage.setItem(storageKey(userId), '1');
      } catch {
        // ignore
      }
    }
  };

  if (!visible) return null;

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6 space-y-5 gl-pop-in">
        <div className="text-center space-y-3">
          <div className="text-6xl gl-float">{slide.emoji}</div>
          <h2 className="text-xl font-extrabold text-[#3A7D44]">{slide.title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{slide.body}</p>
        </div>

        <div className="flex justify-center gap-1.5">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-[#3A7D44]' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        {isLast ? (
          <div className="space-y-2">
            <button
              onClick={dismiss}
              className="w-full bg-[#3A7D44] hover:bg-[#2E4A34] text-white font-extrabold py-3 rounded-xl transition-colors"
            >
              Start learning →
            </button>
            <Link
              href="/help"
              onClick={dismiss}
              className="block text-center text-xs font-bold text-gray-400 hover:text-[#3A7D44] transition-colors"
            >
              View full guide
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <button onClick={dismiss} className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
              Skip
            </button>
            <button
              onClick={() => setStep((s) => s + 1)}
              className="bg-[#3A7D44] hover:bg-[#2E4A34] text-white font-extrabold py-2 px-5 rounded-xl text-sm transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
