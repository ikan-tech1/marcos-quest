const HIGH_SCORE_KEY = 'eashans-quest-high-score';
const COMPLETED_LEVELS_KEY = 'eashans-quest-completed';
const SOUND_ENABLED_KEY = 'eashans-quest-sound';
const SECRET_UNLOCKED_KEY = 'eashans-quest-secret';

export const Storage = {
  getHighScore(): number {
    try {
      return Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
    } catch {
      return 0;
    }
  },

  setHighScore(score: number): boolean {
    const current = Storage.getHighScore();
    if (score <= current) return false;
    try {
      localStorage.setItem(HIGH_SCORE_KEY, String(score));
    } catch {
      /* ignore */
    }
    return true;
  },

  getCompletedLevels(): number {
    try {
      return Number(localStorage.getItem(COMPLETED_LEVELS_KEY)) || 0;
    } catch {
      return 0;
    }
  },

  markLevelCompleted(levelIndex: number): void {
    const completed = Storage.getCompletedLevels();
    if (levelIndex + 1 > completed) {
      try {
        localStorage.setItem(COMPLETED_LEVELS_KEY, String(levelIndex + 1));
      } catch {
        /* ignore */
      }
    }
  },

  isLevelUnlocked(levelIndex: number): boolean {
    return levelIndex === 0 || levelIndex <= Storage.getCompletedLevels();
  },

  getSoundEnabled(): boolean {
    try {
      const stored = localStorage.getItem(SOUND_ENABLED_KEY);
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  },

  setSoundEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
    } catch {
      /* ignore */
    }
  },

  markSecretUnlocked(): boolean {
    try {
      if (localStorage.getItem(SECRET_UNLOCKED_KEY) === 'true') return false;
      localStorage.setItem(SECRET_UNLOCKED_KEY, 'true');
      return true;
    } catch {
      return false;
    }
  },

  isSecretLevelUnlocked(): boolean {
    try {
      return localStorage.getItem(SECRET_UNLOCKED_KEY) === 'true';
    } catch {
      return false;
    }
  },
};
