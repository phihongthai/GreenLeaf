// Ported from pronunciation-app/lib/audio.ts — converts recording to WAV PCM 16kHz mono for Azure Speech.

export async function audioToWav(
  audioBlob: Blob,
  targetSampleRate: number = 16000
): Promise<ArrayBuffer> {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioContext = new AudioContext({ sampleRate: targetSampleRate });
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  if (audioBuffer.sampleRate !== targetSampleRate) {
    return resampleAudio(audioBuffer, targetSampleRate);
  }

  return bufferToWav(audioBuffer);
}

async function resampleAudio(audioBuffer: AudioBuffer, newSampleRate: number): Promise<ArrayBuffer> {
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    Math.ceil(audioBuffer.duration * newSampleRate),
    newSampleRate
  );

  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start();

  const renderedBuffer = await offlineContext.startRendering();
  return bufferToWav(renderedBuffer);
}

function bufferToWav(audioBuffer: AudioBuffer): ArrayBuffer {
  const length = audioBuffer.length * audioBuffer.numberOfChannels * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);
  const channels = [];
  let offset = 0;
  let pos = 0;

  const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
  const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt "
  setUint32(16);
  setUint16(1);
  setUint16(audioBuffer.numberOfChannels);
  setUint32(audioBuffer.sampleRate);
  setUint32(audioBuffer.sampleRate * 2 * audioBuffer.numberOfChannels);
  setUint16(audioBuffer.numberOfChannels * 2);
  setUint16(16);

  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return arrayBuffer;
}
