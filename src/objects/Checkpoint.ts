import Phaser from 'phaser';
import { TILE_SIZE } from '../config/constants';
import { Block } from '../objects/Block';
import { GameState } from '../systems/GameState';
import { AudioManager } from '../systems/AudioManager';
import { spawnSparkle } from '../utils/effects';

export class Checkpoint extends Phaser.GameObjects.Container {
  activated = false;
  private flag: Phaser.GameObjects.Image;
  private zone: Phaser.GameObjects.Zone;

  constructor(scene: Phaser.Scene, tileX: number, tileY: number) {
    const { x, y } = Block.worldPos(tileX, tileY);
    super(scene, x, y - TILE_SIZE / 2);

    const pole = scene.add.image(0, TILE_SIZE / 2, 'tile-ground').setTint(0x888888).setScale(0.4, 1.2);
    this.flag = scene.add.image(4, -4, 'particle').setTint(0x27ae60).setScale(2);
    this.add([pole, this.flag]);

    this.zone = scene.add.zone(x, y - 8, TILE_SIZE, TILE_SIZE * 1.5);
    scene.physics.add.existing(this.zone, true);

    this.setDepth(5);
    scene.add.existing(this);
  }

  getZone(): Phaser.GameObjects.Zone {
    return this.zone;
  }

  activate(audio: AudioManager): void {
    if (this.activated) return;
    this.activated = true;
    this.flag.setTint(0xe74c3c);
    GameState.setCheckpoint(this.x, this.y + TILE_SIZE / 2);
    spawnSparkle(this.scene, this.x, this.y);
    audio.playSecret();
    this.scene.tweens.add({
      targets: this.flag,
      y: this.flag.y - 4,
      duration: 200,
      yoyo: true,
      repeat: 2,
    });
  }
}
