// Ported from pronunciation-app/lib/azure.ts — client-side helper for assess/tts API calls.

export interface PronunciationResult {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  prosodyScore: number;
  overallScore: number;
  // Signed proof this score came from a real Azure assessment — forward it to completeMission()
  // instead of the raw number, so a client can't fabricate a passing score.
  token: string;
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

// One verified attempt per word/line/script in the mission, in order — the server recomputes
// the final score from these (each checked against its signed token) rather than trusting any
// aggregate the client sends.
export interface VerifiedAttempt {
  referenceText: string;
  score: number;
  token: string;
}

export async function completeMission(missionId: string, attempts: VerifiedAttempt[]): Promise<MissionCompleteReward> {
  const response = await fetch('/api/missions/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ missionId, attempts }),
  });

  if (!response.ok) {
    throw new Error('Failed to record mission completion');
  }

  return response.json();
}
