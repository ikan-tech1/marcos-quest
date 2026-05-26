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
};
