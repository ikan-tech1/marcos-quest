import { LEVEL_TIME_SECONDS, STARTING_LIVES } from '../config/constants';
import { Storage } from './Storage';

class GameStateManager {
  score = 0;
  coins = 0;
  lives = STARTING_LIVES;
  currentLevel = 0;
  combo = 0;
  comboTimer = 0;
  timeLeft = LEVEL_TIME_SECONDS;
  flagBonus = 0;
  lastLevelBonus = 0;

  reset(): void {
    this.score = 0;
    this.coins = 0;
    this.lives = STARTING_LIVES;
    this.currentLevel = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.timeLeft = LEVEL_TIME_SECONDS;
    this.flagBonus = 0;
    this.lastLevelBonus = 0;
  }

  resetTimer(seconds = LEVEL_TIME_SECONDS): void {
    this.timeLeft = seconds;
  }

  tickTimer(delta: number): boolean {
    this.timeLeft = Math.max(0, this.timeLeft - delta / 1000);
    return this.timeLeft <= 0;
  }

  get comboMultiplier(): number {
    if (this.combo <= 1) return 1;
    if (this.combo <= 3) return 2;
    if (this.combo <= 6) return 3;
    return 4;
  }

  updateCombo(delta: number): void {
    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
    } else if (this.combo > 0) {
      this.combo = 0;
    }
  }

  addStomp(): number {
    this.combo += 1;
    this.comboTimer = 2500;
    const points = 100 * this.comboMultiplier;
    this.score += points;
    return points;
  }

  addCoin(): boolean {
    this.coins += 1;
    this.score += 100;
    if (this.coins >= 100) {
      this.coins = 0;
      this.lives += 1;
      return true;
    }
    return false;
  }

  addLife(): void {
    this.lives += 1;
  }

  addScore(points: number): void {
    this.score += points;
  }

  addFlagBonus(touchY: number, poleTopY: number, poleBottomY: number): number {
    const span = Math.max(1, poleBottomY - poleTopY);
    const heightRatio = Math.min(1, Math.max(0, (poleBottomY - touchY) / span));
    const heightBonus = Math.floor(100 + heightRatio * 4900);
    const timeBonus = Math.floor(this.timeLeft) * 50;
    this.flagBonus = heightBonus;
    this.lastLevelBonus = heightBonus + timeBonus;
    this.score += this.lastLevelBonus;
    return this.lastLevelBonus;
  }

  loseLife(): boolean {
    this.lives -= 1;
    this.combo = 0;
    this.comboTimer = 0;
    return this.lives <= 0;
  }

  nextLevel(): void {
    Storage.markLevelCompleted(this.currentLevel);
    this.currentLevel += 1;
    this.combo = 0;
    this.comboTimer = 0;
    this.timeLeft = LEVEL_TIME_SECONDS;
    this.flagBonus = 0;
  }

  recordHighScore(): { highScore: number; isNewRecord: boolean } {
    const isNewRecord = Storage.setHighScore(this.score);
    return { highScore: Math.max(this.score, Storage.getHighScore()), isNewRecord };
  }

  get highScore(): number {
    return Storage.getHighScore();
  }
}

export const GameState = new GameStateManager();
