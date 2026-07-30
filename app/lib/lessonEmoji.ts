// Emoji representing each Lesson topic (taken from Words Explorer mission topic),
// used as the lesson icon in lists instead of a generic book icon.
const LESSON_TOPIC_EMOJI: Record<string, string> = {
  // Kindergarten
  animals: '🐾',
  colors: '🎨',
  family: '👪',
  food: '🍽️',
  'body parts': '🖐️',
  numbers: '🔢',
  shapes: '🔷',
  weather: '⛅',
  clothes: '👕',
  'farm animals': '🐄',
  fruits: '🍎',

  // Kids 1
  toys: '🧸',
  'school things': '🎒',
  sports: '⚽',
  jobs: '👷',
  pets: '🐶',
  'rooms in a house': '🏠',
  'days of the week': '📅',
  seasons: '🍂',
  transport: '🚌',
  feelings: '😊',
  'fruits and vegetables': '🥕',

  // Kids 2
  places: '📍',
  'free time activities': '🎮',
  'school subjects': '📚',
  nature: '🏞️',
  health: '🏥',
  technology: '💻',
  festivals: '🎉',
  'zoo animals': '🦁',
  'community helpers': '👮',
  'food and restaurant': '🍽️',
  travel: '✈️',

  // Teens
  'city life': '🏙️',
  environment: '🌍',
  'technology & social media': '📱',
  education: '🎓',
  'health & lifestyle': '💪',
  'career choices': '💼',
  globalization: '🌐',
  'family & society': '👨‍👩‍👧',
  'travel & tourism': '🧳',
  volunteering: '🤝',
  'future of work': '🤖',
};

export function getLessonEmoji(topic: string): string {
  return LESSON_TOPIC_EMOJI[topic.toLowerCase().trim()] ?? '📘';
}
