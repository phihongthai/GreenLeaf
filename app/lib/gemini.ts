// Port từ pronunciation-app/lib/claude.ts — wrapper Gemini API cho feedback tiếng Việt.

export interface FeedbackRequest {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  prosodyScore: number;
  words: { word: string; accuracyScore: number; errorType: string; phonemes: { phoneme: string; accuracyScore: number }[] }[];
  referenceText: string;
}

export async function generateVietnameseFeedback(request: FeedbackRequest): Promise<string> {
  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to generate feedback');
  }

  const data = await response.json();
  return data.feedback;
}
