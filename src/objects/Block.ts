import Phaser from 'phaser';
import { COIN_BLOCK_COINS, TILE_SIZE, TileType } from '../config/constants';
import type { PowerUpType } from '../config/constants';

export type BlockKind = 'question' | 'brick' | 'hidden' | 'coin-block' | 'spring';

export class Block extends Phaser.Physics.Arcade.Sprite {
  blockKind: BlockKind;
  tileX: number;
  tileY: number;
  isUsed = false;
  contents: 'coin' | PowerUpType;
  hiddenRevealed = false;
  coinBlockRemaining = COIN_BLOCK_COINS;
  coinBlockCooldown = 0;

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
          : kind === 'coin-block'
            ? 'tile-coin-block'
            : kind === 'spring'
              ? 'tile-spring'
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

    if (kind === 'hidden') {
      this.setAlpha(0);
    }

    if (kind === 'question' && !this.isUsed) {
      scene.tweens.add({
        targets: this,
        y: y - 2,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      scene.tweens.add({
        targets: this,
        angle: { from: -2, to: 2 },
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  hitFromBelow(): boolean {
    if (this.blockKind === 'spring') {
      this.scene.tweens.add({
        targets: this,
        y: this.y - 6,
        duration: 80,
        yoyo: true,
      });
      return true;
    }

    if (this.blockKind === 'coin-block') {
      if (this.coinBlockRemaining <= 0 || this.coinBlockCooldown > 0) return false;
      this.scene.tweens.add({
        targets: this,
        y: this.y - 10,
        scaleX: 1.05,
        scaleY: 0.92,
        duration: 60,
        yoyo: true,
      });
      this.coinBlockRemaining -= 1;
      this.coinBlockCooldown = 120;
      if (this.coinBlockRemaining <= 0) {
        this.isUsed = true;
        this.setTexture('tile-used');
      }
      return true;
    }

    if (this.isUsed && this.blockKind !== 'brick') return false;

    if (this.blockKind === 'hidden' && !this.hiddenRevealed) {
      this.hiddenRevealed = true;
      this.setAlpha(1);
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

  updateCooldown(delta: number): void {
    if (this.coinBlockCooldown > 0) {
      this.coinBlockCooldown = Math.max(0, this.coinBlockCooldown - delta);
    }
  }

  break(): void {
    this.destroy();
  }

  static tileTypeToTexture(type: TileType, themeGround = 'tile-ground'): string | null {
    switch (type) {
      case TileType.Ground:
        return themeGround;
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
      case TileType.CoinBlock:
        return 'tile-coin-block';
      case TileType.Spring:
        return 'tile-spring';
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
      type === TileType.Hidden ||
      type === TileType.CoinBlock ||
      type === TileType.Spring
    );
  }

  static worldPos(tileX: number, tileY: number): { x: number; y: number } {
    return {
      x: tileX * TILE_SIZE + TILE_SIZE / 2,
      y: tileY * TILE_SIZE + TILE_SIZE / 2,
    };
  }
}
