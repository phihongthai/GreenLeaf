'use client';

import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import Recorder from '@/components/Recorder';
import ScoreDisplay from '@/components/ScoreDisplay';
import ErrorText from '@/components/ErrorText';
import { assessPronunciation, completeMission, type PronunciationResult, type MissionCompleteReward, type VerifiedAttempt } from '@/lib/azure';
import { audioToWav } from '@/lib/audio';
import { playTTS, stopTTS, isAutoplayBlocked } from '@/lib/tts';
import { speakPraise } from '@/lib/praise';
import { getWordEmoji } from '@/lib/wordEmoji';
import { logMissionAttempt } from '@/lib/missionAttempts';

import { getLessonTtsProfile } from '@/lib/ttsProfile';
import type { WordsExplorerContent } from '@/lib/types';

const PASS_THRESHOLD = 80;
const MAX_ATTEMPTS = 3;

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
  const ttsProfile = getLessonTtsProfile(gradeCode);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [verifiedAttempts, setVerifiedAttempts] = useState<VerifiedAttempt[]>([]);
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [assessError, setAssessError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [best, setBest] = useState<{ score: number; token: string } | null>(null);
  const [praisePhrase, setPraisePhrase] = useState<string | null>(null);

  const word = content.words[index];
  const passed = result ? result.overallScore >= PASS_THRESHOLD : false;
  const canSkip = !passed && attempts >= MAX_ATTEMPTS;

  useEffect(() => setImgError(false), [index]);

  const handlePlayTTS = async () => {
    setTtsError(null);
    try {
      await playTTS(word.word, ttsProfile.rate, ttsProfile.voice);
    } catch (err) {
      console.error(err);
      if (isAutoplayBlocked(err)) return;
      setTtsError(err instanceof Error ? err.message : 'Could not play the audio sample.');
    }
  };

  // Auto-play pronunciation sample when moving to a new word after a brief delay for screen transition.
  useEffect(() => {
    const timer = setTimeout(() => {
      handlePlayTTS();
    }, 350);
    return () => {
      clearTimeout(timer);
      stopTTS();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const handleRecording = async (blob: Blob) => {
    stopTTS();
    setBusy(true);
    setResult(null);
    setPraisePhrase(null);
    setAssessError(null);
    try {
      const wav = await audioToWav(blob);
      const res = await assessPronunciation(wav, word.word);
      setResult(res);
      setBest((prev) => (!prev || res.overallScore > prev.score ? { score: res.overallScore, token: res.token } : prev));
      logMissionAttempt(missionId, res.overallScore, word.word);
      if (res.overallScore >= PASS_THRESHOLD) {
        setPraisePhrase(speakPraise(gradeCode));
      } else {
        setAttempts((a) => a + 1);
      }
    } catch (err) {
      console.error(err);
      setAssessError('Could not score your recording. Please try again or skip.');
      setAttempts((a) => a + 1);
    } finally {
      setBusy(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setPraisePhrase(null);
  };

  const advanceOrComplete = async (score: number, token: string) => {
    const newAttempts = [...verifiedAttempts, { referenceText: word.word, score, token }];
    if (index < content.words.length - 1) {
      setVerifiedAttempts(newAttempts);
      setIndex(index + 1);
      setResult(null);
      setAssessError(null);
      setAttempts(0);
      setBest(null);
      return;
    }
    setSubmitting(true);
    setSaveError(null);
    try {
      const reward = await completeMission(missionId, newAttempts);
      onComplete(reward);
    } catch (err) {
      console.error(err);
      setSaveError('Could not save your result. Please try again.');
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!result || !passed) return;
    stopTTS();
    advanceOrComplete(result.overallScore, result.token);
  };

  const handleSkip = () => {
    stopTTS();
    playTTS('No worries, you can practice more later!', ttsProfile.rate, ttsProfile.voice).catch(() => {});
    advanceOrComplete(best?.score ?? 60, best?.token ?? 'skip_token');
  };

  return (
    <div className="space-y-3">
      {/* Topic & Step Progress Header */}
      <div className="flex items-center justify-between px-2">
        <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-xs border border-emerald-200/80">
          <span className="text-sm">📚</span>
          <span className="text-xs md:text-sm font-black text-emerald-900 uppercase tracking-wide">
            {content.topic}
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3.5 py-1.5 rounded-2xl shadow-sm text-xs md:text-sm font-black">
          <span>Card</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-lg">{index + 1} / {content.words.length}</span>
        </div>
      </div>

      {/* Main Flashcard — 3D Playful Game Card */}
      <div className="relative bg-gradient-to-b from-white via-white to-emerald-50/40 rounded-[28px] p-4 md:p-5 text-center space-y-3 border-4 border-white shadow-[0_16px_36px_rgba(46,74,52,0.12),0_4px_0_#A7F3D0] transition-all gl-pop-in">
        {/* Decorative corner sparkles */}
        <span className="absolute top-4 left-4 text-emerald-400 text-sm select-none pointer-events-none gl-sparkle">✨</span>
        <span className="absolute top-4 right-4 text-amber-400 text-sm select-none pointer-events-none gl-sparkle" style={{ animationDelay: '0.8s' }}>⭐</span>

        {/* Word Image / Illustration Showcase Frame */}
        <div className="relative w-24 h-24 md:w-28 md:h-28 mx-auto rounded-3xl bg-gradient-to-b from-emerald-100/70 via-teal-50 to-amber-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-inner shadow-emerald-900/10 group">
          {word.imageUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={word.imageUrl}
              alt={word.word}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-5xl md:text-6xl drop-shadow-md transition-transform group-hover:scale-110">
              {getWordEmoji(word.word)}
            </span>
          )}
        </div>

        {/* English Word & Meaning with punchy playful fonts */}
        <div className="space-y-1">
          <h2 className="gl-display text-3xl md:text-4xl font-black text-emerald-900 tracking-tight drop-shadow-xs">
            {word.word}
          </h2>
          {word.meaning && (
            <p className="text-base md:text-lg text-emerald-700/80 font-extrabold tracking-wide">
              {word.meaning}
            </p>
          )}
        </div>

        {/* Interactive Audio Listen Button */}
        <div className="pt-1">
          <button
            onClick={handlePlayTTS}
            type="button"
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 active:scale-95 text-white font-black text-sm md:text-base px-6 py-2.5 rounded-full shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Volume2 className="w-5 h-5 animate-pulse" />
            <span>Listen carefully</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">🔊</span>
          </button>
        </div>
        {ttsError && <ErrorText message={ttsError} />}
      </div>

      <Recorder onRecordingComplete={handleRecording} disabled={busy || submitting} />

      {busy && <p className="text-center text-base text-gray-500 font-bold">Scoring...</p>}
      {assessError && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center space-y-3">
          <ErrorText message={assessError} />
          <button
            onClick={handleSkip}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-emerald-800 bg-white border border-emerald-300 shadow-sm hover:bg-emerald-50 active:scale-95 transition-all"
          >
            Skip this word for now →
          </button>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-3xl shadow-sm p-4 space-y-3">
          <ScoreDisplay result={result} praisePhrase={praisePhrase} />
          {passed ? (
            <button
              onClick={handleNext}
              disabled={submitting}
              className="w-full font-extrabold py-3.5 rounded-2xl text-white text-lg transition-colors shadow-md bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? 'Saving...' : index < content.words.length - 1 ? 'Well done! Next word →' : 'Well done! Part 1 complete 🎉'}
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
