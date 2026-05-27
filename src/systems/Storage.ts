import { DEFAULT_CHARACTER_ID } from '../config/characters';
import type { GameModeId } from './gameModes';

const HIGH_SCORE_KEY = 'eashans-quest-high-score';
const COMPLETED_LEVELS_KEY = 'eashans-quest-completed';
const SOUND_ENABLED_KEY = 'eashans-quest-sound';
const SECRET_UNLOCKED_KEY = 'eashans-quest-secret';
const CHARACTER_KEY = 'eashans-quest-character';
const VIEW_MODE_KEY = 'eashans-quest-view-mode';
const GAME_MODE_KEY = 'eashans-quest-game-mode';
const ACTIVE_MISSIONS_KEY = 'eashans-quest-active-missions';
const COMPLETED_MISSIONS_KEY = 'eashans-quest-completed-missions';
const ACHIEVEMENTS_KEY = 'eashans-quest-achievements';
const DAILY_DATE_KEY = 'eashans-quest-daily-date';
const DAILY_STREAK_KEY = 'eashans-quest-daily-streak';
const SPEEDRUN_BEST_KEY = 'eashans-quest-speedrun-best';
const SPEEDRUN_GHOST_KEY = 'eashans-quest-speedrun-ghost';
const SHOP_COINS_KEY = 'eashans-quest-shop-coins';
const POWERUP_STASH_KEY = 'eashans-quest-powerup-stash';
const COSMETICS_KEY = 'eashans-quest-cosmetics';
const NOVA_UNLOCKED_KEY = 'eashans-quest-nova-unlocked';
const TOTAL_COINS_KEY = 'eashans-quest-total-coins';

export type ViewMode = 'fullscreen' | 'arcade';

