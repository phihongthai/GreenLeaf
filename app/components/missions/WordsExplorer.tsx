'use client';

import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import Recorder from '@/components/Recorder';
import ScoreDisplay from '@/components/ScoreDisplay';
import ErrorText from '@/components/ErrorText';
import { assessPronunciation, completeMission, type PronunciationResult, type MissionCompleteReward } from '@/lib/azure';
import { audioToWav } from '@/lib/audio';
import { playTTS, isAutoplayBlocked } from '@/lib/tts';
import { getWordEmoji } from '@/lib/wordEmoji';
import { logMissionAttempt } from '@/lib/missionAttempts';
import { useScoreFeedback } from '@/lib/useScoreFeedback';
import { getTtsProfile } from '@/lib/ttsProfile';
import type { WordsExplorerContent } from '@/lib/types';

const PASS_THRESHOLD = 80;

export default function WordsExplorer({
  missionId,
  content,
  gradeCode,
  onComplete,
}: {
  missionId: string;
  content: WordsExplorerContent;
  gradeCode?: string;
  onComplete: (reward: MissionCompleteReward) => void;
}) {
  const ttsProfile = getTtsProfile(gradeCode);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [assessError, setAssessError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { feedback, feedbackLoading, requestFeedback, resetFeedback } = useScoreFeedback();

  const word = content.words[index];
  const passed = result ? result.overallScore >= PASS_THRESHOLD : false;

  useEffect(() => setImgError(false), [index]);

  const handlePlayTTS = async () => {
    setTtsError(null);
    try {
      await playTTS(word.word, ttsProfile.rate, ttsProfile.voice);
    } catch (err) {
      console.error(err);
      if (isAutoplayBlocked(err)) return;
      setTtsError(err instanceof Error ? err.message : 'Không phát được âm mẫu.');
    }
  };

  // Tự phát âm mẫu mỗi khi sang từ mới. Nếu trình duyệt chặn autoplay, nút "Nghe mẫu" vẫn dùng được bình thường.
  useEffect(() => {
    handlePlayTTS();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const handleRecording = async (blob: Blob) => {
    setBusy(true);
    setResult(null);
    setAssessError(null);
    resetFeedback();
    try {
      const wav = await audioToWav(blob);
      const res = await assessPronunciation(wav, word.word);
      setResult(res);
      logMissionAttempt(missionId, res.overallScore, word.word);
      if (res.overallScore < PASS_THRESHOLD) {
        requestFeedback(res, word.word);
      }
    } catch (err) {
      console.error(err);
      setAssessError('Không thể chấm điểm. Thử lại nhé.');
    } finally {
      setBusy(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    resetFeedback();
  };

  const handleNext = async () => {
    if (!result || !passed) return;
    const newScores = [...scores, result.overallScore];

    if (index < content.words.length - 1) {
      setScores(newScores);
      setIndex(index + 1);
      setResult(null);
      setAssessError(null);
      return;
    }

    setSubmitting(true);
    setSaveError(null);
    const avgScore = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
    try {
      const reward = await completeMission(missionId, avgScore);
      onComplete(reward);
    } catch (err) {
      console.error(err);
      setSaveError('Không thể lưu kết quả. Thử lại nhé.');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm font-bold text-gray-500">
        <span>{content.topic}</span>
        <span>{index + 1} / {content.words.length}</span>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-8 text-center space-y-4">
        <div className="w-32 h-32 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center overflow-hidden">
          {word.imageUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={word.imageUrl}
              alt={word.word}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-6xl">{getWordEmoji(word.word)}</span>
          )}
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-[#3A7D44]">{word.word}</h2>
          {word.meaning && <p className="text-base text-gray-500 font-bold mt-0.5">{word.meaning}</p>}
        </div>
        <button
          onClick={handlePlayTTS}
          className="inline-flex items-center gap-2 text-[#3A7D44] font-bold text-base hover:underline"
        >
          <Volume2 className="w-5 h-5" /> Nghe mẫu
        </button>
        {ttsError && <ErrorText message={ttsError} />}
      </div>

      <Recorder onRecordingComplete={handleRecording} disabled={busy || submitting} />

      {busy && <p className="text-center text-base text-gray-500 font-bold">Đang chấm điểm...</p>}
      {assessError && <ErrorText message={assessError} />}

      {result && (
        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
          <ScoreDisplay result={result} feedback={feedback} feedbackLoading={feedbackLoading} />
          <button
            onClick={passed ? handleNext : handleRetry}
            disabled={submitting}
            className={`w-full font-extrabold py-3.5 rounded-2xl text-white text-lg transition-colors shadow-md ${
              passed ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {submitting
              ? 'Đang lưu...'
              : passed
              ? index < content.words.length - 1 ? 'Giỏi lắm! Từ tiếp theo →' : 'Giỏi lắm! Xong phần 1 🎉'
              : 'Thử lại — ghi âm lại'}
          </button>
          {saveError && <ErrorText message={saveError} />}
        </div>
      )}
    </div>
  );
}
