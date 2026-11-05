'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ErrorText from '@/components/ErrorText';

interface RecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
}

type RecordingState = 'idle' | 'recording' | 'stopped';

const MAX_DURATION_SECONDS = 60;

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
  const audioContextRef = useRef<AudioContext | null>(null);
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
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
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
      audioContextRef.current = audioContext;
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
      setMicError('Could not access the microphone. Please check your browser permissions.');
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-2">
      {state === 'recording' && (
        <div className="flex flex-col items-center gap-2 bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-md border-2 border-rose-200 gl-pop-in">
          <div className="flex items-center justify-between w-full px-2 text-sm">
            <span className="flex items-center gap-2 text-rose-600 font-black">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span>RECORDING</span>
            </span>
            <span className="font-extrabold text-gray-500 font-mono text-sm">
              {duration}s / {MAX_DURATION_SECONDS}s
            </span>
          </div>
          {/* Animated sound wave bars */}
          <div className="w-full h-4 bg-rose-50 rounded-full overflow-hidden p-0.5 border border-rose-100 flex items-center">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-red-500 transition-all duration-75 rounded-full shadow-sm"
              style={{ width: `${Math.max(8, volume)}%` }}
            />
          </div>
        </div>
      )}

      {/* Prominent, 3D Game-style Microphone Button */}
      <div className="flex flex-col items-center justify-center gap-1.5 py-1">
        {state !== 'recording' ? (
          <button
            onClick={startRecording}
            disabled={disabled}
            aria-label={state === 'stopped' ? 'Record again' : 'Tap to record'}
            className="group relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-b from-[#56b963] via-[#3a7d44] to-[#25542d] text-white shadow-[0_10px_25px_rgba(58,125,68,0.4),0_4px_0_#1c3f22] active:translate-y-1.5 active:shadow-[0_4px_12px_rgba(58,125,68,0.3),0_1px_0_#1c3f22] transition-all hover:scale-105 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {/* Outer soft pulsing glow */}
            <span className="absolute -inset-2 rounded-full bg-emerald-400/25 animate-pulse -z-10 group-hover:bg-emerald-400/40 transition-colors" />
            
            {/* Top highlight shine */}
            <span className="absolute top-2 w-12 h-4 rounded-full bg-white/30 blur-[1px] pointer-events-none" />

            <div className="flex flex-col items-center justify-center">
              <svg className="w-7 h-7 md:w-8 md:h-8 drop-shadow-md transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
              </svg>
            </div>
          </button>
        ) : (
          <button
            onClick={() => stopRecording()}
            aria-label={`Stop recording, ${duration} seconds recorded`}
            className="group relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-b from-rose-400 via-red-500 to-red-700 text-white shadow-[0_10px_25px_rgba(239,68,68,0.5),0_4px_0_#991b1b] active:translate-y-1.5 active:shadow-[0_4px_12px_rgba(239,68,68,0.4),0_1px_0_#991b1b] transition-all hover:scale-105 cursor-pointer"
          >
            {/* Multiple pulsing rings when recording */}
            <span className="absolute -inset-3 rounded-full bg-rose-400/35 animate-ping -z-10" />
            <span className="absolute -inset-1 rounded-full bg-red-400/30 animate-pulse -z-10" />
            
            {/* Top highlight shine */}
            <span className="absolute top-2 w-12 h-4 rounded-full bg-white/35 blur-[1px] pointer-events-none" />

            <svg className="w-9 h-9 md:w-11 md:h-11 drop-shadow-md animate-pulse" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <rect x="6" y="6" width="12" height="12" rx="3" />
            </svg>
          </button>
        )}

        <div className="text-center">
          <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm md:text-base font-black shadow-sm transition-all ${
            state === 'recording'
              ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
              : state === 'stopped'
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-white/95 text-emerald-800 border-2 border-emerald-300'
          }`}>
            <span>{state === 'recording' ? '⏹️' : '🎙️'}</span>
            <span>
              {state === 'recording' ? `Tap to Stop (${duration}s)` : state === 'stopped' ? 'Re-record 🔄' : 'Tap to Record!'}
            </span>
          </span>
        </div>
      </div>

      {micError && <ErrorText message={micError} />}
      {autoStopped && <ErrorText tone="warning" message={`Recording auto-stopped after ${MAX_DURATION_SECONDS} seconds.`} />}

      {audioUrl && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border-2 border-emerald-100 shadow-sm space-y-2">
          <p className="text-xs text-emerald-800 font-extrabold flex items-center gap-1.5">
            <span>🎧</span> Listen to your voice:
          </p>
          <audio controls src={audioUrl} className="w-full h-9 rounded-lg" />
        </div>
      )}
    </div>
  );
}
