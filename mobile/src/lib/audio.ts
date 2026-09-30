import * as Speech from 'expo-speech';

export async function stopAudio() {
  try {
    Speech.stop();
  } catch {
    // ignore
  }
}

export async function playTtsAudio(text: string, gradeCode = 'kids1', _missionType = 'words_explorer') {
  try {
    await stopAudio();

    // Use iOS Native Text-to-Speech (0ms latency, runs offline on iPhone)
    const rate = gradeCode === 'kindergarten' ? 0.75 : gradeCode === 'kids1' ? 0.82 : 0.9;
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.05,
      rate,
    });
  } catch (err) {
    console.warn('Speech.speak error:', err);
  }
}