function safeGet(key: string, fallback = ''): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const Storage = {
  getHighScore(): number {
    return Number(safeGet(HIGH_SCORE_KEY)) || 0;
  },

  setHighScore(score: number): boolean {
    const current = Storage.getHighScore();
    if (score <= current) return false;
    safeSet(HIGH_SCORE_KEY, String(score));
    return true;
  },

  getCompletedLevels(): number {
    return Number(safeGet(COMPLETED_LEVELS_KEY)) || 0;
  },

  markLevelCompleted(levelIndex: number): void {
    const completed = Storage.getCompletedLevels();
    if (levelIndex + 1 > completed) {
      safeSet(COMPLETED_LEVELS_KEY, String(levelIndex + 1));
    }
  },

  isLevelUnlocked(levelIndex: number): boolean {
    return levelIndex === 0 || levelIndex <= Storage.getCompletedLevels();
  },

  getSoundEnabled(): boolean {
    const stored = safeGet(SOUND_ENABLED_KEY);
    return stored === '' ? true : stored === 'true';
  },

  setSoundEnabled(enabled: boolean): void {
    safeSet(SOUND_ENABLED_KEY, String(enabled));
  },

  markSecretUnlocked(): boolean {
    if (safeGet(SECRET_UNLOCKED_KEY) === 'true') return false;
    safeSet(SECRET_UNLOCKED_KEY, 'true');
    return true;
  },

  isSecretLevelUnlocked(): boolean {
    return safeGet(SECRET_UNLOCKED_KEY) === 'true';
  },

  getSelectedCharacter(): string {
    return safeGet(CHARACTER_KEY, DEFAULT_CHARACTER_ID);
  },

  setSelectedCharacter(characterId: string): void {
    safeSet(CHARACTER_KEY, characterId);
  },

  getViewMode(): ViewMode {
    return safeGet(VIEW_MODE_KEY) === 'arcade' ? 'arcade' : 'fullscreen';
  },

  setViewMode(mode: ViewMode): void {
    safeSet(VIEW_MODE_KEY, mode);
  },

  getGameMode(): GameModeId {
    const mode = safeGet(GAME_MODE_KEY, 'adventure');
    const valid = ['adventure', 'speedrun', 'hardcore', 'coinRush', 'bossRush'];
    return valid.includes(mode) ? (mode as GameModeId) : 'adventure';
  },

  setGameMode(mode: GameModeId): void {
    safeSet(GAME_MODE_KEY, mode);
  },

  getActiveMissions(): string[] {
    return safeGetJSON<string[]>(ACTIVE_MISSIONS_KEY, []);
  },

  setActiveMissions(ids: string[]): void {
    safeSet(ACTIVE_MISSIONS_KEY, JSON.stringify(ids));
  },

  getCompletedMissionIds(): string[] {
    return safeGetJSON<string[]>(COMPLETED_MISSIONS_KEY, []);
  },

  markMissionCompleted(id: string): void {
    const ids = Storage.getCompletedMissionIds();
    if (!ids.includes(id)) {
      safeSet(COMPLETED_MISSIONS_KEY, JSON.stringify([...ids, id]));
    }
    if (ids.length + 1 >= 6) {
      Storage.unlockNova();
    }
  },

  getUnlockedAchievements(): string[] {
    return safeGetJSON<string[]>(ACHIEVEMENTS_KEY, []);
  },

  isAchievementUnlocked(id: string): boolean {
    return Storage.getUnlockedAchievements().includes(id);
  },

  unlockAchievement(id: string): void {
    const ids = Storage.getUnlockedAchievements();
    if (!ids.includes(id)) {
      safeSet(ACHIEVEMENTS_KEY, JSON.stringify([...ids, id]));
    }
  },

  getDailyCompletionDate(): string {
    return safeGet(DAILY_DATE_KEY);
  },

  getDailyStreak(): number {
    return Number(safeGet(DAILY_STREAK_KEY)) || 0;
  },

  setDailyCompletion(dateKey: string, streak: number): void {
    safeSet(DAILY_DATE_KEY, dateKey);
    safeSet(DAILY_STREAK_KEY, String(streak));
  },

  getSpeedrunBest(): number {
    return Number(safeGet(SPEEDRUN_BEST_KEY)) || 0;
  },

  setSpeedrunBest(ms: number): boolean {
    const current = Storage.getSpeedrunBest();
    if (current > 0 && ms >= current) return false;
    safeSet(SPEEDRUN_BEST_KEY, String(ms));
    return true;
  },

  getSpeedrunGhost(): number {
    return Number(safeGet(SPEEDRUN_GHOST_KEY)) || 0;
  },

  setSpeedrunGhost(ms: number): void {
    safeSet(SPEEDRUN_GHOST_KEY, String(ms));
  },

  getShopCoins(): number {
    return Number(safeGet(SHOP_COINS_KEY)) || 0;
  },

  addShopCoins(amount: number): void {
    safeSet(SHOP_COINS_KEY, String(Storage.getShopCoins() + amount));
  },

  spendShopCoins(amount: number): boolean {
    const current = Storage.getShopCoins();
    if (current < amount) return false;
    safeSet(SHOP_COINS_KEY, String(current - amount));
    return true;
  },

  getPowerUpStash(): number {
    return Number(safeGet(POWERUP_STASH_KEY)) || 0;
  },

  addPowerUpStash(count = 1): void {
    safeSet(POWERUP_STASH_KEY, String(Storage.getPowerUpStash() + count));
  },

  usePowerUpStash(): boolean {
    const stash = Storage.getPowerUpStash();
    if (stash <= 0) return false;
    safeSet(POWERUP_STASH_KEY, String(stash - 1));
    return true;
  },

  unlockCosmetic(id: string): void {
    const list = safeGetJSON<string[]>(COSMETICS_KEY, []);
    if (!list.includes(id)) {
      safeSet(COSMETICS_KEY, JSON.stringify([...list, id]));
    }
  },

  getCosmetics(): string[] {
    return safeGetJSON<string[]>(COSMETICS_KEY, []);
  },

  isNovaUnlocked(): boolean {
    return safeGet(NOVA_UNLOCKED_KEY) === 'true';
  },

  unlockNova(): void {
    safeSet(NOVA_UNLOCKED_KEY, 'true');
  },

  getTotalCoinsCollected(): number {
    return Number(safeGet(TOTAL_COINS_KEY)) || 0;
  },

  addTotalCoins(count: number): void {
    safeSet(TOTAL_COINS_KEY, String(Storage.getTotalCoinsCollected() + count));
  },
};
