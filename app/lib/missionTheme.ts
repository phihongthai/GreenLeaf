import type { MissionType } from './types';

export const MISSION_THEME: Record<MissionType, { emoji: string; label: string; labelVi: string; announce: string; greeting: string; gradient: string; soft: string; description: string }> = {
  words_explorer: {
    emoji: '🔤',
    label: 'Words Explorer',
    labelVi: 'Học từ vựng',
    announce: 'Listen and Repeat',
    greeting: 'Nghe và đọc theo từ mới nào!',
    gradient: 'from-sky-400 to-blue-500',
    soft: 'bg-sky-50 text-sky-700',
    description: 'Nghe từ mới, xem nghĩa tiếng Việt, rồi ghi âm đọc lại từng từ.',
  },
  phonics: {
    emoji: '🎵',
    label: 'Phonics Chant',
    labelVi: 'Đọc theo câu',
    announce: 'Read Along',
    greeting: 'Đọc theo câu trên màn hình nhé!',
    gradient: 'from-violet-400 to-purple-500',
    soft: 'bg-violet-50 text-violet-700',
    description: 'Đọc theo từng câu hiển thị trên màn hình.',
  },
  speaking_challenge: {
    emoji: '🎤',
    label: 'Speaking Challenge',
    labelVi: 'Nói cả đoạn',
    announce: 'Speak Up',
    greeting: 'Nói cả đoạn thật trôi chảy nào!',
    gradient: 'from-amber-400 to-orange-500',
    soft: 'bg-amber-50 text-amber-700',
    description: 'Đọc cả đoạn văn một lượt, đọc trôi chảy nhé.',
  },
};

// Bảng màu xoay vòng cho danh sách bài học — mỗi bài 1 màu khác nhau cho đỡ đơn điệu,
// không gắn theo ý nghĩa gì, chỉ để tạo nhịp điệu thị giác.
export const LESSON_PALETTE = [
  'from-amber-300 to-orange-400',
  'from-sky-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-teal-400 to-cyan-500',
  'from-rose-400 to-pink-500',
  'from-lime-400 to-green-500',
];
