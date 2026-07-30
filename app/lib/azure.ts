// Ported from pronunciation-app/lib/azure.ts — client-side helper for assess/tts API calls.

export interface PronunciationResult {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  prosodyScore: number;
  overallScore: number;
  words: WordResult[];
}

export interface WordResult {
  word: string;
  accuracyScore: number;
  errorType: string;
  phonemes: PhonemeResult[];
}

export interface PhonemeResult {
  phoneme: string;
  accuracyScore: number;
}

export async function assessPronunciation(
  audioData: ArrayBuffer,
  referenceText: string
): Promise<PronunciationResult> {
  const formData = new FormData();
  formData.append('audio', new Blob([audioData], { type: 'audio/wav' }));
  formData.append('referenceText', referenceText);

  const response = await fetch('/api/assess', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to assess pronunciation');
  }

  return response.json();
}

export interface MissionCompleteReward {
  status: 'completed' | 'try_again';
  score: number;
  leavesEarned: number;
  streakDays: number;
  bonusAwarded: boolean;
}

export async function completeMission(missionId: string, score: number): Promise<MissionCompleteReward> {
  const response = await fetch('/api/missions/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ missionId, score }),
  });

  if (!response.ok) {
    throw new Error('Failed to record mission completion');
  }

  return response.json();
}
