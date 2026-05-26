import Phaser from 'phaser';
import { GameState } from '../systems/GameState';
import type { AudioManager } from '../systems/AudioManager';
import { spawnSparkle } from '../utils/effects';

const COIN_FRAMES = ['coin', 'coin-side', 'coin-thin', 'coin-side'] as const;

export class Coin extends Phaser.Physics.Arcade.Sprite {
  collected = false;
  private spinTimer = 0;
  private spinFrame = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'coin');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(14, 14);
    body.setOffset(1, 1);

    scene.tweens.add({
      targets: this,
      y: y - 6,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  updateSpin(delta: number): void {
    if (this.collected) return;
    this.spinTimer += delta;
    if (this.spinTimer > 80) {
      this.spinTimer = 0;
      this.spinFrame = (this.spinFrame + 1) % COIN_FRAMES.length;
      this.setTexture(COIN_FRAMES[this.spinFrame]);
    }
  }

  collect(audio: AudioManager): boolean {
    if (this.collected) return false;
    this.collected = true;
    const gotLife = GameState.addCoin();
    audio.playCoin();
    spawnSparkle(this.scene, this.x, this.y);
    this.scene.tweens.add({
      targets: this,
      y: this.y - 40,
      alpha: 0,
      scale: 1.4,
      duration: 300,
      onComplete: () => this.destroy(),
    });
    return gotLife;
  }
}
