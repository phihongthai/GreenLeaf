import { findWordEmojiInText } from './wordEmoji';
import { getLessonEmoji } from './lessonEmoji';

// Chọn emoji minh hoạ cho 1 câu/đoạn văn (Phonics, Speaking Challenge): ưu tiên từ vựng nhận
// diện được trong chính câu đó, nếu không khớp gì thì lùi về emoji chủ đề của cả bài học.
export function getSentenceEmoji(text: string, topic?: string): string {
  return findWordEmojiInText(text) ?? getLessonEmoji(topic ?? '');
}
