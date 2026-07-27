'use client';

import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import Recorder from '@/components/Recorder';
import ScoreDisplay from '@/components/ScoreDisplay';
import ErrorText from '@/components/ErrorText';
import { assessPronunciation, completeMission, type PronunciationResult, type MissionCompleteReward } from '@/lib/azure';
import { audioToWav } from '@/lib/audio';
import { playTTS, isAutoplayBlocked } from '@/lib/tts';
import { logMissionAttempt } from '@/lib/missionAttempts';
import { useScoreFeedback } from '@/lib/useScoreFeedback';
import type { PhonicsContent } from '@/lib/types';

const PASS_THRESHOLD = 80;

function highlightLine(line: string, highlight?: string) {
  if (!highlight) return line;
  const parts = line.split(new RegExp(`(${highlight})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === highlight.toLowerCase() ? (
      <span key={i} className="text-[#3A7D44] font-extrabold">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function PhonicsChant({
  missionId,
  content,
  title,
  onComplete,
}: {
  missionId: string;
  content: PhonicsContent;
  title: string;
  onComplete: (reward: MissionCompleteReward) => void;
}) {
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [assessError, setAssessError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { feedback, feedbackLoading, requestFeedback, resetFeedback } = useScoreFeedback();

  const line = content.lines[index];
  const passed = result ? result.overallScore >= PASS_THRESHOLD : false;

  const handlePlayTTS = async () => {
    setTtsError(null);
    try {
      await playTTS(line);
    } catch (err) {
      console.error(err);
      if (isAutoplayBlocked(err)) return;
      setTtsError(err instanceof Error ? err.message : 'Không phát được âm mẫu.');
    }
  };

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
      const res = await assessPronunciation(wav, line);
      setResult(res);
      logMissionAttempt(missionId, res.overallScore);
      if (res.overallScore < PASS_THRESHOLD) {
        requestFeedback(res, line);
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

    if (index < content.lines.length - 1) {
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
      <div className="flex items-center justify-between text-xs font-bold text-gray-400">
        <span>{title}</span>
        <span>{index + 1} / {content.lines.length}</span>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-8 text-center space-y-4">
        <p className="text-xl font-bold text-gray-800 leading-relaxed">
          {highlightLine(line, content.highlight)}
        </p>
        <button
          onClick={handlePlayTTS}
          className="inline-flex items-center gap-2 text-[#3A7D44] font-semibold text-sm hover:underline"
        >
          <Volume2 className="w-4 h-4" /> Nghe mẫu
        </button>
        {ttsError && <ErrorText message={ttsError} />}
      </div>

      <Recorder onRecordingComplete={handleRecording} disabled={busy || submitting} />

      {busy && <p className="text-center text-sm text-gray-400">Đang chấm điểm...</p>}
      {assessError && <ErrorText message={assessError} />}

      {result && (
        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
          <ScoreDisplay result={result} feedback={feedback} feedbackLoading={feedbackLoading} />
          <button
            onClick={passed ? handleNext : handleRetry}
            disabled={submitting}
            className={`w-full font-bold py-3 rounded-xl text-white transition-colors ${
              passed ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {submitting
              ? 'Đang lưu...'
              : passed
              ? index < content.lines.length - 1 ? 'Well done! Câu tiếp theo →' : 'Well done! Hoàn thành Mission 2'
              : 'Try again — ghi âm lại'}
          </button>
          {saveError && <ErrorText message={saveError} />}
        </div>
      )}
    </div>
  );
}
