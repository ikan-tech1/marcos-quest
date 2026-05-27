import { GameState } from './GameState';
import { Storage } from './Storage';

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];

export interface SecretDefinition {
  id: string;
  title: string;
  hint: string;
  hidden?: boolean;
}

export const SECRET_DEFINITIONS: SecretDefinition[] = [
  { id: 'konami', title: 'Konami Code', hint: 'Classic ↑↑↓↓←→←→BA on title screen' },
  { id: 'dev-message', title: 'Dev Message', hint: 'Find the hidden block in World 1-1' },
  { id: 'secret-pipe', title: 'Secret Pipe', hint: 'Warp pipe in World 2-1 underground' },
  { id: 'flag-top', title: 'Flag Top Bonus', hint: 'Touch the very top of the flag pole' },
  { id: 'hidden-1up', title: 'Hidden 1-Up', hint: 'Break invisible blocks for extra lives' },
  { id: 'score-10k', title: 'Score Master', hint: 'Reach 10,000 points in a run' },
  { id: 'hidden-room-2-1', title: 'Hidden Chamber', hint: 'Secret alcove in World 2-1 — press ↓ on the ? sign', hidden: true },
  { id: 'spring-obsessed', title: 'Spring Obsessed', hint: 'Bounce on 5 springs in one level', hidden: true },
  { id: 'triple-jump-cliff', title: 'Sky Walker', hint: 'Triple jump at the World 1-2 cliff edge', hidden: true },
  { id: 'flag-dash', title: 'Flag Dash', hint: 'Dash through the flag zone before grabbing', hidden: true },
  { id: 'cheat-quest', title: 'QUEST Code', hint: 'Type QUEST in the pause cheat panel', hidden: true },
  { id: 'cheat-coins', title: 'COINS Code', hint: 'Type COINS in the pause cheat panel', hidden: true },
  { id: 'cheat-star', title: 'STAR Code', hint: 'Type STAR in the pause cheat panel', hidden: true },
  { id: 'nova-unlock', title: 'Nova Hero', hint: 'Complete all missions to unlock Nova', hidden: true },
  { id: 'sign-talker', title: 'Sign Reader', hint: 'Talk to every ? sign in a single level', hidden: true },
];

const CHEAT_CODES: Record<string, () => void> = {
  QUEST: () => {
    GameState.lives += 1;
  },
  COINS: () => {
    Storage.addShopCoins(50);
  },
  STAR: () => {
    GameState.addScore(5000);
  },
  NOVA: () => {
    Storage.unlockNova();
  },
};

export class EasterEggTracker {
  private konamiIndex = 0;
  private secretsFound = new Set<string>();
  private springBounces = 0;
  private signsTalked = new Set<string>();

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

  tryCheatCode(input: string): string | null {
    const code = input.trim().toUpperCase();
    const fn = CHEAT_CODES[code];
    if (!fn) return null;
    fn();
    this.unlock(`cheat-${code.toLowerCase()}`);
    if (code === 'QUEST' || code === 'COINS' || code === 'STAR') {
      this.unlock('cheat-quest');
    }
    return code;
  }

  onSpringBounce(): boolean {
    this.springBounces += 1;
    if (this.springBounces >= 5) {
      return this.unlock('spring-obsessed');
    }
    return false;
  }

  resetLevelTracking(): void {
    this.springBounces = 0;
    this.signsTalked.clear();
  }

  onSignTalk(signId: string): boolean {
    this.signsTalked.add(signId);
    if (this.signsTalked.size >= 2) {
      return this.unlock('sign-talker');
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

  getDiscoveredSecrets(): SecretDefinition[] {
    return SECRET_DEFINITIONS.filter((s) => this.secretsFound.has(s.id));
  }

  getUndiscoveredCount(): number {
    return SECRET_DEFINITIONS.length - this.secretsFound.size;
  }

  unlockSecretLevel(): boolean {
    return Storage.markSecretUnlocked();
  }

  isSecretLevelUnlocked(): boolean {
    return Storage.isSecretLevelUnlocked();
  }
}

export const EasterEggs = new EasterEggTracker();
