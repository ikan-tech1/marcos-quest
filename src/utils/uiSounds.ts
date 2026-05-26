type ToneDef = { freq: number; duration: number; type?: OscillatorType; volume?: number };

let ctx: AudioContext | null = null;
let enabled = true;

function getContext(): AudioContext | null {
  if (!enabled) return null;
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function playTone({ freq, duration, type = 'square', volume = 0.08 }: ToneDef): void {
  const audio = getContext();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(audio.destination);
  const now = audio.currentTime;
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.start(now);
  osc.stop(now + duration);
}

export const UISounds = {
  setEnabled(value: boolean): void {
    enabled = value;
  },
  click(): void {
    playTone({ freq: 520, duration: 0.04, volume: 0.06 });
  },
  confirm(): void {
    playTone({ freq: 659, duration: 0.06, volume: 0.08 });
    setTimeout(() => playTone({ freq: 784, duration: 0.08, volume: 0.08 }), 60);
  },
  cancel(): void {
    playTone({ freq: 330, duration: 0.08, volume: 0.06 });
  },
  pause(): void {
    playTone({ freq: 440, duration: 0.05, volume: 0.07 });
    setTimeout(() => playTone({ freq: 330, duration: 0.07, volume: 0.06 }), 50);
  },
  jump(): void {
    playTone({ freq: 440, duration: 0.06, volume: 0.08 });
    setTimeout(() => playTone({ freq: 660, duration: 0.08, volume: 0.07 }), 45);
  },
  dash(): void {
    playTone({ freq: 280, duration: 0.05, type: 'triangle', volume: 0.09 });
    setTimeout(() => playTone({ freq: 520, duration: 0.06, volume: 0.07 }), 40);
  },
  fire(): void {
    playTone({ freq: 880, duration: 0.04, volume: 0.08 });
    setTimeout(() => playTone({ freq: 660, duration: 0.05, volume: 0.06 }), 35);
  },
  noFire(): void {
    playTone({ freq: 180, duration: 0.1, type: 'sawtooth', volume: 0.06 });
  },
  coin(): void {
    playTone({ freq: 988, duration: 0.05, volume: 0.1 });
    setTimeout(() => playTone({ freq: 1319, duration: 0.1, volume: 0.09 }), 55);
  },
  start(): void {
    playTone({ freq: 523, duration: 0.06, volume: 0.08 });
    setTimeout(() => playTone({ freq: 784, duration: 0.1, volume: 0.09 }), 70);
  },
  secretJingle(): void {
    [523, 659, 784, 1047, 784, 1047].forEach((freq, i) => {
      setTimeout(() => playTone({ freq, duration: 0.1, volume: 0.09 }), i * 90);
    });
  },
};
