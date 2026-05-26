import Phaser from 'phaser';
import {
  GAME_HEIGHT,
  GRAVITY,
  PlayerState,
  PowerUpType,
  TILE_SIZE,
} from '../config/constants';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { MovingPlatform } from '../entities/MovingPlatform';
import { Block } from '../objects/Block';
import { Coin } from '../objects/Coin';
import { PowerUp } from '../objects/PowerUp';
import { InputManager } from '../systems/InputManager';
import { AudioManager } from '../systems/AudioManager';
import { GameState } from '../systems/GameState';
import { GameBridge } from '../systems/GameBridge';
import { Storage } from '../systems/Storage';
import { LEVELS } from '../levels/levelData';
import { LevelBuilder } from '../levels/LevelBuilder';
import { screenShake, spawnDebris, spawnSparkle } from '../utils/effects';

export class GameScene extends Phaser.Scene {
  private inputManager!: InputManager;
  private audio!: AudioManager;
  private player!: Player;
  private enemies: Enemy[] = [];
  private coins: Coin[] = [];
  private blocks: Block[] = [];
  private projectiles: Projectile[] = [];
  private powerUps: PowerUp[] = [];
  private movingPlatforms: MovingPlatform[] = [];
  private levelIndex = 0;
  private levelData = LEVELS[0];
  private builtLevel!: ReturnType<typeof LevelBuilder.build>;
  private parallaxClouds!: Phaser.GameObjects.Image;
  private parallaxHills!: Phaser.GameObjects.Image;
  private parallaxMountains!: Phaser.GameObjects.Image;
  private levelComplete = false;
  private fireCooldown = 0;
  private cameraLookAhead = 0;
  private paused = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { levelIndex?: number }): void {
    this.levelIndex = data.levelIndex ?? GameState.currentLevel;
    this.levelData = LEVELS[this.levelIndex] ?? LEVELS[0];
    this.levelComplete = false;
    this.enemies = [];
    this.coins = [];
    this.blocks = [];
    this.projectiles = [];
    this.powerUps = [];
    this.movingPlatforms = [];
    this.cameraLookAhead = 0;
  }

  create(): void {
    this.inputManager = new InputManager(this);
    this.audio = new AudioManager(this);
    this.audio.setEnabled(Storage.getSoundEnabled());
    if (Storage.getSoundEnabled()) {
      this.audio.startGameMusic();
    }

    const unsubSound = GameBridge.on('sound-toggle', (data) => {
      const { enabled } = data as { enabled: boolean };
      this.audio.setEnabled(enabled);
      if (enabled && !this.paused) this.audio.startGameMusic();
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => unsubSound());

    GameBridge.setScreen('playing');

    this.add.image(0, 0, 'bg-sky').setOrigin(0).setScrollFactor(0);
    this.parallaxMountains = this.add
      .image(0, GAME_HEIGHT - 280, 'bg-mountains')
      .setOrigin(0)
      .setScrollFactor(0.15);
    this.parallaxClouds = this.add
      .image(0, 40, 'bg-clouds')
      .setOrigin(0)
      .setScrollFactor(0.25);
    this.parallaxHills = this.add
      .image(0, 380, 'bg-hills')
      .setOrigin(0)
      .setScrollFactor(0.45);

    this.builtLevel = LevelBuilder.build(this, this.levelData);
    this.blocks = this.builtLevel.blocks;
    this.enemies = LevelBuilder.spawnEnemies(this, this.levelData);
    this.enemies.forEach((e) => e.setGroundLayer(this.builtLevel.groundLayer));
    this.coins = LevelBuilder.spawnCoins(this, this.levelData);
    this.movingPlatforms = LevelBuilder.spawnMovingPlatforms(this, this.levelData);

    const startPos = Block.worldPos(this.levelData.playerStart.x, this.levelData.playerStart.y);
    this.player = new Player(this, startPos.x, startPos.y, this.inputManager, this.audio);

    this.physics.add.collider(this.player, this.builtLevel.groundLayer);
    this.physics.add.collider(this.player, this.builtLevel.oneWayLayer, undefined, this.processOneWay as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, this);
    this.physics.add.collider(this.player, this.movingPlatforms);
    this.physics.add.collider(this.enemies, this.builtLevel.groundLayer);
    this.physics.add.collider(this.enemies, this.builtLevel.oneWayLayer, undefined, this.processOneWay as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, this);
    this.physics.add.collider(this.enemies, this.movingPlatforms);
    this.physics.add.collider(this.powerUps, this.builtLevel.groundLayer);
    this.physics.add.collider(this.enemies, this.enemies);

    this.physics.add.overlap(this.player, this.coins, (_p, c) => {
      (c as Coin).collect(this.audio);
    });

    this.physics.add.overlap(this.player, this.powerUps, (_p, pu) => {
      this.collectPowerUp(pu as PowerUp);
    });

    this.physics.add.overlap(this.player, this.enemies, (_p, e) => {
      this.handleEnemyCollision(e as Enemy);
    });

    this.physics.add.overlap(this.projectiles, this.enemies, (proj, e) => {
      (proj as Projectile).deactivate();
      (e as Enemy).defeat();
      GameState.addScore(200);
      this.audio.playStomp();
      screenShake(this, 3, 80);
    });

    this.physics.add.overlap(this.projectiles, this.builtLevel.groundLayer, (proj) => {
      (proj as Projectile).deactivate();
    });

    this.physics.add.overlap(this.enemies, this.enemies, (a, b) => {
      const ea = a as Enemy;
      const eb = b as Enemy;
      if (ea.isShell && Math.abs((ea.body as Phaser.Physics.Arcade.Body).velocity.x) > 50) {
        eb.defeat();
        GameState.addScore(200);
      } else if (eb.isShell && Math.abs((eb.body as Phaser.Physics.Arcade.Body).velocity.x) > 50) {
        ea.defeat();
        GameState.addScore(200);
      }
    });

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.builtLevel.width * TILE_SIZE, this.builtLevel.height * TILE_SIZE + 200);
    cam.roundPixels = true;
    cam.startFollow(this.player, true, 0.12, 0.08);
    cam.setDeadzone(100, 60);

    this.events.on('player-died', () => this.handlePlayerDeath());
    this.events.on('toggle-pause', () => this.togglePause());
    this.events.on('resume-game', () => this.resumeGame());
    this.events.on('restart-level', () => this.restartLevel());
    this.physics.world.gravity.y = GRAVITY;
    this.syncHud();
  }

  private togglePause(): void {
    if (this.levelComplete) return;
    if (this.paused) {
      this.resumeGame();
    } else {
      this.paused = true;
      this.physics.pause();
      this.player.setVelocity(0, 0);
      GameBridge.setScreen('paused');
    }
  }

  private resumeGame(): void {
    if (!this.paused) return;
    this.paused = false;
    this.physics.resume();
    GameBridge.setScreen('playing');
  }

  private restartLevel(): void {
    this.paused = false;
    this.physics.resume();
    GameState.combo = 0;
    GameState.comboTimer = 0;
    this.scene.restart({ levelIndex: this.levelIndex });
  }

  private syncHud(): void {
    GameBridge.updateHud({
      score: GameState.score,
      coins: GameState.coins,
      lives: GameState.lives,
      world: this.levelData.name,
      combo: GameState.combo,
      comboMultiplier: GameState.comboMultiplier,
      levelIndex: this.levelIndex,
      totalLevels: LEVELS.length,
      highScore: GameState.highScore,
    });
  }

  private processOneWay(object1: unknown, object2: unknown): boolean {
    const player = object1 as Phaser.Types.Physics.Arcade.GameObjectWithBody;
    const tile = object2 as Phaser.Types.Physics.Arcade.GameObjectWithBody;
    const pb = player.body as Phaser.Physics.Arcade.Body;
    const tb = tile.body as Phaser.Physics.Arcade.Body;
    return pb.velocity.y >= 0 && pb.bottom <= tb.top + 10;
  }

  update(_time: number, delta: number): void {
    if (this.levelComplete) return;

    if (this.inputManager.pausePressed) {
      this.togglePause();
      return;
    }

    if (this.paused) return;

    this.player.update(_time, delta);
    this.enemies.forEach((e) => e.update(_time, delta));
    this.movingPlatforms.forEach((p) => {
      p.update(_time, delta);
      p.carryPlayer(this.player);
    });

    GameState.updateCombo(delta);

    if (this.fireCooldown > 0) this.fireCooldown -= delta;
    if (this.inputManager.firePressed && this.player.canFire && this.fireCooldown <= 0) {
      this.fireProjectile();
      this.fireCooldown = 300;
    }

    this.checkBlockHits();
    this.checkGoal();
    this.checkPitDeath();
    this.updateCamera();
    this.syncHud();

    const cam = this.cameras.main;
    this.parallaxMountains.x = Math.round(cam.scrollX * 0.15);
    this.parallaxClouds.x = Math.round(cam.scrollX * 0.25);
    this.parallaxHills.x = Math.round(cam.scrollX * 0.45);
  }

  private updateCamera(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const targetLook = Math.sign(body.velocity.x) * 80;
    this.cameraLookAhead = Phaser.Math.Linear(this.cameraLookAhead, targetLook, 0.05);
    this.cameras.main.setFollowOffset(this.cameraLookAhead, 0);
  }

  private checkBlockHits(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (!body.touching.up && !body.blocked.up) return;

    const headY = body.top;
    for (const block of this.blocks) {
      if (!block.active) continue;
      const bb = block.body as Phaser.Physics.Arcade.Body;
      if (Math.abs(bb.bottom - headY) > 8) continue;
      if (Math.abs(block.x - this.player.x) > TILE_SIZE) continue;

      if (block.hitFromBelow()) {
        this.audio.playBreak();
        screenShake(this, 2, 60);

        if (block.blockKind === 'brick') {
          if (this.player.playerState !== PlayerState.Small) {
            spawnDebris(this, block.x, block.y);
            block.break();
          }
        } else if (block.isUsed || block.hiddenRevealed) {
          this.spawnBlockContents(block);
        }
      }
    }
  }

  private spawnBlockContents(block: Block): void {
    if (block.contents === 'coin') {
      const coin = new Coin(this, block.x, block.y - 20);
      this.coins.push(coin);
      this.physics.add.overlap(this.player, coin, () => coin.collect(this.audio));
      coin.collect(this.audio);
    } else {
      const pu = new PowerUp(this, block.x, block.y - 20, block.contents);
      this.powerUps.push(pu);
      this.physics.add.overlap(this.player, pu, () => this.collectPowerUp(pu));
      this.physics.add.collider(pu, this.builtLevel.groundLayer);
    }
  }

  private collectPowerUp(pu: PowerUp): void {
    if (pu.collected) return;
    pu.collect();

    if (pu.powerType === PowerUpType.Spark) {
      this.player.powerUp(PlayerState.Big);
    } else if (pu.powerType === PowerUpType.Blaze) {
      this.player.powerUp(PlayerState.Blaze);
    } else if (pu.powerType === PowerUpType.Star) {
      this.player.activateStar();
    }

    spawnSparkle(this, pu.x, pu.y);
    GameState.addScore(1000);
  }

  private handleEnemyCollision(enemy: Enemy): void {
    const result = enemy.handlePlayerCollision(this.player);
    if (result === 'stomp') {
      enemy.stomp();
      this.player.stompBounce();
      this.audio.playStomp();
      screenShake(this, 4, 100);
      GameState.addStomp();
    } else if (result === 'hurt') {
      const damaged = this.player.takeDamage();
      if (!damaged) {
        screenShake(this, 6, 150);
        const pb = this.player.body as Phaser.Physics.Arcade.Body;
        pb.setVelocityX(enemy.x < this.player.x ? 200 : -200);
      }
    }
  }

  private fireProjectile(): void {
    const dir = this.player.flipX ? -1 : 1;
    const proj = new Projectile(this, this.player.x + dir * 16, this.player.y, dir);
    this.projectiles.push(proj);
    this.audio.playFire();
  }

  private checkGoal(): void {
    const goalX = this.levelData.goalX * TILE_SIZE;
    if (this.player.x >= goalX && !this.levelComplete) {
      this.levelComplete = true;
      this.audio.playWin();
      this.physics.pause();
      this.player.setVelocity(0, 0);
      GameBridge.setScreen('level-clear');

      this.time.delayedCall(2500, () => {
        GameState.nextLevel();
        if (GameState.currentLevel >= LEVELS.length) {
          const { highScore, isNewRecord } = GameState.recordHighScore();
          this.audio.stopMusic();
          GameBridge.setScreen('game-over', {
            won: true,
            score: GameState.score,
            highScore,
            isNewRecord,
          });
          this.scene.stop();
        } else {
          this.scene.restart({ levelIndex: GameState.currentLevel });
        }
      });
    }
  }

  private checkPitDeath(): void {
    if (this.player.y > this.builtLevel.height * TILE_SIZE + 64) {
      this.player.die();
    }
  }

  private handlePlayerDeath(): void {
    this.time.delayedCall(1000, () => {
      const gameOver = GameState.loseLife();
      if (gameOver) {
        const { highScore, isNewRecord } = GameState.recordHighScore();
        this.audio.stopMusic();
        GameBridge.setScreen('game-over', {
          won: false,
          score: GameState.score,
          highScore,
          isNewRecord,
        });
        this.scene.stop();
      } else {
        this.scene.restart({ levelIndex: this.levelIndex });
      }
    });
  }
}
