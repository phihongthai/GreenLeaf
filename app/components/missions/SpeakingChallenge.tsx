'use client';

import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import Recorder from '@/components/Recorder';
import ScoreDisplay from '@/components/ScoreDisplay';
import ErrorText from '@/components/ErrorText';
import { assessPronunciation, completeMission, type PronunciationResult, type MissionCompleteReward } from '@/lib/azure';
import { audioToWav } from '@/lib/audio';
import { playTTS, isAutoplayBlocked } from '@/lib/tts';
import { speakPraise } from '@/lib/praise';
import { logMissionAttempt } from '@/lib/missionAttempts';

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
  const [best, setBest] = useState<{ score: number; token: string } | null>(null);
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
      setTtsError(err instanceof Error ? err.message : 'Could not play the audio sample.');
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
    try {
      const wav = await audioToWav(blob);
      const res = await assessPronunciation(wav, content.script);
      setResult(res);
      setBest((prev) => (!prev || res.overallScore > prev.score ? { score: res.overallScore, token: res.token } : prev));
      logMissionAttempt(missionId, res.overallScore);
      if (res.overallScore >= PASS_THRESHOLD) {
        setPraisePhrase(speakPraise(gradeCode));
      } else {
        setAttempts((a) => a + 1);
      }
    } catch (err) {
      console.error(err);
      setAssessError('Could not score your recording. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setPraisePhrase(null);
  };

  const handleFinish = async () => {
    if (!result || !passed) return;
    setSubmitting(true);
    setSaveError(null);
    try {
      const reward = await completeMission(missionId, [{ referenceText: content.script, score: result.overallScore, token: result.token }]);
      onComplete(reward);
    } catch (err) {
      console.error(err);
      setSaveError('Could not save your result. Please try again.');
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!best) return;
    playTTS('No worries, you can practice more later!', ttsProfile.rate, ttsProfile.voice).catch(() => {});
    setSubmitting(true);
    setSaveError(null);
    try {
      const reward = await completeMission(missionId, [{ referenceText: content.script, score: best.score, token: best.token }]);
      onComplete(reward);
    } catch (err) {
      console.error(err);
      setSaveError('Could not save your result. Please try again.');
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
        <div className="space-y-1.5 text-left">
          {content.script.split(/(?<=[\.\!\?])\s+/).filter(Boolean).map((line, i) => (
            <p key={i} className={`text-lg font-extrabold text-[#3A7D44] leading-relaxed flex items-start gap-2 ${i % 2 === 1 ? 'pl-6' : ''}`}>
              <span className="text-sm text-gl-muted mt-0.5 shrink-0" aria-hidden>{i % 2 === 0 ? '♫' : '♪'}</span>
              {line}
            </p>
          ))}
        </div>
        <button
          onClick={handlePlayTTS}
          className="inline-flex items-center gap-2 text-[#3A7D44] font-bold text-base hover:underline"
        >
          <Volume2 className="w-5 h-5" /> Listen
        </button>
        {ttsError && <ErrorText message={ttsError} />}
      </div>

      <Recorder onRecordingComplete={handleRecording} disabled={busy || submitting} />

      {busy && <p className="text-center text-base text-gray-500 font-bold">Scoring...</p>}
      {assessError && <ErrorText message={assessError} />}

      {result && (
        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
          <ScoreDisplay result={result} praisePhrase={praisePhrase} />
          {passed ? (
            <button
              onClick={handleFinish}
              disabled={submitting}
              className="w-full font-extrabold py-3.5 rounded-2xl text-white text-lg transition-colors shadow-md bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? 'Saving...' : 'Well done! Part 3 complete 🎉'}
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleRetry}
                className="w-full font-extrabold py-3.5 rounded-2xl text-white text-lg transition-colors shadow-md bg-amber-500 hover:bg-amber-600"
              >
                Try again — re-record {attempts < MAX_ATTEMPTS && `(${attempts}/${MAX_ATTEMPTS})`}
              </button>
              {canSkip && (
                <button
                  onClick={handleSkip}
                  disabled={submitting}
                  className="w-full font-extrabold py-3 rounded-2xl text-[#3A7D44] text-base transition-colors border-2 border-gray-200 hover:border-[#3A7D44] bg-white"
                >
                  {submitting ? 'Saving...' : 'Skip for now →'}
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
