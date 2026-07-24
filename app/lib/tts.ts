export async function playTTS(text: string, rate = '-10%'): Promise<void> {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, rate }),
  });
  if (!res.ok) throw new Error('TTS failed');

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  await audio.play();
  audio.onended = () => URL.revokeObjectURL(url);
}
