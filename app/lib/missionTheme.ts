import type { MissionType } from './types';

export const MISSION_THEME: Record<MissionType, { emoji: string; label: string; announce: string; greeting: string; gradient: string; soft: string; description: string }> = {
  words_explorer: {
    emoji: '🔤',
    label: 'Words Explorer',
    announce: 'Listen and Repeat',
    greeting: 'Listen and repeat the new words!',
    gradient: 'from-sky-400 to-blue-500',
    soft: 'bg-sky-50 text-sky-700',
    description: 'Listen to new words, see their meanings, then record yourself saying each one.',
  },
  phonics: {
    emoji: '🎵',
    label: 'Phonics Chant',
    announce: 'Read Along',
    greeting: 'Read along with the sentences on screen!',
    gradient: 'from-violet-400 to-purple-500',
    soft: 'bg-violet-50 text-violet-700',
    description: 'Read along with each sentence shown on screen.',
  },
  speaking_challenge: {
    emoji: '🎤',
    label: 'Speaking Challenge',
    announce: 'Speak Up',
    greeting: 'Read the whole passage fluently!',
    gradient: 'from-amber-400 to-orange-500',
    soft: 'bg-amber-50 text-amber-700',
    description: 'Read the entire passage in one go — speak clearly and fluently.',
  },
};

// Rotating color palette for lesson list — each lesson gets a different color for visual
// variety, not tied to any meaning, just to create visual rhythm.
export const LESSON_PALETTE = [
  'from-amber-300 to-orange-400',
  'from-sky-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-teal-400 to-cyan-500',
  'from-rose-400 to-pink-500',
  'from-lime-400 to-green-500',
];
