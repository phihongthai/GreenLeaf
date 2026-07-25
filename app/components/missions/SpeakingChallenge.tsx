'use client';

import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import Recorder from '@/components/Recorder';
import ScoreDisplay from '@/components/ScoreDisplay';
import { assessPronunciation, completeMission, type PronunciationResult, type MissionCompleteReward } from '@/lib/azure';
import { audioToWav } from '@/lib/audio';
import { playTTS } from '@/lib/tts';
import type { SpeakingChallengeContent } from '@/lib/types';

const PASS_THRESHOLD = 80;

export default function SpeakingChallenge({
  missionId,
  content,
  onComplete,
}: {
  missionId: string;
  content: SpeakingChallengeContent;
  onComplete: (reward: MissionCompleteReward) => void;
}) {
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);

  const passed = result ? result.overallScore >= PASS_THRESHOLD : false;

  const handlePlayTTS = async () => {
    setTtsError(null);
    try {
      await playTTS(content.script);
    } catch (err) {
      console.error(err);
      if (err instanceof DOMException && err.name === 'NotAllowedError') return;
      setTtsError('Không phát được âm mẫu — kiểm tra cấu hình Azure Speech (AZURE_SPEECH_KEY).');
    }
  };

  useEffect(() => {
    handlePlayTTS();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRecording = async (blob: Blob) => {
    setBusy(true);
    setResult(null);
    try {
      const wav = await audioToWav(blob);
      const res = await assessPronunciation(wav, content.script);
      setResult(res);
    } catch (err) {
      console.error(err);
      alert('Không thể chấm điểm. Thử lại nhé.');
    } finally {
      setBusy(false);
    }
  };

  const handleRetry = () => setResult(null);

  const handleFinish = async () => {
    if (!result || !passed) return;
    setSubmitting(true);
    try {
      const reward = await completeMission(missionId, result.overallScore);
      onComplete(reward);
    } catch (err) {
      console.error(err);
      alert('Không thể lưu kết quả. Thử lại nhé.');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-xs font-bold text-gray-400">Speaking Challenge</div>

      <div className="bg-white rounded-3xl shadow-sm p-8 space-y-4">
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
        {ttsError && <p className="text-xs text-red-500">{ttsError}</p>}
      </div>

      <Recorder onRecordingComplete={handleRecording} disabled={busy || submitting} />

      {busy && <p className="text-center text-sm text-gray-400">Đang chấm điểm...</p>}

      {result && (
        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
          <ScoreDisplay result={result} />
          <button
            onClick={passed ? handleFinish : handleRetry}
            disabled={submitting}
            className={`w-full font-bold py-3 rounded-xl text-white transition-colors ${
              passed ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {submitting ? 'Đang lưu...' : passed ? 'Well done! Hoàn thành Mission 3' : 'Try again — ghi âm lại'}
          </button>
        </div>
      )}
    </div>
  );
}
