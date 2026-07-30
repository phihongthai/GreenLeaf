'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Music, VolumeX } from 'lucide-react';

/**
 * Fun background music for the student home page.
 *
 * Key design decisions:
 *
 * 1. OFF BY DEFAULT — user must tap to play. Browsers block autoplay audio
 *    without a user gesture, so auto-playing simply wouldn't work.
 *
 * 2. Melody generated via Web Audio API instead of loading an mp3 file.
 *    Background music files are typically 1-3MB, too heavy for students on
 *    slow rural connections; this approach costs 0 bytes and avoids licensing.
 *
 * 3. Only used on the home page. The speaking practice screen plays audio
 *    samples and records the student's voice for Azure scoring — music leaking
 *    into the mic would corrupt scores. Component auto-mutes on unmount
 *    (i.e. when navigating away from the home page).
 */

const STORAGE_KEY = 'gl-music-on';

// C major pentatonic — this scale virtually cannot produce dissonant notes,
// ideal for a loop that plays over and over.
const N = { C4: 261.63, F4: 349.23, G4: 392.0, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0 };

const BEAT = 0.34; // seconds per beat
const LOOP_BEATS = 8;

const MELODY: [number, number, number][] = [
  // [frequency, start beat, beat duration]
  [N.E5, 0, 1], [N.G5, 1, 1], [N.A5, 2, 1], [N.G5, 3, 1],
  [N.E5, 4, 1], [N.D5, 5, 1], [N.C5, 6, 2],
];

const BASS: [number, number, number][] = [
  [N.C4, 0, 2], [N.F4, 2, 2], [N.G4, 4, 2], [N.C4, 6, 2],
];

export default function BackgroundMusic() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextLoopAtRef = useRef(0);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    masterRef.current?.gain.setTargetAtTime(0, ctxRef.current?.currentTime ?? 0, 0.05);
    const ctx = ctxRef.current;
    ctxRef.current = null;
    masterRef.current = null;
    // close with a delay so audio fades out smoothly instead of cutting abruptly
    setTimeout(() => ctx?.close().catch(() => {}), 300);
  }, []);

  const start = useCallback(() => {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return false;

    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0.06; // keep it quiet — this is background music, not the main audio
    master.connect(ctx.destination);
    ctxRef.current = ctx;
    masterRef.current = master;

    const voice = (freq: number, at: number, len: number, type: OscillatorType, peak: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const dur = len * BEAT;
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(peak, at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur * 0.95);
      osc.connect(g);
      g.connect(master);
      osc.start(at);
      osc.stop(at + dur);
    };

    const scheduleLoop = (base: number) => {
      MELODY.forEach(([f, b, l]) => voice(f, base + b * BEAT, l, 'triangle', 1));
      BASS.forEach(([f, b, l]) => voice(f, base + b * BEAT, l, 'sine', 0.5));
    };

    nextLoopAtRef.current = ctx.currentTime + 0.1;
    scheduleLoop(nextLoopAtRef.current);
    nextLoopAtRef.current += LOOP_BEATS * BEAT;

    // schedule one loop ahead to prevent audio gaps between loops
    timerRef.current = setInterval(() => {
      const c = ctxRef.current;
      if (!c) return;
      while (nextLoopAtRef.current < c.currentTime + 1) {
        scheduleLoop(nextLoopAtRef.current);
        nextLoopAtRef.current += LOOP_BEATS * BEAT;
      }
    }, 400);

    return true;
  }, []);

  // Restore the previous choice.
  //
  // Can't just setOn(true) — the button would show "on" with no sound, forcing
  // the student to tap twice. So we start audio here; if the browser blocks
  // autoplay, the context stays 'suspended' and we wait for the first touch
  // anywhere to resume.
  useEffect(() => {
    let saved = false;
    try {
      saved = localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      /* localStorage blocked — skip */
    }
    if (!saved || !start()) return;

    setOn(true);
    const ctx = ctxRef.current;
    if (!ctx || ctx.state === 'running') return;

    const resume = () => {
      ctxRef.current?.resume().catch(() => {});
      document.removeEventListener('pointerdown', resume);
    };
    document.addEventListener('pointerdown', resume, { once: true });
    return () => document.removeEventListener('pointerdown', resume);
  }, [start]);

  // Cleanup on page leave — this is what prevents music from leaking into the recording screen.
  useEffect(() => () => stop(), [stop]);

  const toggle = () => {
    if (on) {
      stop();
      setOn(false);
      try { localStorage.setItem(STORAGE_KEY, '0'); } catch { /* ignore */ }
      return;
    }
    if (start()) {
      setOn(true);
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    }
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Turn off background music' : 'Turn on background music'}
      title={on ? 'Turn off background music' : 'Turn on background music'}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-md transition-colors ${
        on ? 'bg-gl-green text-white' : 'bg-white text-gl-green hover:bg-emerald-50'
      }`}
    >
      {on ? <Music className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </button>
  );
}
