import Phaser from 'phaser';
import { ENEMY_FLYER_SPEED, ENEMY_SHELL_SPEED, ENEMY_WALKER_SPEED, EnemyType } from '../config/constants';
import type { Player } from './Player';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  enemyType: EnemyType;
  direction = -1;
  isShell = false;
  isActive = true;
  private patrolMin: number;
  private patrolMax: number;
  private flyBaseY: number;
  private flyPhase = 0;
  private groundLayer: Phaser.Physics.Arcade.StaticGroup | null = null;

  setGroundLayer(layer: Phaser.Physics.Arcade.StaticGroup): void {
    this.groundLayer = layer;
  }

  checkLedge(): void {
    if (
      !this.groundLayer ||
      this.enemyType === EnemyType.Flyer ||
      this.isShell ||
      !this.isActive
    ) {
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body.blocked.down && !body.touching.down) return;

    const probeX = this.x + this.direction * 20;
    const probeY = body.bottom + 18;
    let hasGround = false;

    for (const child of this.groundLayer.getChildren()) {
      const tile = child as Phaser.Physics.Arcade.Sprite;
      if (!tile.active) continue;
      if (Math.abs(tile.x - probeX) < 18 && Math.abs(tile.y - probeY) < 18) {
        hasGround = true;
        break;
      }
    }

    if (!hasGround) {
      this.direction *= -1;
      body.setVelocityX(this.direction * ENEMY_WALKER_SPEED);
      this.setFlipX(this.direction > 0);
    }
  }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: EnemyType,
    patrolMin?: number,
    patrolMax?: number,
  ) {
    const texture =
      type === EnemyType.Walker
        ? 'enemy-walker'
        : type === EnemyType.Shell
          ? 'enemy-shell'
          : 'enemy-flyer';

    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.enemyType = type;
    this.patrolMin = patrolMin ?? x - 120;
    this.patrolMax = patrolMax ?? x + 120;
    this.flyBaseY = y;

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (type === EnemyType.Flyer) {
      body.setAllowGravity(false);
      body.setSize(24, 16);
      body.setOffset(2, 2);
    } else {
      body.setSize(24, 20);
      body.setOffset(2, 2);
      body.setVelocityX(-ENEMY_WALKER_SPEED);
    }
  }

  update(_time: number, delta: number): void {
    if (!this.isActive) return;
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.enemyType === EnemyType.Flyer) {
      this.flyPhase += delta * 0.003;
      this.y = this.flyBaseY + Math.sin(this.flyPhase) * 40;
      body.setVelocityX(this.direction * ENEMY_FLYER_SPEED);
      if (this.x <= this.patrolMin) {
        this.direction = 1;
        this.setFlipX(true);
      } else if (this.x >= this.patrolMax) {
        this.direction = -1;
        this.setFlipX(false);
      }
      return;
    }

    if (this.isShell) {
      body.setVelocityX(this.direction * ENEMY_SHELL_SPEED);
      return;
    }

    if (body.blocked.left || this.x <= this.patrolMin) {
      this.direction = 1;
      body.setVelocityX(ENEMY_WALKER_SPEED);
      this.setFlipX(true);
    } else if (body.blocked.right || this.x >= this.patrolMax) {
      this.direction = -1;
      body.setVelocityX(-ENEMY_WALKER_SPEED);
      this.setFlipX(false);
    }

    if (body.blocked.down && body.velocity.x === 0) {
      body.setVelocityX(this.direction * ENEMY_WALKER_SPEED);
    }

    this.checkLedge();
  }

  stomp(): boolean {
    if (!this.isActive) return false;

    if (this.enemyType === EnemyType.Shell && !this.isShell) {
      this.isShell = true;
      this.setTexture('enemy-shell-only');
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(0);
      return true;
    }

    if (this.enemyType === EnemyType.Shell && this.isShell) {
      this.direction = this.direction === 0 ? -1 : this.direction;
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(this.direction * ENEMY_SHELL_SPEED);
      return true;
    }

    this.defeat();
    return true;
  }

  kick(direction: number): void {
    if (this.enemyType !== EnemyType.Shell) return;
    this.isShell = true;
    this.setTexture('enemy-shell-only');
    this.direction = direction;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(direction * ENEMY_SHELL_SPEED);
  }

  defeat(): void {
    this.isActive = false;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, -200);
    body.setAllowGravity(true);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 300,
      onComplete: () => this.destroy(),
    });
  }

  handlePlayerCollision(player: Player): 'stomp' | 'hurt' | 'none' {
    if (!this.isActive) return 'none';

    const playerBody = player.body as Phaser.Physics.Arcade.Body;
    const falling = playerBody.velocity.y > 0;
    const playerBottom = playerBody.bottom;
    const enemyTop = (this.body as Phaser.Physics.Arcade.Body).top;

    if (falling && playerBottom <= enemyTop + 12) {
      return 'stomp';
    }

    if (this.enemyType === EnemyType.Shell && this.isShell) {
      const shellBody = this.body as Phaser.Physics.Arcade.Body;
      if (Math.abs(shellBody.velocity.x) < 40) {
        this.kick(player.x < this.x ? -1 : 1);
        return 'none';
      }
    }

    if (player.isStarPowered) {
      this.defeat();
      return 'none';
    }

    if (this.isShell && Math.abs((this.body as Phaser.Physics.Arcade.Body).velocity.x) > 50) {
      return 'hurt';
    }

    return 'hurt';
  }
}
