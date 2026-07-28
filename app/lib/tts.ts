async function playAzureTTS(text: string, rate: string, voice: string): Promise<void> {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, rate, voice }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.url) {
    throw new Error(body?.error ? `TTS failed: ${body.error}` : `TTS failed (${res.status})`);
  }

  // URL trỏ tới file cache công khai trên Supabase Storage (hoặc mới sinh và đã cache) —
  // phát trực tiếp, không cần blob tạm.
  const audio = new Audio(body.url);
  await audio.play();
}

// Fallback dùng giọng đọc có sẵn của trình duyệt — không cần key, chạy được ngay
// khi Azure Speech chưa cấu hình xong hoặc tạm thời lỗi. Không chọn được giọng trẻ em qua
// Web Speech API (phụ thuộc giọng cài sẵn của từng máy), nhưng vẫn đọc chậm theo cùng `rate`.
function speakWithBrowserTTS(text: string, rate: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      reject(new Error('Trình duyệt không hỗ trợ đọc giọng nói (Web Speech API).'));
      return;
    }
    const percent = parseInt(rate, 10);
    const webRate = Number.isFinite(percent) ? Math.min(1.2, Math.max(0.5, 1 + percent / 100)) : 0.85;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = webRate;
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(new Error(`browser-tts:${e.error}`));
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}

export async function playTTS(text: string, rate = '-10%', voice = 'en-US-JennyNeural'): Promise<void> {
  try {
    await playAzureTTS(text, rate, voice);
  } catch (err) {
    console.warn('Azure TTS không khả dụng, chuyển sang giọng đọc trình duyệt:', err);
    await speakWithBrowserTTS(text, rate);
  }
}

export function speakVi(text: string): void {
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
