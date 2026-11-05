'use client';

import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import Recorder from '@/components/Recorder';
import ScoreDisplay from '@/components/ScoreDisplay';
import ErrorText from '@/components/ErrorText';
import { assessPronunciation, completeMission, type PronunciationResult, type MissionCompleteReward } from '@/lib/azure';
import { audioToWav } from '@/lib/audio';
import { playTTS, stopTTS, isAutoplayBlocked } from '@/lib/tts';
import { speakPraise } from '@/lib/praise';
import { logMissionAttempt } from '@/lib/missionAttempts';

import { getLessonTtsProfile } from '@/lib/ttsProfile';
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
  const ttsProfile = getLessonTtsProfile(gradeCode);
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
    const timer = setTimeout(() => {
      handlePlayTTS();
    }, 350);
    return () => {
      clearTimeout(timer);
      stopTTS();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRecording = async (blob: Blob) => {
    stopTTS();
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
    stopTTS();
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
    stopTTS();
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
    <div className="space-y-3">
      {/* Topic & Step Progress Header */}
      <div className="flex items-center justify-between px-2">
        <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-xs border border-amber-200/80">
          <span className="text-sm">🎤</span>
          <span className="text-xs md:text-sm font-black text-amber-900 uppercase tracking-wide">
            Speaking Challenge
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3.5 py-1.5 rounded-2xl shadow-sm text-xs md:text-sm font-black">
          <span>Final Part</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-lg">🌟 3 / 3</span>
        </div>
      </div>

      {/* Main Speaking Challenge Card */}
      <div className="relative bg-gradient-to-b from-white via-white to-amber-50/40 rounded-[28px] p-4 md:p-5 text-center space-y-3 border-4 border-white shadow-[0_16px_36px_rgba(217,119,6,0.12),0_4px_0_#FDE68A] transition-all gl-pop-in">
        <span className="absolute top-4 left-4 text-amber-400 text-sm select-none pointer-events-none gl-sparkle">⭐</span>
        <span className="absolute top-4 right-4 text-orange-400 text-sm select-none pointer-events-none gl-sparkle" style={{ animationDelay: '0.7s' }}>✨</span>

        <div className="relative w-24 h-24 md:w-28 md:h-28 mx-auto rounded-3xl bg-gradient-to-b from-amber-100/70 via-orange-50 to-amber-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-inner shadow-amber-900/10 text-5xl group">
          {content.imageUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.imageUrl}
              alt={content.imageDescription || 'Speaking Challenge'}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="drop-shadow-md transition-transform group-hover:scale-110">
              {getSentenceEmoji(content.script, topic)}
            </span>
          )}
        </div>

        {content.prompt && (
          <p className="text-sm md:text-base font-black text-amber-900 bg-amber-100/70 rounded-2xl px-4 py-2 border border-amber-200">
            {content.prompt}
          </p>
        )}

        <div className="space-y-1 text-left bg-gradient-to-br from-amber-50/60 to-orange-50/40 rounded-2xl p-3 border border-amber-100">
          {content.script.split(/(?<=[\.\!\?])\s+/).filter(Boolean).map((line, i) => (
            <p key={i} className={`text-sm md:text-base font-black text-amber-950 leading-snug flex items-start gap-2.5 ${i % 2 === 1 ? 'pl-4 md:pl-6' : ''}`}>
              <span className="text-amber-500 font-bold text-sm mt-0.5 shrink-0" aria-hidden>{i % 2 === 0 ? '🌟' : '✨'}</span>
              <span>{line}</span>
            </p>
          ))}
        </div>

        <div className="pt-1">
          <button
            onClick={handlePlayTTS}
            type="button"
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-black text-sm md:text-base px-6 py-2.5 rounded-full shadow-md shadow-orange-500/30 transition-all cursor-pointer"
          >
            <Volume2 className="w-5 h-5 animate-pulse" />
            <span>Listen full passage</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">🎧</span>
          </button>
        </div>
        {ttsError && <ErrorText message={ttsError} />}
      </div>

      <Recorder onRecordingComplete={handleRecording} disabled={busy || submitting} />

      {busy && <p className="text-center text-base text-gray-500 font-bold">Scoring...</p>}
      {assessError && <ErrorText message={assessError} />}

      {result && (
        <div className="bg-white rounded-3xl shadow-sm p-4 space-y-3">
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
