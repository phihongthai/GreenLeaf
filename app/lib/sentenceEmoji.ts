import { findWordEmojiInText } from './wordEmoji';
import { getLessonEmoji } from './lessonEmoji';

// Selects an illustrative emoji for a sentence/passage (Phonics, Speaking Challenge): prefers
// a recognized vocabulary word within the sentence; falls back to the lesson topic emoji.
export function getSentenceEmoji(text: string, topic?: string): string {
  return findWordEmojiInText(text) ?? getLessonEmoji(topic ?? '');
}
