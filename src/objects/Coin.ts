import Phaser from 'phaser';
import { GameState } from '../systems/GameState';
import type { AudioManager } from '../systems/AudioManager';
import { spawnSparkle } from '../utils/effects';

export class Coin extends Phaser.Physics.Arcade.Sprite {
  collected = false;

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

  collect(audio: AudioManager): void {
    if (this.collected) return;
    this.collected = true;
    GameState.addCoin();
    audio.playCoin();
    spawnSparkle(this.scene, this.x, this.y);
    this.scene.tweens.add({
      targets: this,
      y: this.y - 40,
      alpha: 0,
      duration: 300,
      onComplete: () => this.destroy(),
    });
  }
}
