import Phaser from 'phaser';
import {
  GAME_HEIGHT,
  GRAVITY,
  PlayerState,
  PowerUpType,
  SPRING_BOUNCE_VELOCITY,
  TILE_SIZE,
} from '../config/constants';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { MovingPlatform } from '../entities/MovingPlatform';
import { Block } from '../objects/Block';
import { Coin } from '../objects/Coin';
import { PowerUp } from '../objects/PowerUp';
import { Pipe } from '../objects/Pipe';
import { InputManager } from '../systems/InputManager';
import { AudioManager } from '../systems/AudioManager';
import { GameState } from '../systems/GameState';
import { GameBridge } from '../systems/GameBridge';
import { Storage } from '../systems/Storage';
import { EasterEggs } from '../systems/EasterEggs';
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
  private pipes: Pipe[] = [];
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
  private flagSliding = false;
  private fireCooldown = 0;
  private cameraLookAhead = 0;
  private paused = false;
  private secretMessage?: Phaser.GameObjects.Text;
  private pipeWarping = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { levelIndex?: number }): void {
    this.levelIndex = data.levelIndex ?? GameState.currentLevel;
    this.levelData = LEVELS[this.levelIndex] ?? LEVELS[0];
    this.levelComplete = false;
    this.flagSliding = false;
    this.pipeWarping = false;
    this.enemies = [];
    this.coins = [];
    this.blocks = [];
    this.pipes = [];
    this.projectiles = [];
    this.powerUps = [];
    this.movingPlatforms = [];
    this.cameraLookAhead = 0;
    GameState.resetTimer(this.levelData.timeLimit ?? undefined);
  }

  create(): void {
    this.inputManager = new InputManager(this);
    this.audio = new AudioManager(this);
    this.audio.setEnabled(Storage.getSoundEnabled());
    if (Storage.getSoundEnabled()) {
      this.audio.startGameMusic(this.levelData.theme);
    }

    const unsubSound = GameBridge.on('sound-toggle', (data) => {
      const { enabled } = data as { enabled: boolean };
      this.audio.setEnabled(enabled);
      if (enabled && !this.paused) this.audio.startGameMusic(this.levelData.theme);
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => unsubSound());

    GameBridge.setScreen('playing');
    this.applyThemeBackground();

    this.builtLevel = LevelBuilder.build(this, this.levelData);
    this.blocks = this.builtLevel.blocks;
    this.pipes = this.builtLevel.pipes;
    this.enemies = LevelBuilder.spawnEnemies(this, this.levelData);
    this.enemies.forEach((e) => e.setGroundLayer(this.builtLevel.groundLayer));
    this.coins = LevelBuilder.spawnCoins(this, this.levelData);
    this.movingPlatforms = LevelBuilder.spawnMovingPlatforms(this, this.levelData);

    const startPos = Block.worldPos(this.levelData.playerStart.x, this.levelData.playerStart.y);
    this.player = new Player(this, startPos.x, startPos.y, this.inputManager, this.audio);

    this.physics.add.collider(this.player, this.builtLevel.groundLayer);
    this.physics.add.collider(
      this.player,
      this.builtLevel.oneWayLayer,
      undefined,
      this.processOneWay as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      this,
    );
    this.physics.add.collider(this.player, this.movingPlatforms);
    this.physics.add.collider(this.enemies, this.builtLevel.groundLayer);
    this.physics.add.collider(
      this.enemies,
      this.builtLevel.oneWayLayer,
      undefined,
      this.processOneWay as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      this,
    );
    this.physics.add.collider(this.enemies, this.movingPlatforms);
    this.physics.add.collider(this.powerUps, this.builtLevel.groundLayer);
    this.physics.add.collider(this.enemies, this.enemies);

    this.physics.add.overlap(this.player, this.coins, (_p, c) => {
      const gotLife = (c as Coin).collect(this.audio);
      if (gotLife) this.audio.playOneUp();
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

  private applyThemeBackground(): void {
    const theme = this.levelData.theme;
    const skyColor =
      theme === 'underground' ? 0x1a1a2e : theme === 'castle' ? 0x2a1a1a : theme === 'sky' ? 0x87ceeb : 0x5bc0eb;

    this.add.image(0, 0, 'bg-sky').setOrigin(0).setScrollFactor(0).setTint(
      theme === 'underground' ? 0x333355 : theme === 'castle' ? 0x553333 : 0xffffff,
    );

    this.parallaxMountains = this.add
      .image(0, GAME_HEIGHT - 280, 'bg-mountains')
      .setOrigin(0)
      .setScrollFactor(0.15)
      .setAlpha(theme === 'sky' ? 0.3 : 0.7);

    this.parallaxClouds = this.add
      .image(0, 40, 'bg-clouds')
      .setOrigin(0)
      .setScrollFactor(0.25)
      .setAlpha(theme === 'underground' || theme === 'castle' ? 0.2 : 1);

    this.parallaxHills = this.add
      .image(0, 380, 'bg-hills')
      .setOrigin(0)
      .setScrollFactor(0.45)
      .setAlpha(theme === 'underground' ? 0.3 : 0.8);

    this.cameras.main.setBackgroundColor(skyColor);
  }

  private togglePause(): void {
    if (this.levelComplete || this.flagSliding) return;
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
      totalLevels: LEVELS.filter((l) => !l.secret).length,
      highScore: GameState.highScore,
      timeLeft: Math.ceil(GameState.timeLeft),
      levelBonus: GameState.lastLevelBonus || undefined,
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
    if (this.levelComplete && !this.flagSliding) return;

    if (this.inputManager.pausePressed) {
      this.togglePause();
      return;
    }

    if (this.paused || this.pipeWarping) return;

    if (this.flagSliding) {
      this.updateFlagSlide(delta);
      return;
    }

    this.player.update(_time, delta);
    this.enemies.forEach((e) => e.update(_time, delta, this.player.x));
    this.movingPlatforms.forEach((p) => {
      p.update(_time, delta);
      p.carryPlayer(this.player);
    });
    this.blocks.forEach((b) => b.updateCooldown(delta));

    GameState.updateCombo(delta);

    if (GameState.tickTimer(delta)) {
      this.player.die();
      return;
    }

    if (this.fireCooldown > 0) this.fireCooldown -= delta;
    if (this.inputManager.firePressed && this.player.canFire && this.fireCooldown <= 0) {
      this.fireProjectile();
      this.fireCooldown = 300;
    }

    this.checkBlockHits();
    this.checkPipes();
    this.checkGoal();
    this.checkPitDeath();
    this.checkEasterEggs();
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

      if (block.blockKind === 'spring') {
        block.hitFromBelow();
        body.setVelocityY(SPRING_BOUNCE_VELOCITY);
        this.audio.playJump();
        screenShake(this, 3, 80);
        continue;
      }

      if (block.hitFromBelow()) {
        this.audio.playBreak();
        screenShake(this, 2, 60);

        if (block.blockKind === 'coin-block') {
          this.spawnCoinFromBlock(block);
        } else if (block.blockKind === 'brick') {
          if (this.player.playerState !== PlayerState.Small) {
            spawnDebris(this, block.x, block.y);
            block.break();
            GameState.addScore(50);
          }
        } else if (block.isUsed || block.hiddenRevealed) {
          this.spawnBlockContents(block);
          if (block.blockKind === 'hidden' && block.contents === PowerUpType.OneUp) {
            EasterEggs.unlock('hidden-1up');
          }
        }
      }
    }
  }

  private spawnCoinFromBlock(block: Block): void {
    const coin = new Coin(this, block.x, block.y - 20);
    this.coins.push(coin);
    this.physics.add.overlap(this.player, coin, () => {
      const gotLife = coin.collect(this.audio);
      if (gotLife) this.audio.playOneUp();
    });
    coin.collect(this.audio);
  }

  private spawnBlockContents(block: Block): void {
    if (block.contents === 'coin') {
      const coin = new Coin(this, block.x, block.y - 20);
      this.coins.push(coin);
      this.physics.add.overlap(this.player, coin, () => {
        const gotLife = coin.collect(this.audio);
        if (gotLife) this.audio.playOneUp();
      });
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
    } else if (pu.powerType === PowerUpType.OneUp) {
      GameState.addLife();
      this.audio.playOneUp();
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

  private checkPipes(): void {
    if (this.pipeWarping) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const movingDown = this.inputManager.down && body.blocked.down;

    for (const pipe of this.pipes) {
      if (pipe.canEnter(this.player.x, this.player.y, movingDown)) {
        this.warpThroughPipe(pipe);
        break;
      }
    }
  }

  private warpThroughPipe(pipe: Pipe): void {
    this.pipeWarping = true;
    this.audio.playPipe();
    pipe.setCooldown(1500);

    this.tweens.add({
      targets: this.player,
      y: this.player.y + TILE_SIZE,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        const exit = Block.worldPos(pipe.config.exitX, pipe.config.exitY);
        this.player.setPosition(exit.x, exit.y);
        this.player.setVelocity(0, 0);
        this.tweens.add({
          targets: this.player,
          y: exit.y - TILE_SIZE,
          alpha: 1,
          duration: 300,
          onComplete: () => {
            this.pipeWarping = false;
            if (pipe.config.secret) {
              EasterEggs.unlock('secret-pipe');
              if (EasterEggs.unlockSecretLevel()) {
                this.showSecretToast('Secret level unlocked!');
                this.audio.playSecret();
              }
            }
          },
        });
      },
    });
  }

  private checkGoal(): void {
    const goalX = this.levelData.goalX * TILE_SIZE;
    if (this.player.x >= goalX - TILE_SIZE && !this.levelComplete) {
      this.startFlagSlide();
    }
  }

  private startFlagSlide(): void {
    this.levelComplete = true;
    this.flagSliding = true;
    this.audio.playFlag();

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAllowGravity(false);

    const poleTop = this.builtLevel.flagPositions[0]?.y ?? this.player.y - 200;
    GameState.addFlagBonus(this.player.y, poleTop);

    this.tweens.add({
      targets: this.player,
      y: this.builtLevel.height * TILE_SIZE - 48,
      duration: 1200,
      ease: 'Quad.easeIn',
      onComplete: () => this.finishLevel(),
    });
  }

  private updateFlagSlide(_delta: number): void {
    /* tween handles slide */
  }

  private finishLevel(): void {
    this.flagSliding = false;
    this.audio.playWin();
    this.physics.pause();
    GameBridge.setScreen('level-clear');

    this.time.delayedCall(2500, () => {
      GameState.nextLevel();
      const playableCount = LEVELS.filter((l) => !l.secret).length;
      if (GameState.currentLevel >= playableCount) {
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

  private checkPitDeath(): void {
    if (this.player.y > this.builtLevel.height * TILE_SIZE + 64) {
      this.player.die();
    }
  }

  private checkEasterEggs(): void {
    if (this.levelData.devMessageTile && !this.secretMessage) {
      const tile = this.levelData.devMessageTile;
      const pos = Block.worldPos(tile.x, tile.y);
      if (Math.abs(this.player.x - pos.x) < TILE_SIZE && Math.abs(this.player.y - pos.y) < TILE_SIZE * 2) {
        if (EasterEggs.unlock('dev-message')) {
          this.secretMessage = this.add.text(this.player.x, this.player.y - 60, 'Made with ❤️ by Eashan', {
            fontSize: '14px',
            color: '#ffff00',
            backgroundColor: '#000000aa',
            padding: { x: 8, y: 4 },
          });
          this.secretMessage.setDepth(20);
          this.audio.playSecret();
          this.time.delayedCall(3000, () => this.secretMessage?.destroy());
        }
      }
    }

    const goalX = this.levelData.goalX * TILE_SIZE;
    const poleTop = this.builtLevel.flagPositions[0]?.y ?? 0;
    if (this.player.x >= goalX - TILE_SIZE * 2 && this.player.y < poleTop + TILE_SIZE) {
      if (EasterEggs.unlock('flag-top')) {
        GameState.addScore(5000);
        this.showSecretToast('Flag top bonus!');
        this.audio.playSecret();
      }
    }

    if (GameState.score >= 10000 && EasterEggs.unlock('score-10k')) {
      this.showSecretToast('Score master!');
    }
  }

  private showSecretToast(msg: string): void {
    const toast = this.add.text(this.cameras.main.scrollX + 400, 80, msg, {
      fontSize: '16px',
      color: '#00ff88',
      backgroundColor: '#000000cc',
      padding: { x: 12, y: 6 },
    });
    toast.setScrollFactor(0);
    toast.setDepth(100);
    this.time.delayedCall(2500, () => toast.destroy());
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
