'use client';

import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import Recorder from '@/components/Recorder';
import ScoreDisplay from '@/components/ScoreDisplay';
import ErrorText from '@/components/ErrorText';
import { assessPronunciation, completeMission, type PronunciationResult, type MissionCompleteReward } from '@/lib/azure';
import { audioToWav } from '@/lib/audio';
import { playTTS, isAutoplayBlocked, speakVi } from '@/lib/tts';
import { speakPraise } from '@/lib/praise';
import { logMissionAttempt } from '@/lib/missionAttempts';
import { useScoreFeedback } from '@/lib/useScoreFeedback';
import { getTtsProfile } from '@/lib/ttsProfile';
import { getSentenceEmoji } from '@/lib/sentenceEmoji';
import type { SpeakingChallengeContent } from '@/lib/types';

const PASS_THRESHOLD = 80;
const MAX_ATTEMPTS = 3;

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
  const [attempts, setAttempts] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const { feedback, feedbackLoading, requestFeedback, resetFeedback } = useScoreFeedback();
  const [praisePhrase, setPraisePhrase] = useState<string | null>(null);

  const passed = result ? result.overallScore >= PASS_THRESHOLD : false;
  const canSkip = !passed && attempts >= MAX_ATTEMPTS;

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
    setPraisePhrase(null);
    setAssessError(null);
    resetFeedback();
    try {
      const wav = await audioToWav(blob);
      const res = await assessPronunciation(wav, content.script);
      setResult(res);
      setBestScore((prev) => Math.max(prev, res.overallScore));
      logMissionAttempt(missionId, res.overallScore);
      if (res.overallScore >= PASS_THRESHOLD) {
        setPraisePhrase(speakPraise(gradeCode));
      } else {
        setAttempts((a) => a + 1);
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
    setPraisePhrase(null);
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

  const handleSkip = async () => {
    speakVi('Không sao, ôn thêm sau nhé!');
    setSubmitting(true);
    setSaveError(null);
    try {
      const reward = await completeMission(missionId, bestScore);
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
        <div className="w-28 h-28 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center overflow-hidden text-5xl">
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
          <p className="text-base font-bold text-[#3A7D44] bg-emerald-50 rounded-xl px-4 py-2.5">{content.prompt}</p>
        )}
        <p className="text-xl font-extrabold text-[#3A7D44] leading-relaxed">{content.script}</p>
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
          <ScoreDisplay result={result} feedback={feedback} feedbackLoading={feedbackLoading} onFeedbackReady={speakVi} praisePhrase={praisePhrase} />
          {passed ? (
            <button
              onClick={handleFinish}
              disabled={submitting}
              className="w-full font-extrabold py-3.5 rounded-2xl text-white text-lg transition-colors shadow-md bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? 'Đang lưu...' : 'Giỏi lắm! Xong phần 3 🎉'}
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleRetry}
                className="w-full font-extrabold py-3.5 rounded-2xl text-white text-lg transition-colors shadow-md bg-amber-500 hover:bg-amber-600"
              >
                Thử lại — ghi âm lại {attempts < MAX_ATTEMPTS && `(${attempts}/${MAX_ATTEMPTS})`}
              </button>
              {canSkip && (
                <button
                  onClick={handleSkip}
                  disabled={submitting}
                  className="w-full font-extrabold py-3 rounded-2xl text-[#3A7D44] text-base transition-colors border-2 border-gray-200 hover:border-[#3A7D44] bg-white"
                >
                  {submitting ? 'Đang lưu...' : 'Bỏ qua, ôn sau →'}
                </button>
              )}
            </div>
          )}
          {saveError && <ErrorText message={saveError} />}
        </div>
      )}
    </div>
  );
}
