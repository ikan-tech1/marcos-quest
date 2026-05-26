import Phaser from 'phaser';
import { TILE_SIZE } from '../config/constants';

export interface MovingPlatformConfig {
  tileX: number;
  tileY: number;
  width: number;
  range: number;
  speed: number;
  axis: 'x' | 'y';
}

export class MovingPlatform extends Phaser.Physics.Arcade.Sprite {
  private startX: number;
  private startY: number;
  private range: number;
  private speed: number;
  private axis: 'x' | 'y';
  private phase = 0;
  private deltaX = 0;
  private deltaY = 0;

  constructor(scene: Phaser.Scene, config: MovingPlatformConfig) {
    const x = config.tileX * TILE_SIZE + (config.width * TILE_SIZE) / 2;
    const y = config.tileY * TILE_SIZE + TILE_SIZE / 2;
    super(scene, x, y, 'tile-moving');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.startX = x;
    this.startY = y;
    this.range = config.range;
    this.speed = config.speed;
    this.axis = config.axis;

    this.setDisplaySize(config.width * TILE_SIZE, 12);
    this.setDepth(2);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.setAllowGravity(false);
    body.checkCollision.down = false;
    body.checkCollision.left = false;
    body.checkCollision.right = false;
  }

  update(_time: number, delta: number): void {
    const oldX = this.x;
    const oldY = this.y;
    this.phase += delta * 0.001 * this.speed;
    const offset = Math.sin(this.phase) * this.range;

    if (this.axis === 'x') {
      this.x = this.startX + offset;
    } else {
      this.y = this.startY + offset;
    }

    this.deltaX = this.x - oldX;
    this.deltaY = this.y - oldY;
  }

  carryPlayer(player: Phaser.Physics.Arcade.Sprite): void {
    const body = player.body as Phaser.Physics.Arcade.Body;
    if (!body) return;
    const platBody = this.body as Phaser.Physics.Arcade.Body;
    const onTop =
      body.velocity.y >= 0 &&
      body.bottom <= platBody.top + 14 &&
      Math.abs(player.x - this.x) < this.displayWidth / 2 + 8;

    if (onTop) {
      player.x += this.deltaX;
      player.y += this.deltaY;
    }
  }
}
