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
import { getTtsProfile } from '@/lib/ttsProfile';
import { getSentenceEmoji } from '@/lib/sentenceEmoji';
import type { SpeakingChallengeContent } from '@/lib/types';

const PASS_THRESHOLD = 80;

export default function SpeakingChallenge({
  missionId,
  content,
  gradeCode,
  topic,
  onComplete,
}: {
  missionId: string;
  content: SpeakingChallengeContent;
  gradeCode?: string;
  topic?: string;
  onComplete: (reward: MissionCompleteReward) => void;
}) {
  const ttsProfile = getTtsProfile(gradeCode);
  const [imgError, setImgError] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [assessError, setAssessError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { feedback, feedbackLoading, requestFeedback, resetFeedback } = useScoreFeedback();

  const passed = result ? result.overallScore >= PASS_THRESHOLD : false;

  const handlePlayTTS = async () => {
    setTtsError(null);
    try {
      await playTTS(content.script, ttsProfile.rate, ttsProfile.voice);
    } catch (err) {
      console.error(err);
      if (isAutoplayBlocked(err)) return;
      setTtsError(err instanceof Error ? err.message : 'Không phát được âm mẫu.');
    }
  };

  useEffect(() => {
    handlePlayTTS();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRecording = async (blob: Blob) => {
    setBusy(true);
    setResult(null);
    setAssessError(null);
    resetFeedback();
    try {
      const wav = await audioToWav(blob);
      const res = await assessPronunciation(wav, content.script);
      setResult(res);
      logMissionAttempt(missionId, res.overallScore);
      if (res.overallScore < PASS_THRESHOLD) {
        requestFeedback(res, content.script);
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

  const handleFinish = async () => {
    if (!result || !passed) return;
    setSubmitting(true);
    setSaveError(null);
    try {
      const reward = await completeMission(missionId, result.overallScore);
      onComplete(reward);
    } catch (err) {
      console.error(err);
      setSaveError('Không thể lưu kết quả. Thử lại nhé.');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm p-8 space-y-4">
        <div className="w-24 h-24 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center overflow-hidden text-5xl">
          {content.imageUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.imageUrl}
              alt={content.imageDescription || 'Speaking Challenge'}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            getSentenceEmoji(content.script, topic)
          )}
        </div>
        {content.prompt && (
          <p className="text-sm font-semibold text-[#3A7D44] bg-emerald-50 rounded-xl px-4 py-2">{content.prompt}</p>
        )}
        <p className="text-lg font-semibold text-gray-800 leading-relaxed">{content.script}</p>
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
            onClick={passed ? handleFinish : handleRetry}
            disabled={submitting}
            className={`w-full font-bold py-3 rounded-xl text-white transition-colors ${
              passed ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {submitting ? 'Đang lưu...' : passed ? 'Well done! Hoàn thành Mission 3' : 'Try again — ghi âm lại'}
          </button>
          {saveError && <ErrorText message={saveError} />}
        </div>
      )}
    </div>
  );
}
