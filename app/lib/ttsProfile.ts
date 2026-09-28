import type { GradeCode } from './types';

export interface TtsProfile {
  rate: string;
  voice: string;
}

const YOUNG_GRADES: GradeCode[] = ['kindergarten', 'kids1', 'kids2'];

/**
 * TTS profile for learning content (words, phonics chant sentences, speaking passages).
 * Paced clearly and distinctly so ESL learners can hear each phoneme and word boundaries.
 */
export function getLessonTtsProfile(gradeCode?: string | null): TtsProfile {
  if (gradeCode === 'kindergarten') {
    return { rate: '-25%', voice: 'en-US-AnaNeural' };
  }
  if (gradeCode && YOUNG_GRADES.includes(gradeCode as GradeCode)) {
    return { rate: '-20%', voice: 'en-US-AnaNeural' };
  }
  return { rate: '-15%', voice: 'en-US-JennyNeural' };
}

/**
 * TTS profile for mascot instructions, UI announcements ("Mission 1: Listen and Repeat!"), and praises.
 * Uses a natural, cheerful, energetic tempo (0% / 1.0x rate) so instructions do not drag sluggishly.
 */
export function getInstructionTtsProfile(gradeCode?: string | null): TtsProfile {
  if (gradeCode && YOUNG_GRADES.includes(gradeCode as GradeCode)) {
    return { rate: '0%', voice: 'en-US-AnaNeural' };
  }
  return { rate: '0%', voice: 'en-US-JennyNeural' };
}

/**
 * Backward-compatible alias defaulting to lesson content profile.
 */
export function getTtsProfile(gradeCode?: string | null): TtsProfile {
  return getLessonTtsProfile(gradeCode);
}
