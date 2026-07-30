import type { GradeCode } from './types';

export interface TtsProfile {
  rate: string;
  voice: string;
}

const YOUNG_GRADES: GradeCode[] = ['kindergarten', 'kids1', 'kids2'];

// Kindergarten/primary (Kindergarten, Kids 1, Kids 2): slower rate + child-like voice
// (en-US-AnaNeural — a girl's voice from Azure's standard voice list), easier to follow.
// Teens keep the default adult speed/voice.
export function getTtsProfile(gradeCode?: string | null): TtsProfile {
  if (gradeCode && YOUNG_GRADES.includes(gradeCode as GradeCode)) {
    return { rate: '-30%', voice: 'en-US-AnaNeural' };
  }
  return { rate: '-10%', voice: 'en-US-JennyNeural' };
}
