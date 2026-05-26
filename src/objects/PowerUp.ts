import Phaser from 'phaser';
import { PowerUpType } from '../config/constants';

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
  powerType: PowerUpType;
  collected = false;

  constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
    const texture =
      type === PowerUpType.Spark
        ? 'powerup-spark'
        : type === PowerUpType.Blaze
          ? 'powerup-blaze'
          : type === PowerUpType.OneUp
            ? 'powerup-oneup'
            : 'powerup-star';

    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.powerType = type;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);
    body.setVelocityX(40);
    body.setBounce(0);
    body.setCollideWorldBounds(true);
    body.setSize(16, 20);
    body.setOffset(2, 2);

    scene.tweens.add({
      targets: this,
      angle: type === PowerUpType.OneUp ? 0 : 360,
      duration: 2000,
      repeat: -1,
    });

    if (type === PowerUpType.OneUp) {
      scene.tweens.add({
        targets: this,
        y: y - 4,
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  collect(): void {
    if (this.collected) return;
    this.collected = true;
    this.destroy();
  }
}
