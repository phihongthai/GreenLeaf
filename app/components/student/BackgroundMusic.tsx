'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Music, VolumeX } from 'lucide-react';

/**
 * Nhạc nền vui cho trang chủ học sinh.
 *
 * Vài quyết định quan trọng, không phải tuỳ hứng:
 *
 * 1. TẮT MẶC ĐỊNH, phải bấm mới chạy. Trình duyệt chặn autoplay âm thanh khi
 *    chưa có thao tác người dùng — nhạc tự động sẽ đơn giản là không kêu.
 *
 * 2. Sinh giai điệu bằng Web Audio API thay vì tải file mp3. File nhạc nền
 *    thường 1-3MB, quá nặng với học sinh vùng nông thôn dùng mạng yếu; cách
 *    này tốn 0 byte tải về và không vướng bản quyền.
 *
 * 3. Chỉ đặt ở trang chủ. Màn luyện nói vừa phát âm mẫu vừa thu tiếng học
 *    sinh để Azure chấm điểm — nhạc lọt vào mic sẽ làm sai điểm. Component
 *    tự tắt tiếng khi bị unmount (tức là khi rời trang chủ).
 */

const STORAGE_KEY = 'gl-music-on';

// Đô trưởng ngũ cung — thang âm này gần như không thể tạo ra nốt nghịch tai,
// hợp với vòng lặp nghe đi nghe lại nhiều lần.
const N = { C4: 261.63, F4: 349.23, G4: 392.0, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0 };

const BEAT = 0.34; // giây mỗi phách
const LOOP_BEATS = 8;

const MELODY: [number, number, number][] = [
  // [tần số, phách bắt đầu, độ dài phách]
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
    // đóng trễ để tiếng tắt mượt thay vì cụt ngang
    setTimeout(() => ctx?.close().catch(() => {}), 300);
  }, []);

  const start = useCallback(() => {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return false;

    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0.06; // nhỏ thôi, là nhạc nền chứ không phải nhạc chính
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

    // lên lịch trước một vòng để không bị hụt tiếng giữa các vòng lặp
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

  // Khôi phục lựa chọn lần trước.
  //
  // Không được chỉ setOn(true) rồi thôi: nút sẽ hiện "đang bật" mà không có
  // tiếng, và học sinh phải bấm hai lần mới nghe được. Nên vẫn khởi động
  // audio ở đây; nếu trình duyệt chặn autoplay thì context ở trạng thái
  // 'suspended', ta chờ cú chạm đầu tiên bất kỳ để resume.
  useEffect(() => {
    let saved = false;
    try {
      saved = localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      /* localStorage bị chặn thì bỏ qua */
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

  // Dọn dẹp khi rời trang — đây là thứ giữ cho nhạc không lọt vào màn ghi âm.
  useEffect(() => () => stop(), [stop]);

  const toggle = () => {
    if (on) {
      stop();
      setOn(false);
      try { localStorage.setItem(STORAGE_KEY, '0'); } catch { /* bỏ qua */ }
      return;
    }
    if (start()) {
      setOn(true);
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* bỏ qua */ }
    }
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
      title={on ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-md transition-colors ${
        on ? 'bg-gl-green text-white' : 'bg-white text-gl-green hover:bg-emerald-50'
      }`}
    >
      {on ? <Music className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </button>
  );
}
