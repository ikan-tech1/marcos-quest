import { STARTING_LIVES } from '../config/constants';

class GameStateManager {
  score = 0;
  coins = 0;
  lives = STARTING_LIVES;
  currentLevel = 0;
  combo = 0;
  comboTimer = 0;

  reset(): void {
    this.score = 0;
    this.coins = 0;
    this.lives = STARTING_LIVES;
    this.currentLevel = 0;
    this.combo = 0;
    this.comboTimer = 0;
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

  addCoin(): void {
    this.coins += 1;
    this.score += 100;
    if (this.coins >= 100) {
      this.coins = 0;
      this.lives += 1;
    }
  }

  addScore(points: number): void {
    this.score += points;
  }

  loseLife(): boolean {
    this.lives -= 1;
    this.combo = 0;
    this.comboTimer = 0;
    return this.lives <= 0;
  }

  nextLevel(): void {
    this.currentLevel += 1;
    this.combo = 0;
    this.comboTimer = 0;
  }
}

export const GameState = new GameStateManager();
