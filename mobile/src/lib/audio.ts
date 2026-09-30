import { Audio } from 'expo-av';

let currentSound: Audio.Sound | null = null;
let currentPlayId = 0;

export async function stopAudio() {
  currentPlayId++;
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch {
      // ignore
    }
    currentSound = null;
  }
}

export async function playTtsAudio(text: string, gradeCode = 'kids1', missionType = 'words_explorer') {
  await stopAudio();
  const playId = ++currentPlayId;

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://green-leaf-snowy.vercel.app';
    const res = await fetch(`${apiUrl}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, gradeCode, missionType }),
    });

    if (!res.ok) {
      console.warn('TTS request failed:', res.status);
      return;
    }

    const blob = await res.blob();
    // Convert blob to base64 data URI
    const reader = new FileReader();
    reader.onload = async () => {
      if (playId !== currentPlayId) return;
      const base64data = reader.result as string;
      const { sound } = await Audio.Sound.createAsync(
        { uri: base64data },
        { shouldPlay: true }
      );
      if (playId !== currentPlayId) {
        sound.unloadAsync();
        return;
      }
      currentSound = sound;
    };
    reader.readAsDataURL(blob);
  } catch (err) {
    console.warn('playTtsAudio error:', err);
  }
}
