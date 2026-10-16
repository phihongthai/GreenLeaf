'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Lock, CheckCircle2, X } from 'lucide-react';
import type { Lesson } from '@/lib/types';

interface LessonWithProgress extends Lesson {
  totalMissions: number;
  completedMissions: number;
  topic: string;
}

interface StudentWorldMapProps {
  gradeCode: string;
  gradeName?: string;
  lessons: LessonWithProgress[];
  userName?: string;
  onOpenBadges?: () => void;
}

// 5 Mushroom house coordinates calibrated to the landscape map (in percentages)
const NODE_POSITIONS = [
  {
    id: 0,
    title: 'Demo',
    left: '24.2%',
    top: '43.5%',
    width: '15.5%',
    height: '34%',
    badgeTop: '-18px',
    playCenter: { left: '48%', top: '56%' },
    pedestalTop: '83%',
  },
  {
    id: 1,
    title: 'Unit 1',
    left: '44.8%',
    top: '42.5%',
    width: '13.2%',
    height: '26%',
    badgeTop: '-10px',
    playCenter: { left: '50%', top: '54%' },
    pedestalTop: '86%',
  },
  {
    id: 2,
    title: 'Unit 2',
    left: '56.6%',
    top: '25.2%',
    width: '10.0%',
    height: '19%',
    badgeTop: '-8px',
    playCenter: { left: '50%', top: '52%' },
    pedestalTop: '86%',
  },
  {
    id: 3,
    title: 'Unit 3',
    left: '73.0%',
    top: '22.6%',
    width: '9.2%',
    height: '18%',
    badgeTop: '-8px',
    playCenter: { left: '50%', top: '52%' },
    pedestalTop: '86%',
  },
  {
    id: 4,
    title: 'Unit 4',
    left: '81.8%',
    top: '14.8%',
    width: '8.4%',
    height: '17%',
    badgeTop: '-6px',
    playCenter: { left: '50%', top: '52%' },
    pedestalTop: '86%',
  },
];

