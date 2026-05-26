import Phaser from 'phaser';
import {
  COYOTE_TIME_MS,
  DASH_COOLDOWN_MS,
  DASH_DURATION_MS,
  DASH_SPEED,
  DOUBLE_JUMP_VELOCITY,
  INVINCIBLE_FLASH_MS,
  JUMP_BUFFER_MS,
  JUMP_CUT_VELOCITY,
  JUMP_VELOCITY,
  PLAYER_ACCEL,
  PLAYER_FRICTION,
  PLAYER_SPEED,
  PlayerState,
  STOMP_BOUNCE,
  STAR_DURATION_MS,
  WALL_JUMP_VELOCITY_X,
  WALL_JUMP_VELOCITY_Y,
  WALL_SLIDE_SPEED,
} from '../config/constants';
import {
  type CharacterDefinition,
  getCharacterById,
  getCharacterTextureKey,
} from '../config/characters';
import type { InputManager } from '../systems/InputManager';
import type { AudioManager } from '../systems/AudioManager';
import { squashStretch, spawnDust, spawnSparkle } from '../utils/effects';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private inputManager: InputManager;
  private audio: AudioManager;
  private character: CharacterDefinition;
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private dashTimer = 0;
  private dashCooldownTimer = 0;
  private isDashing = false;
  private dashDirection = 1;
  private wasOnFloor = false;
  private facing = 1;
  private invincibleTimer = 0;
  private starTimer = 0;
  private isDead = false;
  private jumpsRemaining = 2;
  private maxJumps = 2;
  private dashTrailTimer = 0;
  private runAnimTimer = 0;
  private runFrame = 0;

  playerState: PlayerState = PlayerState.Small;
  fireEnabled = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    input: InputManager,
    audio: AudioManager,
    characterId?: string,
  ) {
    const character = getCharacterById(characterId ?? 'eashan');
    super(scene, x, y, getCharacterTextureKey(character.id, 'small', false, 0));
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.inputManager = input;
    this.audio = audio;
    this.character = character;
    this.setCollideWorldBounds(false);
    this.setDragX(0);
    this.setDepth(10);
    this.applyStateSize();
  }

  get characterId(): string {
    return this.character.id;
  }

  get characterName(): string {
    return this.character.name;
  }

  private get speed(): number {
    return PLAYER_SPEED * this.character.stats.speedMult;
  }

  private get jumpVelocity(): number {
    return JUMP_VELOCITY * this.character.stats.jumpMult;
  }

  private get doubleJumpVelocity(): number {
    return DOUBLE_JUMP_VELOCITY * this.character.stats.jumpMult;
  }

  private get wallJumpVelocityY(): number {
    return WALL_JUMP_VELOCITY_Y * this.character.stats.jumpMult;
  }

  private get dashCooldown(): number {
    return DASH_COOLDOWN_MS * this.character.stats.dashCooldownMult;
  }

  get isInvincible(): boolean {
    return this.invincibleTimer > 0 || this.starTimer > 0;
  }

  get isStarPowered(): boolean {
    return this.starTimer > 0;
  }

  get canFire(): boolean {
    return this.fireEnabled && this.playerState === PlayerState.Blaze;
  }

  update(_time: number, delta: number): void {
    if (this.isDead) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    const onFloor = body.blocked.down || body.touching.down;
    const onWall = (body.blocked.left || body.blocked.right) && !onFloor;
    const wallDir = body.blocked.left ? -1 : body.blocked.right ? 1 : 0;

    if (onFloor) {
      this.jumpsRemaining = this.maxJumps;
    }

    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= delta;
      this.alpha = Math.floor(this.invincibleTimer / 80) % 2 === 0 ? 0.5 : 1;
    } else if (this.starTimer > 0) {
      this.starTimer -= delta;
      this.alpha = Math.floor(this.starTimer / 60) % 2 === 0 ? 0.7 : 1;
      const colors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff, 0xff00ff];
      this.setTint(colors[Math.floor((STAR_DURATION_MS - this.starTimer) / 100) % colors.length]);
    } else {
      this.alpha = 1;
      this.clearTint();
      if (this.maxJumps > 2) this.maxJumps = 2;
    }

    if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= delta;

    if (this.isDashing) {
      this.dashTimer -= delta;
      body.setVelocityX(this.dashDirection * DASH_SPEED);
      body.setVelocityY(0);
      body.setAllowGravity(false);
      this.dashTrailTimer -= delta;
      if (this.dashTrailTimer <= 0) {
        this.spawnDashTrail();
        this.dashTrailTimer = 40;
      }
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        body.setAllowGravity(true);
      }
      this.updateSprite();
      return;
    }

    body.setAllowGravity(true);

    if (onFloor) {
      this.coyoteTimer = COYOTE_TIME_MS;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
    }

    if (this.inputManager.jumpPressed) {
      this.jumpBufferTimer = JUMP_BUFFER_MS;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - delta);
    }

    if (this.inputManager.left) {
      body.setAccelerationX(-PLAYER_ACCEL);
      this.facing = -1;
    } else if (this.inputManager.right) {
      body.setAccelerationX(PLAYER_ACCEL);
      this.facing = 1;
    } else {
      body.setAccelerationX(0);
      if (onFloor) {
        body.setVelocityX(
          Phaser.Math.Linear(body.velocity.x, 0, PLAYER_FRICTION * (delta / 1000) / this.speed),
        );
      }
    }

    if (Math.abs(body.velocity.x) > this.speed) {
      body.setVelocityX(Math.sign(body.velocity.x) * this.speed);
    }

    if (onWall && body.velocity.y > 0) {
      body.setVelocityY(Math.min(body.velocity.y, WALL_SLIDE_SPEED));
    }

    if (this.jumpBufferTimer > 0) {
      if (this.coyoteTimer > 0) {
        this.doJump(false);
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
      } else if (onWall && wallDir !== 0) {
        this.doWallJump(wallDir);
        this.jumpBufferTimer = 0;
      } else if (!onFloor && this.jumpsRemaining > 0) {
        this.doJump(true);
        this.jumpBufferTimer = 0;
      }
    }

    if (!this.inputManager.jumpHeld && body.velocity.y < JUMP_CUT_VELOCITY) {
      body.setVelocityY(JUMP_CUT_VELOCITY);
    }

    if (this.inputManager.dashPressed && this.dashCooldownTimer <= 0) {
      this.startDash();
    }

    if (onFloor && !this.wasOnFloor && body.velocity.y >= 0) {
      spawnDust(this.scene, this.x, this.y + this.displayHeight / 2);
      squashStretch(this, 1.2, 0.8);
    }

    if (!onFloor && this.wasOnFloor && body.velocity.y < 0) {
      squashStretch(this, 0.85, 1.15, 80);
    }

    this.wasOnFloor = onFloor;
    if (onFloor && Math.abs(body.velocity.x) > 40) {
      this.runAnimTimer += delta;
      if (this.runAnimTimer > 120) {
        this.runAnimTimer = 0;
        this.runFrame = this.runFrame === 0 ? 1 : 0;
      }
    } else {
      this.runAnimTimer = 0;
      this.runFrame = 0;
    }
    this.updateSprite(onFloor && Math.abs(body.velocity.x) > 40);
  }

  private doJump(isDouble: boolean): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (isDouble) {
      body.setVelocityY(this.doubleJumpVelocity);
      this.jumpsRemaining -= 1;
      spawnSparkle(this.scene, this.x, this.y + this.displayHeight / 2);
      squashStretch(this, 0.9, 1.1, 60);
    } else {
      body.setVelocityY(this.jumpVelocity);
      this.jumpsRemaining = this.maxJumps - 1;
    }
    this.audio.playJump();
  }

  private doWallJump(wallDir: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(WALL_JUMP_VELOCITY_X * -wallDir, this.wallJumpVelocityY);
    this.facing = -wallDir;
    this.coyoteTimer = 0;
    this.jumpsRemaining = 1;
    this.audio.playJump();
  }

  private startDash(): void {
    this.isDashing = true;
    this.dashTimer = DASH_DURATION_MS;
    this.dashCooldownTimer = this.dashCooldown;
    this.dashDirection = this.facing;
    this.dashTrailTimer = 0;
    this.audio.playJump();
  }

  private spawnDashTrail(): void {
    const ghost = this.scene.add.image(this.x, this.y, this.texture.key);
    ghost.setFlipX(this.flipX);
    ghost.setAlpha(0.5);
    ghost.setTint(parseInt(this.character.accentColor.replace('#', ''), 16));
    ghost.setDepth(9);
    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 200,
      onComplete: () => ghost.destroy(),
    });
  }

  private updateSprite(isRunning = false): void {
    this.setFlipX(this.facing < 0);
    const stateKey =
      this.playerState === PlayerState.Small
        ? 'small'
        : this.playerState === PlayerState.Blaze
          ? 'blaze'
          : 'big';
    this.setTexture(
      getCharacterTextureKey(this.character.id, stateKey, isRunning, this.runFrame),
    );
  }

  applyStateSize(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const { stats } = this.character;
    const hitMult =
      this.playerState === PlayerState.Small ? stats.smallHitboxMult : stats.poweredHitboxMult;

    if (this.playerState === PlayerState.Small) {
      body.setSize(Math.round(18 * hitMult), Math.round(24 * hitMult));
      body.setOffset(Math.round(3 + (18 - 18 * hitMult) / 2), Math.round(2 + (24 - 24 * hitMult) / 2));
    } else {
      body.setSize(Math.round(18 * hitMult), Math.round(42 * hitMult));
      body.setOffset(Math.round(3 + (18 - 18 * hitMult) / 2), Math.round(4 + (42 - 42 * hitMult) / 2));
    }
    this.updateSprite();
  }

  powerUp(state: PlayerState): void {
    if (state === PlayerState.Big && this.playerState === PlayerState.Small) {
      this.playerState = PlayerState.Big;
      this.applyStateSize();
      this.audio.playPowerUp();
    } else if (state === PlayerState.Blaze) {
      this.playerState = PlayerState.Blaze;
      this.fireEnabled = true;
      this.applyStateSize();
      this.audio.playPowerUp();
    }
  }

  activateStar(): void {
    this.starTimer = STAR_DURATION_MS;
    this.maxJumps = 3;
    this.jumpsRemaining = Math.max(this.jumpsRemaining, 3);
    this.audio.playPowerUp();
  }

  takeDamage(): boolean {
    if (this.isInvincible || this.isDead) return false;

    if (this.playerState === PlayerState.Blaze) {
      this.playerState = PlayerState.Big;
      this.fireEnabled = false;
      this.applyStateSize();
      this.invincibleTimer = INVINCIBLE_FLASH_MS;
      this.audio.playHurt();
      return false;
    }

    if (this.playerState === PlayerState.Big) {
      this.playerState = PlayerState.Small;
      this.applyStateSize();
      this.invincibleTimer = INVINCIBLE_FLASH_MS;
      this.audio.playHurt();
      return false;
    }

    this.die();
    return true;
  }

  stompBounce(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(STOMP_BOUNCE);
    this.jumpsRemaining = this.maxJumps;
    squashStretch(this, 1.3, 0.7);
  }

  die(): void {
    if (this.isDead) return;
    this.isDead = true;
    this.audio.playDeath();
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, -300);
    body.setAllowGravity(true);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y - 20,
      duration: 800,
      onComplete: () => {
        this.scene.events.emit('player-died');
      },
    });
  }

  reset(x: number, y: number): void {
    this.isDead = false;
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.alpha = 1;
    this.clearTint();
    this.playerState = PlayerState.Small;
    this.fireEnabled = false;
    this.starTimer = 0;
    this.invincibleTimer = 0;
    this.isDashing = false;
    this.maxJumps = 2;
    this.jumpsRemaining = 2;
    this.applyStateSize();
  }
}
