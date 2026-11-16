import type { TourSlide } from './OnboardingTour';

export const TEACHER_TOUR_SLIDES: TourSlide[] = [
  {
    mood: 'wave',
    accent: 'from-sky-400 to-blue-500',
    title: "Hi, I'm Leafy! 👋",
    body: "Welcome to GreenLeaf! Here's a quick tour of the tools you'll use most as a teacher.",
  },
  {
    mood: 'point',
    accent: 'from-violet-400 to-purple-500',
    title: 'Lessons',
    body: 'Create speaking lessons for each level: Words Explorer, Phonics Chant, and Speaking Challenge. Students see new lessons right away.',
  },
  {
    mood: 'think',
    accent: 'from-amber-400 to-orange-500',
    title: 'Homework',
    body: 'Assign writing topics to a level, then review submissions and mark them as graded once you\'ve checked them.',
  },
  {
    mood: 'explore',
    accent: 'from-teal-500 to-cyan-600',
    title: 'Resource Library',
    body: 'Upload and organize lesson plans, worksheets, flashcards, audio, video and more by course and unit.',
  },
  {
    mood: 'teamwork',
    accent: 'from-rose-400 to-pink-500',
    title: 'Accounts',
    body: 'Create student and parent accounts, link parents to their children, and manage passwords or levels anytime.',
  },
  {
    mood: 'happy',
    accent: 'from-emerald-400 to-green-500',
    title: 'Track progress',
    body: 'The Students tab shows every student\'s Leaves, streak and detailed attempt history. Ready to get started?',
  },
];