export default function StudentWorldMap({
  gradeCode,
  gradeName = 'Kindergarten',
  lessons,
  userName = 'Lyn',
  onOpenBadges,
}: StudentWorldMapProps) {
  const [lockedLesson, setLockedLesson] = useState<{ title: string; unitName: string } | null>(null);
  const [leafySpeech, setLeafySpeech] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  // Play gentle web audio chime on click
  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext not allowed or unsupported
    }
  };

  const handleLeafyClick = () => {
    playChime();
    const speeches = [
      `Hi ${userName}! Ready to explore English together? 🍃`,
      `You are doing awesome today! Click on a mushroom house to start! ✨`,
      `Practice speaking with Leafy to collect 100 Leaves for a Mystery Box! 🎁`,
      `Unit 1 has lots of fun words waiting for you! 🌟`,
    ];
    const random = speeches[Math.floor(Math.random() * speeches.length)];
    setLeafySpeech(random);
    setTimeout(() => {
      setLeafySpeech((curr) => (curr === random ? null : curr));
    }, 4500);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 bg-[#aed9a8] select-none">
      {/* Scrollable Container on Mobile / Fixed 16:9 on Desktop */}
      <div className="relative w-full aspect-[16/9] min-w-[760px] md:min-w-0 overflow-hidden">
        {/* 1. Magical Background World Map Artwork */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/map/learning_map_clean.jpg"
          alt="GreenLeaf Learning Map"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Ambient Shimmer / Sun Rays Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-emerald-400/5 pointer-events-none" />

        {/* 2. Left Wooden Signboard ("Unit 1 / A New Beginning") */}
        <div
          className="absolute z-20 group cursor-pointer transition-transform hover:scale-105 active:scale-95"
          style={{
            left: '4.2%',
            top: '46.8%',
            width: '11.8%',
            height: '18%',
          }}
          onClick={() => {
            playChime();
            setLeafySpeech(`Welcome to ${gradeName}! Complete all units to unlock your certificate! 📜`);
          }}
          title="Unit Information"
        >
          {/* Invisible interactive hotspot matching the sign */}
          <div className="w-full h-full rounded-xl flex flex-col items-center justify-center text-center p-1.5">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-amber-950/80 backdrop-blur-xs text-amber-100 text-[10px] font-black rounded-lg px-2 py-1 shadow-md">
              {gradeName}
            </div>
          </div>
        </div>

        {/* 3. Interactive Leafy Mascot */}
        <div
          className="absolute z-30 cursor-pointer group transition-transform active:scale-95"
          style={{
            left: '12.8%',
            top: '51.8%',
            width: '11.8%',
            height: '25%',
          }}
          onClick={handleLeafyClick}
          title="Click to talk to Leafy!"
        >
          {/* Gentle float glow on hover */}
          <div className="w-full h-full relative flex items-center justify-center">
            {/* Pulsing ring on hover */}
            <div className="absolute inset-0 rounded-full group-hover:bg-emerald-300/20 group-hover:ring-4 group-hover:ring-emerald-300/40 transition-all pointer-events-none" />

            {/* Speech Bubble */}
            {leafySpeech && (
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white text-emerald-950 text-xs font-black px-3.5 py-2 rounded-2xl shadow-xl border-2 border-emerald-300 whitespace-nowrap z-50 gl-pop-in">
                <span>{leafySpeech}</span>
                {/* Bubble caret */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-emerald-300" />
              </div>
            )}
          </div>
        </div>

        {/* 4. The 5 Interactive Mushroom House Nodes along the Trail */}
        {NODE_POSITIONS.map((node, index) => {
          const lesson = lessons[index];
          const isDone = Boolean(
            lesson && lesson.totalMissions > 0 && lesson.completedMissions >= lesson.totalMissions
          );
          // Auto-unlock: first lesson (index 0), OR explicitly unlocked by teacher,
          // OR previous lesson was completed by student!
          const prevLesson = index > 0 ? lessons[index - 1] : null;
          const prevDone = Boolean(
            prevLesson && prevLesson.totalMissions > 0 && prevLesson.completedMissions >= prevLesson.totalMissions
          );
          const isUnlocked = index === 0 || Boolean(lesson?.is_unlocked) || prevDone;

          return (
            <div
              key={node.id}
              className="absolute z-20"
              style={{
                left: node.left,
                top: node.top,
                width: node.width,
                height: node.height,
              }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {isUnlocked && lesson ? (
                // UNLOCKED NODE: Navigates to Lesson Missions
                <Link
                  href={`/missions/${gradeCode}/${lesson.id}`}
                  onClick={playChime}
                  className="w-full h-full block relative group"
                >
                  {/* Glowing Floating Top Badge */}
                  {index === 0 && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 -top-5 z-30 transition-transform group-hover:scale-110 pointer-events-none"
                    >
                      <div className="flex items-center gap-1 bg-white/95 backdrop-blur-xs text-[#295b30] font-black text-[11px] md:text-xs px-3 py-1 rounded-full shadow-lg border-2 border-emerald-300 gl-sparkle">
                        <span>🍃</span>
                        <span>{lesson?.title ? 'Demo' : node.title}</span>
                      </div>
                    </div>
                  )}

                  {/* Play Button Overlay (Centered on the mushroom door) */}
                  <div
                    className="absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-all group-hover:scale-125"
                    style={{
                      left: node.playCenter.left,
                      top: node.playCenter.top,
                    }}
                  >
                    <div
                      className={`w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg border-2 md:border-4 border-white transition-all ${
                        isDone
                          ? 'bg-gradient-to-tr from-emerald-500 to-green-400 ring-2 ring-emerald-200'
                          : 'bg-gradient-to-tr from-amber-400 to-orange-400 ring-4 ring-amber-200/90 gl-glow-pulse'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 md:w-7 md:h-7 text-white stroke-[2.5]" />
                      ) : (
                        <Play className="w-4 h-4 md:w-6 md:h-6 text-white fill-white ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Rating Leaves on the Stone Base */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-1 z-20 pointer-events-none"
                    style={{ top: node.pedestalTop }}
                  >
                    {[1, 2, 3].map((leafStar) => {
                      const completedCount = lesson?.completedMissions ?? 0;
                      const hasLeaf = isDone || completedCount >= leafStar;
                      return (
                        <span
                          key={leafStar}
                          className={`text-xs md:text-sm transition-transform ${
                            hasLeaf ? 'opacity-100 scale-105' : 'opacity-30 grayscale'
                          }`}
                        >
                          🍃
                        </span>
                      );
                    })}
                  </div>

                  {/* Hover Information Card */}
                  {hoveredNode === node.id && (
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2 shadow-2xl border-2 border-emerald-200 text-center z-50 whitespace-nowrap gl-pop-in pointer-events-none">
                      <p className="text-xs font-black text-[#224828]">
                        {lesson.title || `Lesson ${index + 1}`}
                      </p>
                      <p className="text-[10px] font-extrabold text-emerald-600">
                        {isDone
                          ? '✓ Completed • Replay'
                          : `${lesson.completedMissions}/${lesson.totalMissions || 3} Missions Ready`}
                      </p>
                    </div>
                  )}
                </Link>
              ) : (
                // LOCKED NODE: Shows locked message on click
                <button
                  type="button"
                  onClick={() => {
                    playChime();
                    setLockedLesson({
                      title: lesson?.title || `Unit ${index + 1}`,
                      unitName: node.title,
                    });
                  }}
                  className="w-full h-full block relative group cursor-pointer focus:outline-none"
                  title={`${node.title} is Locked`}
                >
                  {/* Lock Indicator Button */}
                  <div
                    className="absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-transform group-hover:scale-110"
                    style={{
                      left: node.playCenter.left,
                      top: node.playCenter.top,
                    }}
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-900/60 backdrop-blur-xs flex items-center justify-center shadow-lg border-2 border-white/80">
                      <Lock className="w-4 h-4 md:w-5 md:h-5 text-amber-200" />
                    </div>
                  </div>

                  {/* Empty Leaves on Stone Base */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-1 z-20 pointer-events-none opacity-40 grayscale"
                    style={{ top: node.pedestalTop }}
                  >
                    <span>🍃</span>
                    <span>🍃</span>
                    <span>🍃</span>
                  </div>
                </button>
              )}
            </div>
          );
        })}

        {/* 5. Right Wooden Signpost (Mystery Box & Rewards Landmark) */}
        <div
          className="absolute z-20 group cursor-pointer transition-transform hover:scale-105 active:scale-95"
          style={{
            left: '84.2%',
            top: '62.0%',
            width: '7.8%',
            height: '15%',
          }}
          onClick={() => {
            playChime();
            onOpenBadges?.();
          }}
          title="Click to view Badges & Mystery Box!"
        >
          <div className="w-full h-full rounded-xl flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-amber-950/85 text-amber-200 text-[10px] font-black rounded-lg px-2 py-1 shadow-lg whitespace-nowrap">
              🎁 Rewards
            </div>
          </div>
        </div>
      </div>

      {/* Floating Mobile Pan Guide Hint */}
      <div className="md:hidden bg-emerald-900/80 text-white text-[11px] font-bold text-center py-1.5 px-3 flex items-center justify-center gap-1.5">
        <span>👉</span>
        <span>Swipe left and right to explore the full fantasy map!</span>
      </div>

      {/* Locked Unit Modal */}
      {lockedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 gl-pop-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 border-2 border-emerald-100 relative">
            <button
              onClick={() => setLockedLesson(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="gl-display text-xl font-black text-gray-800">
                {lockedLesson.unitName} Locked!
              </h3>
              <p className="text-xs font-semibold text-gray-600 leading-relaxed">
                Complete your active unit first or ask your GreenLeaf teacher to unlock{' '}
                <strong className="text-emerald-700">{lockedLesson.title}</strong>!
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setLockedLesson(null)}
                className="w-full bg-[#3a7d44] hover:bg-[#2d5a34] text-white font-black py-3 rounded-2xl text-sm transition-all shadow-md active:scale-95"
              >
                Got it, Leafy! 🍃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
