'use client';

import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import Recorder from '@/components/Recorder';
import ScoreDisplay from '@/components/ScoreDisplay';
import ErrorText from '@/components/ErrorText';
import { assessPronunciation, completeMission, type PronunciationResult, type MissionCompleteReward, type VerifiedAttempt } from '@/lib/azure';
import { audioToWav } from '@/lib/audio';
import { playTTS, isAutoplayBlocked } from '@/lib/tts';
import { speakPraise } from '@/lib/praise';
import { getWordEmoji } from '@/lib/wordEmoji';
import { logMissionAttempt } from '@/lib/missionAttempts';

import { getTtsProfile } from '@/lib/ttsProfile';
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
  const ttsProfile = getTtsProfile(gradeCode);
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

  // Auto-play pronunciation sample when moving to a new word. If browser blocks autoplay, the "Listen" button still works.
  useEffect(() => {
    handlePlayTTS();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const handleRecording = async (blob: Blob) => {
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
    advanceOrComplete(result.overallScore, result.token);
  };

  const handleSkip = () => {
    if (!best) return;
    playTTS('No worries, you can practice more later!', ttsProfile.rate, ttsProfile.voice).catch(() => {});
    advanceOrComplete(best.score, best.token);
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
