'use client';

import { X, Trophy, Sparkles, CheckCircle2, Lock, Gift } from 'lucide-react';
import MysteryBox from '@/components/student/MysteryBox';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  leafCount: number;
  streakDays: number;
}

const BADGES = [
  {
    id: 'first_step',
    title: 'First Words',
    desc: 'Completed your first speaking mission',
    icon: '🌱',
    reqLeaves: 1,
  },
  {
    id: 'streak_3',
    title: 'Daily Streak',
    desc: 'Learned for 3 consecutive days',
    icon: '🔥',
    reqStreak: 3,
  },
  {
    id: 'pronunciation_star',
    title: 'Voice Star',
    desc: 'Achieved high accuracy on pronunciation',
    icon: '⭐',
    reqLeaves: 15,
  },
  {
    id: 'leaf_collector',
    title: 'Leaf Master',
    desc: 'Gathered 50 green leaves',
    icon: '🍃',
    reqLeaves: 50,
  },
  {
    id: 'mystery_adventurer',
    title: 'Box Explorer',
    desc: 'Reached 100 leaves for the Mystery Box',
    icon: '🎁',
    reqLeaves: 100,
  },
];

export default function BadgesModal({
  isOpen,
  onClose,
  userId,
  leafCount,
  streakDays,
}: BadgesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 gl-pop-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#f7fdf7] p-6 shadow-2xl border-4 border-emerald-100 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-emerald-100 text-gray-500 hover:text-emerald-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 bg-emerald-100/80 px-4 py-1.5 rounded-full text-emerald-800 font-extrabold text-sm">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Badges & Mystery Rewards</span>
          </div>
          <h2 className="gl-display text-2xl font-black text-[#234b2a]">Your Learning Achievements</h2>
          <p className="text-xs text-gray-600">Earn Leaves and maintain your streak to unlock secret treasures!</p>
        </div>

        {/* Quick Stats Pill Bar */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-sm">
            <span className="text-3xl">🍃</span>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Leaves</p>
              <p className="text-xl font-black text-emerald-700">{leafCount} Leaves</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-orange-100 shadow-sm">
            <span className="text-3xl">🔥</span>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Daily Streak</p>
              <p className="text-xl font-black text-orange-600">{streakDays} Days</p>
            </div>
          </div>
        </div>

        {/* Mystery Box Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#2e5933]">
            <Gift className="w-4 h-4 text-emerald-600" />
            <span>MYSTERY BOX REDEMPTION</span>
          </div>
          <MysteryBox userId={userId} leafCount={leafCount} />
        </div>

        {/* Badges Grid */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#2e5933]">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>UNLOCKED BADGES</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BADGES.map((b) => {
              const unlockedByLeaves = b.reqLeaves !== undefined ? leafCount >= b.reqLeaves : false;
              const unlockedByStreak = b.reqStreak !== undefined ? streakDays >= b.reqStreak : false;
              const isUnlocked = unlockedByLeaves || unlockedByStreak;

              return (
                <div
                  key={b.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    isUnlocked
                      ? 'bg-white border-emerald-200 shadow-sm'
                      : 'bg-gray-100/70 border-gray-200 opacity-60'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                    isUnlocked ? 'bg-amber-50 border border-amber-200' : 'bg-gray-200'
                  }`}>
                    {b.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="font-extrabold text-xs text-gray-800 truncate">{b.title}</p>
                      {isUnlocked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#3a7d44] hover:bg-[#2d5a34] text-white font-extrabold py-3 rounded-2xl text-sm transition-all shadow-md active:scale-95"
        >
          Keep Learning! 🍃
        </button>
      </div>
    </div>
  );
}
