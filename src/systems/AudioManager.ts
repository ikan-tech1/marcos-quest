import Phaser from 'phaser';

type ToneDef = { freq: number; duration: number; type?: OscillatorType; volume?: number };

export class AudioManager {
  private scene: Phaser.Scene;
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private musicOscillators: OscillatorNode[] = [];
  private musicInterval: number | null = null;
  private musicStep = 0;
  private enabled = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.stopMusic());
  }

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.08;
      this.musicGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private playTone({ freq, duration, type = 'square', volume = 0.15 }: ToneDef): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  }

  playJump(): void {
    this.playTone({ freq: 440, duration: 0.08, volume: 0.1 });
    this.scene.time.delayedCall(50, () => this.playTone({ freq: 660, duration: 0.1, volume: 0.1 }));
  }

  playCoin(): void {
    this.playTone({ freq: 988, duration: 0.06, volume: 0.12 });
    this.scene.time.delayedCall(60, () => this.playTone({ freq: 1319, duration: 0.12, volume: 0.12 }));
  }

  playStomp(): void {
    this.playTone({ freq: 180, duration: 0.1, type: 'triangle', volume: 0.2 });
  }

  playPowerUp(): void {
    [523, 659, 784, 1047].forEach((freq, i) => {
      this.scene.time.delayedCall(i * 80, () => this.playTone({ freq, duration: 0.12, volume: 0.12 }));
    });
  }

  playBreak(): void {
    this.playTone({ freq: 120, duration: 0.15, type: 'sawtooth', volume: 0.12 });
  }

  playHurt(): void {
    this.playTone({ freq: 200, duration: 0.2, type: 'sawtooth', volume: 0.15 });
    this.scene.time.delayedCall(100, () => this.playTone({ freq: 150, duration: 0.25, type: 'sawtooth', volume: 0.15 }));
  }

  playDeath(): void {
    [400, 350, 300, 250, 200].forEach((freq, i) => {
      this.scene.time.delayedCall(i * 120, () => this.playTone({ freq, duration: 0.15, volume: 0.12 }));
    });
  }

  playFire(): void {
    this.playTone({ freq: 880, duration: 0.05, volume: 0.08 });
  }

  playWin(): void {
    [523, 659, 784, 1047, 784, 1047].forEach((freq, i) => {
      this.scene.time.delayedCall(i * 100, () => this.playTone({ freq, duration: 0.15, volume: 0.12 }));
    });
  }

  playOneUp(): void {
    [660, 880, 1100, 1320].forEach((freq, i) => {
      this.scene.time.delayedCall(i * 90, () => this.playTone({ freq, duration: 0.1, volume: 0.14 }));
    });
  }

  playPipe(): void {
    this.playTone({ freq: 220, duration: 0.2, type: 'triangle', volume: 0.15 });
    this.scene.time.delayedCall(120, () => this.playTone({ freq: 330, duration: 0.25, type: 'triangle', volume: 0.12 }));
  }

  playFlag(): void {
    [784, 988, 1175, 988, 784].forEach((freq, i) => {
      this.scene.time.delayedCall(i * 70, () => this.playTone({ freq, duration: 0.1, volume: 0.1 }));
    });
  }

  playSecret(): void {
    [440, 554, 659, 880, 659, 880, 1047].forEach((freq, i) => {
      this.scene.time.delayedCall(i * 80, () => this.playTone({ freq, duration: 0.12, volume: 0.12 }));
    });
  }

  private readonly titleMelody = [262, 330, 392, 523, 392, 330, 262, 330, 392, 523, 659, 523];
  private readonly gameMelody = [392, 440, 494, 440, 392, 349, 392, 440, 494, 587, 494, 440];
  private readonly undergroundMelody = [220, 247, 262, 247, 220, 196, 220, 247, 262, 294, 262, 247];
  private readonly skyMelody = [523, 587, 659, 698, 659, 587, 523, 587, 659, 784, 659, 587];
  private readonly castleMelody = [196, 220, 233, 220, 196, 175, 196, 220, 233, 262, 233, 220];

  startTitleMusic(): void {
    this.startMusicLoop(this.titleMelody, 220);
  }

  startGameMusic(theme: 'overworld' | 'underground' | 'sky' | 'castle' = 'overworld'): void {
    const melody =
      theme === 'underground'
        ? this.undergroundMelody
        : theme === 'sky'
          ? this.skyMelody
          : theme === 'castle'
            ? this.castleMelody
            : this.gameMelody;
    const bpm = theme === 'castle' ? 160 : theme === 'sky' ? 200 : 180;
    this.startMusicLoop(melody, bpm);
  }

  private startMusicLoop(notes: number[], bpm: number): void {
    this.stopMusic();
    if (!this.enabled) return;
    this.getContext();
    const beatMs = (60 / bpm) * 1000 * 2;
    this.musicStep = 0;

    const playStep = () => {
      if (!this.musicGain || !this.ctx) return;
      const freq = notes[this.musicStep % notes.length];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.value = 0.06;
      osc.connect(gain);
      gain.connect(this.musicGain);
      const now = this.ctx.currentTime;
      gain.gain.exponentialRampToValueAtTime(0.001, now + beatMs / 1000 * 0.8);
      osc.start(now);
      osc.stop(now + beatMs / 1000);
      this.musicOscillators.push(osc);
      this.musicStep += 1;
    };

    playStep();
    this.musicInterval = window.setInterval(playStep, beatMs);
  }

  stopMusic(): void {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.musicOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        /* already stopped */
      }
    });
    this.musicOscillators = [];
  }

  setEnabled(value: boolean): void {
    this.enabled = value;
    if (!value) this.stopMusic();
  }
}
