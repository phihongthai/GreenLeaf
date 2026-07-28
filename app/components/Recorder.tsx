'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ErrorText from '@/components/ErrorText';

interface RecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
}

type RecordingState = 'idle' | 'recording' | 'stopped';

const MAX_DURATION_SECONDS = 20;

export default function Recorder({ onRecordingComplete, disabled = false }: RecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [autoStopped, setAutoStopped] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopRecording = useCallback((auto = false) => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setState('stopped');
    setVolume(0);
    setAutoStopped(auto);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      setAudioUrl(null);
      setDuration(0);
      setMicError(null);
      setAutoStopped(false);

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const trackVolume = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setVolume(Math.min(100, avg * 2));
        animFrameRef.current = requestAnimationFrame(trackVolume);
      };
      trackVolume();

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(blob);
      };

      recorder.start();
      setState('recording');

      let secs = 0;
      timerRef.current = setInterval(() => {
        secs++;
        setDuration(secs);
        if (secs >= MAX_DURATION_SECONDS) stopRecording(true);
      }, 1000);
    } catch {
      setMicError('Không thể truy cập microphone. Kiểm tra quyền truy cập của trình duyệt.');
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="space-y-3">
      {state === 'recording' && (
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-base text-red-500 font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            REC {duration}s / {MAX_DURATION_SECONDS}s
          </span>
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-400 to-rose-500 transition-all duration-75 rounded-full"
              style={{ width: `${volume}%` }}
            />
          </div>
        </div>
      )}

      {/* Nút mic tròn to (78px) đặt giữa — dễ bấm với ngón tay trẻ nhỏ hơn nút
          chữ nhật full-width, và là điểm nhấn duy nhất của màn hình luyện nói. */}
      <div className="flex flex-col items-center gap-2 py-1">
        {state !== 'recording' ? (
          <button
            onClick={startRecording}
            disabled={disabled}
            aria-label={state === 'stopped' ? 'Ghi âm lại' : 'Bấm để ghi âm'}
            className="grid h-[78px] w-[78px] place-items-center rounded-full bg-gradient-to-br from-[#4F9E58] to-[#2E4A34] text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          >
            <svg className="h-9 w-9" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => stopRecording()}
            aria-label={`Dừng ghi âm, đã ghi ${duration} giây`}
            className="relative grid h-[78px] w-[78px] place-items-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            <span aria-hidden className="absolute inset-0 rounded-full bg-red-400 gl-pulse-ring" />
            <svg className="relative h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        )}
        <span className="text-base font-extrabold text-gl-green">
          {state === 'recording' ? `Dừng (${duration}s)` : state === 'stopped' ? 'Ghi âm lại' : 'Bấm để ghi âm'}
        </span>
      </div>

      {micError && <ErrorText message={micError} />}
      {autoStopped && <ErrorText tone="warning" message={`Đã tự động dừng ghi âm sau ${MAX_DURATION_SECONDS} giây.`} />}

      {audioUrl && (
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <p className="text-sm text-gray-500 mb-2 font-bold">Nghe lại bản ghi âm:</p>
          <audio controls src={audioUrl} className="w-full h-9" />
        </div>
      )}
    </div>
  );
}
