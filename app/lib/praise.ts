import { playTTS } from './tts';
import { getTtsProfile } from './ttsProfile';

const PRAISE_PHRASES = [
  'Well done!',
  'Good job!',
  'Excellent!',
  'Amazing!',
  'Great work!',
  'Awesome!',
  'Fantastic!',
  'Super!',
];

let lastIndex = -1;

function pickRandom(): string {
  let idx: number;
  do {
    idx = Math.floor(Math.random() * PRAISE_PHRASES.length);
  } while (idx === lastIndex && PRAISE_PHRASES.length > 1);
  lastIndex = idx;
  return PRAISE_PHRASES[idx];
}

export function speakPraise(gradeCode?: string): string {
  const phrase = pickRandom();
  const { rate, voice } = getTtsProfile(gradeCode);
  playTTS(phrase, rate, voice).catch(() => {});
  return phrase;
}
