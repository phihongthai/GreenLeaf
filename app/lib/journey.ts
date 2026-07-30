export type JourneyStage = 'seed' | 'young_leaf' | 'green_leaf' | 'strong_tree' | 'garden';

// Thresholds span months of learning — 1 lesson completed = +3 (3 missions),
// so Garden (highest milestone) is roughly 30-35 lessons + some Writing submissions.
export const JOURNEY_STAGES: { stage: JourneyStage; label: string; emoji: string; threshold: number; gradient: string }[] = [
  { stage: 'seed', label: 'Seed', emoji: '🌱', threshold: 0, gradient: 'from-lime-300 to-green-400' },
  { stage: 'young_leaf', label: 'Young Leaf', emoji: '🌿', threshold: 10, gradient: 'from-emerald-300 to-teal-400' },
  { stage: 'green_leaf', label: 'Green Leaf', emoji: '🍃', threshold: 30, gradient: 'from-green-400 to-emerald-500' },
  { stage: 'strong_tree', label: 'Strong Tree', emoji: '🌳', threshold: 60, gradient: 'from-emerald-500 to-green-700' },
  { stage: 'garden', label: 'Garden', emoji: '🌳🌷🌻', threshold: 100, gradient: 'from-fuchsia-400 via-rose-400 to-amber-400' },
];

// growthScore = number of Speaking missions completed (100%) + number of Writing submissions
export function getJourneyStage(growthScore: number) {
  let current = JOURNEY_STAGES[0];
  let next: (typeof JOURNEY_STAGES)[number] | null = JOURNEY_STAGES[1];

  for (let i = 0; i < JOURNEY_STAGES.length; i++) {
    if (growthScore >= JOURNEY_STAGES[i].threshold) {
      current = JOURNEY_STAGES[i];
      next = JOURNEY_STAGES[i + 1] ?? null;
    }
  }

  const progress = next ? Math.min(100, Math.round(((growthScore - current.threshold) / (next.threshold - current.threshold)) * 100)) : 100;

  return { current, next, progress };
}
