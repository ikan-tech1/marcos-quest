import { GameState } from './GameState';
import { Storage } from './Storage';

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];

export class EasterEggTracker {
  private konamiIndex = 0;
  private secretsFound = new Set<string>();

  constructor() {
    try {
      const stored = localStorage.getItem('eashans-quest-secrets');
      if (stored) {
        JSON.parse(stored).forEach((s: string) => this.secretsFound.add(s));
      }
    } catch {
      /* ignore */
    }
  }

  handleKey(code: string): boolean {
    if (code === KONAMI[this.konamiIndex]) {
      this.konamiIndex += 1;
      if (this.konamiIndex >= KONAMI.length) {
        this.konamiIndex = 0;
        this.unlock('konami');
        GameState.lives += 3;
        return true;
      }
    } else {
      this.konamiIndex = code === KONAMI[0] ? 1 : 0;
    }
    return false;
  }

  unlock(id: string): boolean {
    if (this.secretsFound.has(id)) return false;
    this.secretsFound.add(id);
    try {
      localStorage.setItem('eashans-quest-secrets', JSON.stringify([...this.secretsFound]));
    } catch {
      /* ignore */
    }
    return true;
  }

  has(id: string): boolean {
    return this.secretsFound.has(id);
  }

  get count(): number {
    return this.secretsFound.size;
  }

  unlockSecretLevel(): boolean {
    return Storage.markSecretUnlocked();
  }

  isSecretLevelUnlocked(): boolean {
    return Storage.isSecretLevelUnlocked();
  }
}

export const EasterEggs = new EasterEggTracker();
