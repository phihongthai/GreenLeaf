export type JourneyStage = 'seed' | 'young_leaf' | 'green_leaf' | 'strong_tree' | 'garden';

export const JOURNEY_STAGES: { stage: JourneyStage; label: string; emoji: string; threshold: number }[] = [
  { stage: 'seed', label: 'Seed', emoji: '🌱', threshold: 0 },
  { stage: 'young_leaf', label: 'Young Leaf', emoji: '🌿', threshold: 3 },
  { stage: 'green_leaf', label: 'Green Leaf', emoji: '🍃', threshold: 6 },
  { stage: 'strong_tree', label: 'Strong Tree', emoji: '🌳', threshold: 10 },
  { stage: 'garden', label: 'Garden', emoji: '🌳🌷🌻', threshold: 15 },
];

// growthScore = số mission Speaking hoàn thành (100%) + số bài Writing đã nộp
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
