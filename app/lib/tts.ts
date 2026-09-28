let activeAudio: HTMLAudioElement | null = null;
let activeAbortController: AbortController | null = null;
let currentPlayToken = 0;

/**
 * Stop any ongoing TTS playback immediately (both HTML5 Audio and Web Speech API).
 * Also aborts any in-flight Azure TTS fetch requests to prevent sound overlap.
 */
export function stopTTS(): void {
  currentPlayToken++;

  if (activeAbortController) {
    try {
      activeAbortController.abort();
    } catch {
      // ignore
    }
    activeAbortController = null;
  }

  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {
      // ignore
    }
    activeAudio = null;
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

async function playAzureTTS(
  text: string,
  rate: string,
  voice: string,
  signal: AbortSignal,
  token: number
): Promise<void> {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, rate, voice }),
    signal,
  });

  if (token !== currentPlayToken) return;

  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.url) {
    throw new Error(body?.error ? `TTS failed: ${body.error}` : `TTS failed (${res.status})`);
  }

  if (token !== currentPlayToken) return;

  const audio = new Audio(body.url);
  activeAudio = audio;
  audio.onended = () => {
    if (activeAudio === audio) activeAudio = null;
  };
  audio.onerror = () => {
    if (activeAudio === audio) activeAudio = null;
  };
  await audio.play();
}

// Fallback using browser's built-in speech synthesis — no key needed, works immediately
// when Azure Speech is not configured or temporarily down.
function speakWithBrowserTTS(text: string, rate: string, token: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      reject(new Error('Browser does not support speech synthesis (Web Speech API).'));
      return;
    }

    if (token !== currentPlayToken) {
      resolve();
      return;
    }

    const percent = parseInt(rate, 10);
    const webRate = Number.isFinite(percent) ? Math.min(1.2, Math.max(0.5, 1 + percent / 100)) : 0.85;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = webRate;

    try {
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Samantha') ||
            v.name.includes('Google') ||
            v.name.includes('US'))
      );
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    } catch {
      // Ignore voice selection errors
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') {
        resolve();
      } else {
        reject(new Error(`browser-tts:${e.error}`));
      }
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}

export async function playTTS(text: string, rate = '-10%', voice = 'en-US-JennyNeural'): Promise<void> {
  // Always stop any previously playing speech before starting new speech
  stopTTS();
  const token = ++currentPlayToken;

  const controller = new AbortController();
  activeAbortController = controller;

  try {
    await playAzureTTS(text, rate, voice, controller.signal, token);
  } catch {
    if (token !== currentPlayToken || controller.signal.aborted) {
      return;
    }
    await speakWithBrowserTTS(text, rate, token);
  } finally {
    if (activeAbortController === controller) {
      activeAbortController = null;
    }
  }
}

export function speakVi(text: string): void {
  stopTTS();
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'vi-VN';
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function isAutoplayBlocked(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'NotAllowedError') return true;
  if (err instanceof Error && err.message.includes('browser-tts:not-allowed')) return true;
  return false;
}
