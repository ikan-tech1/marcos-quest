import Phaser from 'phaser';
import { PROJECTILE_SPEED } from '../config/constants';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  isActive = true;

  constructor(scene: Phaser.Scene, x: number, y: number, direction: number) {
    super(scene, x, y, 'projectile');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setFlipX(direction < 0);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocityX(direction * PROJECTILE_SPEED);
    body.setSize(10, 10);
    body.setOffset(1, 1);

    scene.time.delayedCall(2000, () => {
      if (this.active) this.destroy();
    });
  }

  deactivate(): void {
    if (!this.isActive) return;
    this.isActive = false;
    this.destroy();
  }
}
