'use client';

import { useState } from 'react';
import { generateVietnameseFeedback } from '@/lib/gemini';
import type { PronunciationResult } from '@/lib/azure';

const FALLBACK_FEEDBACK = 'Chưa tạo được gợi ý lúc này — con thử đọc chậm lại, rõ từng từ nhé!';

// Gọi Gemini để tạo giải thích tiếng Việt dễ hiểu khi học sinh đọc chưa đạt, thay vì chỉ hiện
// điểm số/ký hiệu phoneme kỹ thuật mà các em (và phụ huynh không biết tiếng Anh) không tự đọc
// hiểu được. Chỉ gọi khi trượt — khi đạt thì không cần AI giải thích gì cả, đỡ tốn phí Gemini.
export function useScoreFeedback() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const requestFeedback = async (result: PronunciationResult, referenceText: string) => {
    setFeedback(null);
    setFeedbackLoading(true);
    try {
      const text = await generateVietnameseFeedback({
        accuracyScore: result.accuracyScore,
        fluencyScore: result.fluencyScore,
        completenessScore: result.completenessScore,
        prosodyScore: result.prosodyScore,
        words: result.words,
        referenceText,
      });
      setFeedback(text);
    } catch (err) {
      console.error('[feedback] generate failed:', err);
      setFeedback(FALLBACK_FEEDBACK);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const resetFeedback = () => {
    setFeedback(null);
    setFeedbackLoading(false);
  };

  return { feedback, feedbackLoading, requestFeedback, resetFeedback };
}
