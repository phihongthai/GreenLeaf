// Emoji fallback cho Words Explorer khi chưa có ảnh thật ở imageUrl.
const WORD_EMOJI: Record<string, string> = {
  // Kindergarten — Animals
  cat: '🐱',
  dog: '🐶',
  bird: '🐦',
  rat: '🐀',
  lizard: '🦎',
  // Kids 1 — Toys
  car: '🚗',
  train: '🚂',
  robot: '🤖',
  bike: '🚲',
  kite: '🪁',
  // Kids 2 — Places
  cinema: '🎬',
  'post office': '📮',
  supermarket: '🛒',
  'police station': '🚓',
  'swimming pool': '🏊',
  // Teens — City Life
  downtown: '🏙️',
  'public transport': '🚌',
  'traffic congestion': '🚦',
  'rush hour': '🕐',
  'concrete jungle': '🏢',
};

export function getWordEmoji(word: string): string {
  return WORD_EMOJI[word.toLowerCase().trim()] ?? '🖼️';
}
