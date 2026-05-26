import Phaser from 'phaser';
import { TILE_SIZE, TileType } from '../config/constants';
import { Block } from './Block';
import type { LevelData } from '../levels/levelData';
import { parseLevelMap } from '../levels/levelData';

const POLE_SEGMENT_H = 32;
const FLAG_OFFSET_X = 10;

export interface FlagpoleBounds {
  poleX: number;
  poleTopY: number;
  poleBottomY: number;
  goalTileX: number;
}

export class Flagpole {
  readonly bounds: FlagpoleBounds;
  private scene: Phaser.Scene;
  private poleContainer: Phaser.GameObjects.Container;
  private flagSprite: Phaser.GameObjects.Image;
  private waveTween?: Phaser.Tweens.Tween;
  private slideTween?: Phaser.Tweens.Tween;
  triggerZone: Phaser.GameObjects.Zone;

  constructor(scene: Phaser.Scene, level: LevelData) {
    this.scene = scene;
    this.bounds = Flagpole.computeBounds(level);
    const { poleX, poleTopY, poleBottomY } = this.bounds;

    this.poleContainer = scene.add.container(poleX, 0).setDepth(3);

    const poleHeight = poleBottomY - poleTopY + POLE_SEGMENT_H;
    const segmentCount = Math.ceil(poleHeight / POLE_SEGMENT_H);
    for (let i = 0; i < segmentCount; i++) {
      const segY = poleTopY + i * POLE_SEGMENT_H;
      const img = scene.add.image(0, segY, 'flagpole-pole').setOrigin(0.5, 0);
      this.poleContainer.add(img);
    }

    const ballY = poleTopY - 8;
    const ball = scene.add.image(0, ballY, 'flagpole-ball').setOrigin(0.5, 1);
    this.poleContainer.add(ball);

    this.flagSprite = scene.add
      .image(poleX + FLAG_OFFSET_X, poleTopY + 4, 'flagpole-flag')
      .setOrigin(0, 0.5)
      .setDepth(4);

    const zoneH = poleBottomY - poleTopY + TILE_SIZE * 2;
    const zoneY = (poleTopY + poleBottomY) / 2;
    this.triggerZone = scene.add.zone(poleX, zoneY, TILE_SIZE * 2.5, zoneH);
    scene.physics.add.existing(this.triggerZone, true);
  }

  static computeBounds(level: LevelData): FlagpoleBounds {
    const grid = parseLevelMap(level.map);
    const height = grid.length;
    const goalTileX = level.goalX;

    let groundRow = height - 1;
    for (let ty = height - 1; ty >= 0; ty--) {
      const t = grid[ty][goalTileX];
      if (t === TileType.Ground || t === TileType.Hard || t === TileType.Brick) {
        groundRow = ty;
        break;
      }
    }

    const poleTopRow = 2;
    const poleBottomRow = Math.max(poleTopRow + 2, groundRow - 1);
    const top = Block.worldPos(goalTileX, poleTopRow);
    const bottom = Block.worldPos(goalTileX, poleBottomRow);

    return {
      poleX: top.x,
      poleTopY: top.y - TILE_SIZE / 2,
      poleBottomY: bottom.y,
      goalTileX,
    };
  }

  get flag(): Phaser.GameObjects.Image {
    return this.flagSprite;
  }

  startFlagWave(): void {
    this.waveTween?.stop();
    this.waveTween = this.scene.tweens.add({
      targets: this.flagSprite,
      scaleX: { from: 1, to: 0.88 },
      angle: { from: 0, to: 6 },
      duration: 280,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  stopFlagWave(): void {
    this.waveTween?.stop();
    this.flagSprite.setScale(1, 1);
    this.flagSprite.setAngle(0);
  }

  slideFlagTo(y: number, duration: number, ease: string, onComplete?: () => void): void {
    this.slideTween?.stop();
    this.slideTween = this.scene.tweens.add({
      targets: this.flagSprite,
      y,
      duration,
      ease,
      onComplete: () => {
        this.slideTween = undefined;
        onComplete?.();
      },
    });
  }

  setFlagY(y: number): void {
    this.slideTween?.stop();
    this.flagSprite.y = y;
  }

  destroy(): void {
    this.waveTween?.stop();
    this.slideTween?.stop();
    this.poleContainer.destroy();
    this.flagSprite.destroy();
    this.triggerZone.destroy();
  }
}
