async function playAzureTTS(text: string, rate: string): Promise<void> {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, rate }),
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
// khi Azure Speech chưa cấu hình xong hoặc tạm thời lỗi.
function speakWithBrowserTTS(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      reject(new Error('Trình duyệt không hỗ trợ đọc giọng nói (Web Speech API).'));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(new Error(`browser-tts:${e.error}`));
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}

export async function playTTS(text: string, rate = '-10%'): Promise<void> {
  try {
    await playAzureTTS(text, rate);
  } catch (err) {
    console.warn('Azure TTS không khả dụng, chuyển sang giọng đọc trình duyệt:', err);
    await speakWithBrowserTTS(text);
  }
}

// Autoplay bị trình duyệt chặn (chưa có tương tác người dùng) — không phải lỗi thật,
// nút "Nghe mẫu" vẫn bấm được bình thường sau đó.
export function isAutoplayBlocked(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'NotAllowedError') return true;
  if (err instanceof Error && err.message.includes('browser-tts:not-allowed')) return true;
  return false;
}
