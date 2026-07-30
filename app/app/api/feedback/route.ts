import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accuracyScore, fluencyScore, completenessScore, prosodyScore, words, referenceText } = body;

    const incorrectWords = words
      .filter((w: { accuracyScore: number; errorType: string }) => w.accuracyScore < 80 || w.errorType !== 'None')
      .map((w: { word: string; accuracyScore: number; errorType: string; phonemes: { phoneme: string; accuracyScore: number }[] }) => ({
        word: w.word,
        score: Math.round(w.accuracyScore),
        errorType: w.errorType,
        badPhonemes: w.phonemes
          .filter((p: { accuracyScore: number }) => p.accuracyScore < 70)
          .map((p: { phoneme: string; accuracyScore: number }) => `/${p.phoneme}/ (${Math.round(p.accuracyScore)})`),
      }));

    const prompt = `You are an English pronunciation teacher at GreenLeaf English Academy, helping young students improve their speaking skills.

The student just practiced reading: "${referenceText}"

Assessment results:
- Accuracy: ${Math.round(accuracyScore)}/100
- Fluency: ${Math.round(fluencyScore)}/100
- Completeness: ${Math.round(completenessScore)}/100
- Prosody: ${Math.round(prosodyScore)}/100

Words that need improvement:
${incorrectWords.length > 0
  ? incorrectWords.map((w: { word: string; score: number; errorType: string; badPhonemes: string[] }) =>
      `- "${w.word}": score ${w.score}, error "${w.errorType}"${w.badPhonemes.length > 0 ? `, weak phonemes: ${w.badPhonemes.join(', ')}` : ''}`
    ).join('\n')
  : '- No specific words need improvement'}

Write brief feedback in English (3-5 sentences) for a young student, including:
1. An overall comment (1 sentence, friendly)
2. Point out 1-2 specific errors with tips to fix them (mouth shape, tongue position)
3. A short encouragement

Write only the feedback, no title or bullet list.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const feedback = result.response.text();

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json({ error: 'Failed to generate feedback' }, { status: 500 });
  }
}
