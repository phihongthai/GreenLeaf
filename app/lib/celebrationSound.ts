let ctx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!ctx || ctx.state === 'closed') {
    ctx = new AudioContext();
  }
  return ctx;
}

export function playCelebration(): void {
  try {
    const ac = getContext();
    if (ac.state === 'suspended') ac.resume();

    const now = ac.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const master = ac.createGain();
    master.connect(ac.destination);
    master.gain.setValueAtTime(0.18, now);
    master.gain.linearRampToValueAtTime(0, now + 1.4);

    notes.forEach((freq, i) => {
      const start = now + i * 0.12;

      const osc = ac.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const env = ac.createGain();
      env.gain.setValueAtTime(0, start);
      env.gain.linearRampToValueAtTime(0.18, start + 0.04);
      env.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

      osc.connect(env);
      env.connect(master);
      osc.start(start);
      osc.stop(start + 0.65);

      const shimmer = ac.createOscillator();
      shimmer.type = 'triangle';
      shimmer.frequency.value = freq * 2;
      const sEnv = ac.createGain();
      sEnv.gain.setValueAtTime(0, start);
      sEnv.gain.linearRampToValueAtTime(0.06, start + 0.04);
      sEnv.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      shimmer.connect(sEnv);
      sEnv.connect(master);
      shimmer.start(start);
      shimmer.stop(start + 0.4);
    });
  } catch {
    // Audio not available
  }
}
