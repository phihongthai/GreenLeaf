export const THEME = {
  colors: {
    primary: '#3A7D44',
    primaryDark: '#2E4A34',
    primaryLight: '#CDEAC0',
    background: '#F7F4EC',
    cream: '#FAF7EE',
    gold: '#C9A876',
    streak: '#FF7A1A',
    streakLight: '#FFE8D6',
    card: '#FFFFFF',
    text: '#1E293B',
    textMuted: '#64748B',
    border: '#E2E8F0',
    success: '#10B981',
    accentBlue: '#38BDF8',
    accentPurple: '#A855F7',
    accentPink: '#EC4899',
    accentOrange: '#FB923C',
  },
};

export const LESSON_GRADIENTS: [string, string][] = [
  ['#38BDF8', '#0284C7'], // Sky blue
  ['#A855F7', '#7C3AED'], // Purple
  ['#FB923C', '#EA580C'], // Orange
  ['#EC4899', '#DB2777'], // Pink
  ['#10B981', '#059669'], // Emerald
  ['#FACC15', '#CA8A04'], // Amber
];

export function getLessonEmoji(topic?: string): string {
  const t = (topic || '').toLowerCase();
  if (t.includes('color')) return '🎨';
  if (t.includes('animal') || t.includes('pet')) return '🦁';
  if (t.includes('food') || t.includes('fruit')) return '🍎';
  if (t.includes('number') || t.includes('count')) return '🔢';
  if (t.includes('family')) return '👨‍👩‍👧';
  if (t.includes('school')) return '🎒';
  if (t.includes('weather') || t.includes('nature')) return '⛅';
  if (t.includes('toy')) return '🧸';
  if (t.includes('body')) return '👀';
  return '🍃';
}
