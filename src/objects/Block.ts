import Phaser from 'phaser';
import { TILE_SIZE, TileType } from '../config/constants';
import type { PowerUpType } from '../config/constants';

export type BlockKind = 'question' | 'brick' | 'hidden';

export class Block extends Phaser.Physics.Arcade.Sprite {
  blockKind: BlockKind;
  tileX: number;
  tileY: number;
  isUsed = false;
  contents: 'coin' | PowerUpType;
  hiddenRevealed = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    kind: BlockKind,
    tileX: number,
    tileY: number,
    contents: 'coin' | PowerUpType = 'coin',
  ) {
    const texture =
      kind === 'question'
        ? 'tile-question'
        : kind === 'hidden'
          ? 'tile-hidden'
          : 'tile-brick';

    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.blockKind = kind;
    this.tileX = tileX;
    this.tileY = tileY;
    this.contents = contents;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.setAllowGravity(false);
  }

  hitFromBelow(): boolean {
    if (this.isUsed && this.blockKind !== 'brick') return false;

    if (this.blockKind === 'hidden' && !this.hiddenRevealed) {
      this.hiddenRevealed = true;
      this.setTexture('tile-used');
      this.isUsed = true;
      return true;
    }

    if (this.blockKind === 'question' && !this.isUsed) {
      this.isUsed = true;
      this.setTexture('tile-used');
      this.scene.tweens.add({
        targets: this,
        y: this.y - 8,
        duration: 80,
        yoyo: true,
      });
      return true;
    }

    if (this.blockKind === 'brick') {
      this.scene.tweens.add({
        targets: this,
        y: this.y - 4,
        duration: 60,
        yoyo: true,
      });
      return true;
    }

    return false;
  }

  break(): void {
    this.destroy();
  }

  static tileTypeToTexture(type: TileType): string | null {
    switch (type) {
      case TileType.Ground:
        return 'tile-ground';
      case TileType.Brick:
        return 'tile-brick';
      case TileType.Question:
        return 'tile-question';
      case TileType.Pipe:
        return 'tile-pipe';
      case TileType.Hard:
        return 'tile-hard';
      case TileType.Hidden:
        return 'tile-hidden';
      default:
        return null;
    }
  }

  static isSolid(type: TileType): boolean {
    return (
      type === TileType.Ground ||
      type === TileType.Brick ||
      type === TileType.Question ||
      type === TileType.Pipe ||
      type === TileType.Hard ||
      type === TileType.Hidden
    );
  }

  static worldPos(tileX: number, tileY: number): { x: number; y: number } {
    return {
      x: tileX * TILE_SIZE + TILE_SIZE / 2,
      y: tileY * TILE_SIZE + TILE_SIZE / 2,
    };
  }
}
