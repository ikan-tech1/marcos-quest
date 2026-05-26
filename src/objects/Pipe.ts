import Phaser from 'phaser';
import { TILE_SIZE } from '../config/constants';

export interface PipeWarpConfig {
  entryX: number;
  entryY: number;
  exitX: number;
  exitY: number;
  secret?: boolean;
}

export class Pipe extends Phaser.GameObjects.Zone {
  config: PipeWarpConfig;
  cooldown = false;

  constructor(scene: Phaser.Scene, config: PipeWarpConfig) {
    const x = config.entryX * TILE_SIZE + TILE_SIZE / 2;
    const y = config.entryY * TILE_SIZE + TILE_SIZE / 2;
    super(scene, x, y, TILE_SIZE, TILE_SIZE * 2);
    scene.add.existing(this);
    scene.physics.add.existing(this, false);

    this.config = config;
    if (config.secret) {
      const marker = scene.add.text(x, y - TILE_SIZE, '?', {
        fontSize: '10px',
        color: '#ffff88',
      });
      marker.setAlpha(0.3);
      marker.setDepth(5);
    }
  }

  canEnter(playerX: number, playerY: number, movingDown: boolean): boolean {
    if (this.cooldown) return false;
    const dx = Math.abs(playerX - this.x);
    const dy = Math.abs(playerY - this.y);
    return dx < TILE_SIZE * 0.6 && dy < TILE_SIZE && movingDown;
  }

  setCooldown(ms: number): void {
    this.cooldown = true;
    this.scene.time.delayedCall(ms, () => {
      this.cooldown = false;
    });
  }
}
