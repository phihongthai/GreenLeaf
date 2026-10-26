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
import { logMissionAttempt } from '@/lib/missionAttempts';

import { getLessonTtsProfile } from '@/lib/ttsProfile';
import { getSentenceEmoji } from '@/lib/sentenceEmoji';
import type { PhonicsContent } from '@/lib/types';

const PASS_THRESHOLD = 80;
const MAX_ATTEMPTS = 3;

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
  gradeCode,
  topic,
  onComplete,
}: {
  missionId: string;
  content: PhonicsContent;
  title: string;
  gradeCode?: string;
  topic?: string;
  onComplete: (reward: MissionCompleteReward) => void;
}) {
  const ttsProfile = getLessonTtsProfile(gradeCode);
  const [index, setIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [verifiedAttempts, setVerifiedAttempts] = useState<VerifiedAttempt[]>([]);
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [assessError, setAssessError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [best, setBest] = useState<{ score: number; token: string } | null>(null);
  const [praisePhrase, setPraisePhrase] = useState<string | null>(null);

  const line = content.lines[index];
  const passed = result ? result.overallScore >= PASS_THRESHOLD : false;
  const canSkip = !passed && attempts >= MAX_ATTEMPTS;

  const handlePlayTTS = async () => {
    setTtsError(null);
    try {
      await playTTS(line.text, ttsProfile.rate, ttsProfile.voice);
    } catch (err) {
      console.error(err);
      if (isAutoplayBlocked(err)) return;
      setTtsError(err instanceof Error ? err.message : 'Could not play the audio sample.');
    }
  };

  useEffect(() => {
    setImgError(false);
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
      const res = await assessPronunciation(wav, line.text);
      setResult(res);
      setBest((prev) => (!prev || res.overallScore > prev.score ? { score: res.overallScore, token: res.token } : prev));
      logMissionAttempt(missionId, res.overallScore, line.text);
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

  const advanceOrComplete = async (score: number, token: string) => {
    const newAttempts = [...verifiedAttempts, { referenceText: line.text, score, token }];
    if (index < content.lines.length - 1) {
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
    if (!best) return;
    stopTTS();
    playTTS('No worries, you can practice more later!', ttsProfile.rate, ttsProfile.voice).catch(() => {});
    advanceOrComplete(best.score, best.token);
  };

  return (
    <div className="space-y-6">
      {/* Topic & Step Progress Header */}
      <div className="flex items-center justify-between px-2">
        <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-xs border border-violet-200/80">
          <span className="text-sm">🎵</span>
          <span className="text-xs md:text-sm font-black text-violet-900 uppercase tracking-wide">
            {title}
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-3.5 py-1.5 rounded-2xl shadow-sm text-xs md:text-sm font-black">
          <span>Line</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-lg">{index + 1} / {content.lines.length}</span>
        </div>
      </div>

      {/* Main Phonics Sentence Card */}
      <div className="relative bg-gradient-to-b from-white via-white to-violet-50/40 rounded-[32px] p-6 md:p-8 text-center space-y-5 border-4 border-white shadow-[0_16px_36px_rgba(109,40,217,0.12),0_4px_0_#DDD6FE] transition-all gl-pop-in">
        {/* Corner playful notes */}
        <span className="absolute top-4 left-4 text-violet-400 text-sm select-none pointer-events-none gl-sparkle">🎶</span>
        <span className="absolute top-4 right-4 text-pink-400 text-sm select-none pointer-events-none gl-sparkle" style={{ animationDelay: '0.6s' }}>✨</span>

        <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto rounded-3xl bg-gradient-to-b from-violet-100/70 via-purple-50 to-pink-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-inner shadow-purple-900/10 text-6xl group">
          {line.imageUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={line.imageUrl}
              alt={line.imageDescription || line.text}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="drop-shadow-md transition-transform group-hover:scale-110">
              {getSentenceEmoji(line.text, topic)}
            </span>
          )}
        </div>

        {/* Phonics Target Highlight Banner if present */}
        {content.highlight && (
          <div className="inline-flex items-center gap-2 bg-violet-100/90 text-violet-800 text-xs md:text-sm font-black px-4 py-1.5 rounded-full border border-violet-200">
            <span>🎯 Sound focus:</span>
            <span className="underline decoration-2 decoration-violet-500 font-mono tracking-wider">/{content.highlight}/</span>
          </div>
        )}

        <div className="px-2">
          <p className="gl-display text-2xl md:text-3xl font-black text-violet-950 leading-relaxed tracking-tight">
            {highlightLine(line.text, content.highlight)}
          </p>
        </div>

        <div className="pt-1">
          <button
            onClick={handlePlayTTS}
            type="button"
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 active:scale-95 text-white font-black text-sm md:text-base px-6 py-2.5 rounded-full shadow-md shadow-violet-600/30 transition-all cursor-pointer"
          >
            <Volume2 className="w-5 h-5 animate-pulse" />
            <span>Listen carefully</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">🎧</span>
          </button>
        </div>
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
              onClick={handleNext}
              disabled={submitting}
              className="w-full font-extrabold py-3.5 rounded-2xl text-white text-lg transition-colors shadow-md bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? 'Saving...' : index < content.lines.length - 1 ? 'Well done! Next sentence →' : 'Well done! Part 2 complete 🎉'}
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
