import Phaser from 'phaser';
import {
  ENEMY_FLYER_SPEED,
  ENEMY_SHELL_SPEED,
  ENEMY_WALKER_SPEED,
  EnemyType,
} from '../config/constants';
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
  private piranhaTimer = 0;
  private piranhaHidden = false;
  private piranhaTelegraph = false;
  private bossHp = 3;
  private walkAnimTimer = 0;
  private walkFrame = 0;
  private wingFlapTimer = 0;
  private wingUp = true;
  private shellSpinAngle = 0;

  setGroundLayer(layer: Phaser.Physics.Arcade.StaticGroup): void {
    this.groundLayer = layer;
  }

  checkLedge(): void {
    if (
      !this.groundLayer ||
      this.enemyType === EnemyType.Flyer ||
      this.enemyType === EnemyType.Piranha ||
      this.enemyType === EnemyType.Boss ||
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
          : type === EnemyType.Piranha
            ? 'enemy-piranha'
            : type === EnemyType.Boss
              ? 'enemy-boss'
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
    } else if (type === EnemyType.Piranha) {
      body.setAllowGravity(false);
      body.setSize(22, 24);
      body.setOffset(3, 4);
      this.y += 16;
    } else if (type === EnemyType.Boss) {
      body.setSize(36, 40);
      body.setOffset(6, 4);
      body.setVelocityX(-ENEMY_WALKER_SPEED * 0.8);
      this.setScale(1.4);
    } else {
      body.setSize(24, 20);
      body.setOffset(2, 2);
      body.setVelocityX(-ENEMY_WALKER_SPEED);
    }
  }

  update(_time: number, delta: number, playerX?: number): void {
    if (!this.isActive) return;
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.enemyType === EnemyType.Piranha) {
      this.piranhaTimer += delta;
      if (playerX !== undefined && Math.abs(playerX - this.x) < 48) {
        this.piranhaHidden = true;
        this.piranhaTelegraph = false;
      } else if (this.piranhaTimer > 2000) {
        if (!this.piranhaHidden && !this.piranhaTelegraph) {
          this.piranhaTelegraph = true;
          this.piranhaTimer = 0;
          this.setTint(0xffff88);
        } else if (this.piranhaTelegraph && this.piranhaTimer > 600) {
          this.piranhaHidden = !this.piranhaHidden;
          this.piranhaTelegraph = false;
          this.clearTint();
          this.piranhaTimer = 0;
        }
      }
      const targetY = this.piranhaHidden ? this.flyBaseY + 24 : this.piranhaTelegraph ? this.flyBaseY + 8 : this.flyBaseY - 8;
      this.y = Phaser.Math.Linear(this.y, targetY, this.piranhaTelegraph ? 0.04 : 0.08);
      return;
    }

    if (this.enemyType === EnemyType.Boss) {
      if (body.blocked.left || this.x <= this.patrolMin) {
        this.direction = 1;
        body.setVelocityX(ENEMY_WALKER_SPEED * 0.8);
        this.setFlipX(true);
      } else if (body.blocked.right || this.x >= this.patrolMax) {
        this.direction = -1;
        body.setVelocityX(-ENEMY_WALKER_SPEED * 0.8);
        this.setFlipX(false);
      }
      this.walkAnimTimer += delta;
      if (this.walkAnimTimer > 150) {
        this.walkAnimTimer = 0;
        this.walkFrame = this.walkFrame === 0 ? 1 : 0;
      }
      return;
    }

    if (this.enemyType === EnemyType.Flyer) {
      this.flyPhase += delta * 0.003;
      this.y = this.flyBaseY + Math.sin(this.flyPhase) * 40;
      body.setVelocityX(this.direction * ENEMY_FLYER_SPEED);
      this.wingFlapTimer += delta;
      if (this.wingFlapTimer > 120) {
        this.wingFlapTimer = 0;
        this.wingUp = !this.wingUp;
        this.setTexture(this.wingUp ? 'enemy-flyer' : 'enemy-flyer-wing');
      }
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
      this.shellSpinAngle += delta * 0.02 * this.direction;
      this.setAngle(this.shellSpinAngle * 30);
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

    if (Math.abs(body.velocity.x) > 10) {
      this.walkAnimTimer += delta;
      if (this.walkAnimTimer > 120) {
        this.walkAnimTimer = 0;
        this.walkFrame = this.walkFrame === 0 ? 1 : 0;
        this.setTexture(this.walkFrame === 0 ? 'enemy-walker' : 'enemy-walker-run1');
      }
    }
  }

  stomp(): boolean {
    if (!this.isActive) return false;

    if (this.enemyType === EnemyType.Piranha && !this.piranhaHidden) {
      return false;
    }

    if (this.enemyType === EnemyType.Boss) {
      this.bossHp -= 1;
      this.setTint(0xff4444);
      this.scene.tweens.add({
        targets: this,
        alpha: 0.3,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 80,
        yoyo: true,
        onComplete: () => {
          this.clearTint();
          this.setScale(1.4);
        },
      });
      if (this.bossHp <= 0) {
        this.defeat();
      }
      return true;
    }

    if (this.enemyType === EnemyType.Flyer) {
      this.enemyType = EnemyType.Walker;
      this.setTexture('enemy-walker');
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(true);
      body.setSize(24, 20);
      body.setOffset(2, 2);
      body.setVelocityX(this.direction * ENEMY_WALKER_SPEED);
      return true;
    }

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

    if (this.enemyType === EnemyType.Piranha && !this.piranhaHidden) {
      if (player.isStarPowered) {
        this.defeat();
        return 'none';
      }
      return 'hurt';
    }

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
