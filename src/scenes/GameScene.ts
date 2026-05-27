import Phaser from 'phaser';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
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
import type { Flagpole } from '../objects/Flagpole';
import { InputManager } from '../systems/InputManager';
import { AudioManager } from '../systems/AudioManager';
import { GameState } from '../systems/GameState';
import { GameBridge } from '../systems/GameBridge';
import { Storage } from '../systems/Storage';
import { EasterEggs } from '../systems/EasterEggs';
import { Missions } from '../systems/missions';
import { Achievements } from '../systems/achievements';
import {
  getTodayChallenge,
  getModifierGravityMult,
  isDailyCompleted,
  markDailyCompleted,
  type DailyModifier,
} from '../systems/dailyChallenge';
import {
  getGameModeRules,
  getBossRushLevelIndices,
  getCoinRushLevelIndex,
  type GameModeId,
} from '../systems/gameModes';
import { LEVELS } from '../levels/levelData';
import { LevelBuilder } from '../levels/LevelBuilder';
import { Checkpoint } from '../objects/Checkpoint';
import { QuestSign } from '../objects/QuestSign';
import { screenShake, spawnDebris, spawnSparkle, freezeFrame, spawnComboText, spawnPipeWarp, spawnSpringBurst, spawnFireImpact, squashStretch, spawnCoinShower } from '../utils/effects';
import { texturesReady } from '../utils/textureLifecycle';

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
  private characterId = Storage.getSelectedCharacter();
  private levelData = LEVELS[0];
  private builtLevel!: ReturnType<typeof LevelBuilder.build>;
  private parallaxClouds!: Phaser.GameObjects.Image;
  private parallaxHills!: Phaser.GameObjects.Image;
  private parallaxMountains!: Phaser.GameObjects.Image;
  private levelComplete = false;
  private flagSliding = false;
  private flagpole!: Flagpole;
  private flagTouchY = 0;
  private fireCooldown = 0;
  private cameraLookAhead = 0;
  private paused = false;
  private cabinetBonusUsed = false;
  private secretMessage?: Phaser.GameObjects.Text;
  private pipeWarping = false;
  private checkpoints: Checkpoint[] = [];
  private questSigns: QuestSign[] = [];
  private dailyModifier?: DailyModifier;
  private hiddenRoomEntered = false;
  private sideQuestPopup?: Phaser.GameObjects.Text;
  private prevDashPressed = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: {
    levelIndex?: number;
    characterId?: string;
    gameMode?: GameModeId;
    dailyChallenge?: boolean;
  }): void {
    if (data.gameMode) {
      GameState.gameMode = data.gameMode;
      Storage.setGameMode(data.gameMode);
    } else {
      GameState.gameMode = Storage.getGameMode();
    }
    GameState.isDailyChallenge = data.dailyChallenge ?? false;

    const rules = getGameModeRules(GameState.gameMode);
    if (GameState.gameMode === 'bossRush') {
      this.levelIndex = getBossRushLevelIndices()[0] ?? 7;
    } else if (GameState.gameMode === 'coinRush') {
      this.levelIndex = getCoinRushLevelIndex(Date.now());
      GameState.coinRushTimeLeft = rules.coinRushDuration;
    } else if (GameState.isDailyChallenge) {
      this.levelIndex = getTodayChallenge().levelIndex;
      this.dailyModifier = getTodayChallenge().modifier;
    } else {
      this.levelIndex = data.levelIndex ?? GameState.currentLevel;
    }

    this.characterId = data.characterId ?? Storage.getSelectedCharacter();
    this.levelData = LEVELS[this.levelIndex] ?? LEVELS[0];
    this.levelComplete = false;
    this.flagSliding = false;
    this.paused = false;
    this.pipeWarping = false;
    this.hiddenRoomEntered = false;
    this.enemies = [];
    this.coins = [];
    this.blocks = [];
    this.pipes = [];
    this.projectiles = [];
    this.powerUps = [];
    this.movingPlatforms = [];
    this.checkpoints = [];
    this.questSigns = [];
    this.cameraLookAhead = 0;
    this.cabinetBonusUsed = false;
    this.prevDashPressed = false;
    this.dailyModifier = GameState.isDailyChallenge ? getTodayChallenge().modifier : this.dailyModifier;

    Missions.resetLevelTracking();
    EasterEggs.resetLevelTracking();
    GameState.clearCheckpoint();
    GameState.levelDamageTaken = false;
    GameState.dashCount = 0;

    if (rules.coinRushDuration > 0 && GameState.gameMode === 'coinRush') {
      GameState.resetTimer(rules.coinRushDuration);
    } else {
      GameState.resetTimer(this.levelData.timeLimit ?? undefined);
    }
    if (rules.showSpeedrunTimer && GameState.speedrunStartMs === 0) {
      GameState.startSpeedrunTimer();
    }
  }

  create(): void {
    this.resetRuntimeState();

    if (!texturesReady(this)) {
      this.failLevelBuild('Game textures are missing — refresh the page or return to the menu');
      return;
    }

    if (this.levelIndex < 0 || this.levelIndex >= LEVELS.length) {
      console.error('[GameScene] level index out of bounds', this.levelIndex);
      this.levelIndex = 0;
      this.levelData = LEVELS[0];
      GameState.currentLevel = 0;
    }

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

    try {
      this.builtLevel = LevelBuilder.build(this, this.levelData);
      if (!this.validateLevelBuild()) {
        this.failLevelBuild(`Level "${this.levelData.name}" failed to build`);
        return;
      }
    } catch (error) {
      console.error('[GameScene] LevelBuilder.build failed', error);
      this.failLevelBuild(`Level "${this.levelData.name}" failed to build`);
      return;
    }

    this.flagpole = this.builtLevel.flagpole;
    this.blocks = this.builtLevel.blocks;
    this.pipes = this.builtLevel.pipes;
    this.enemies = LevelBuilder.spawnEnemies(this, this.levelData);
    this.enemies.forEach((e) => e.setGroundLayer(this.builtLevel.groundLayer));
    this.coins = LevelBuilder.spawnCoins(this, this.levelData);
    this.movingPlatforms = LevelBuilder.spawnMovingPlatforms(this, this.levelData);
    this.checkpoints = LevelBuilder.spawnCheckpoints(this, this.levelData);
    this.questSigns = LevelBuilder.spawnQuestSigns(this, this.levelData);

    const startPos = Block.worldPos(this.levelData.playerStart.x, this.levelData.playerStart.y);
    this.player = new Player(this, startPos.x, startPos.y, this.inputManager, this.audio, this.characterId);

    if (this.levelData.hiddenRoom) {
      this.levelData.hiddenRoom.bonusCoins.forEach((c) => {
        const { x, y } = Block.worldPos(c.x, c.y);
        const coin = new Coin(this, x, y);
        this.coins.push(coin);
      });
    }

    this.applyDailyModifiers();

    this.checkpoints.forEach((cp) => {
      this.physics.add.overlap(this.player, cp.getZone(), () => cp.activate(this.audio));
    });

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
      Missions.onCoinCollected();
      if (Storage.getTotalCoinsCollected() >= 100 && Achievements.unlock('coins-100')) {
        this.emitAchievement('coins-100', 'Centurion', '🪙');
      }
    });

    this.physics.add.overlap(this.player, this.powerUps, (_p, pu) => {
      this.collectPowerUp(pu as PowerUp);
    });

    this.physics.add.overlap(this.player, this.enemies, (_p, e) => {
      if (this.flagSliding) return;
      this.handleEnemyCollision(e as Enemy);
    });

    this.physics.add.overlap(this.player, this.flagpole.triggerZone, () => {
      if (!this.levelComplete && !this.flagSliding) {
        this.startFlagSequence();
      }
    });

    this.physics.add.overlap(this.projectiles, this.enemies, (proj, e) => {
      const projectile = proj as Projectile;
      spawnFireImpact(this, projectile.x, projectile.y);
      projectile.deactivate();
      (e as Enemy).defeat();
      GameState.addScore(200);
      this.audio.playStomp();
      screenShake(this, 3, 80);
    });

    this.physics.add.overlap(this.projectiles, this.builtLevel.groundLayer, (proj) => {
      const projectile = proj as Projectile;
      spawnFireImpact(this, projectile.x, projectile.y);
      projectile.deactivate();
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
    cam.stopFollow();
    cam.setScroll(0, 0);
    cam.startFollow(this.player, true, 0.12, 0.08);
    cam.setDeadzone(100, 60);

    this.bindSceneEvents();
    this.physics.world.gravity.y = GRAVITY;
    this.syncHud();
  }

  private resetRuntimeState(): void {
    this.paused = false;
    this.physics.resume();
    this.time.timeScale = 1;
    const cam = this.cameras.main;
    cam.stopFollow();
    cam.setScroll(0, 0);
  }

  private validateLevelBuild(): boolean {
    const groundCount = this.builtLevel.groundLayer.getLength();
    const tileCount = this.builtLevel.tileSprites.length;
    if (groundCount === 0 && tileCount === 0) {
      console.error('[GameScene] level has no ground or tile sprites', this.levelData.name);
      return false;
    }
    return true;
  }

  private failLevelBuild(message: string): void {
    console.error('[GameScene]', message, { levelIndex: this.levelIndex, level: this.levelData?.name });
    GameBridge.setScreen('menu', { levelError: message });
    this.scene.stop();
  }

  private bindSceneEvents(): void {
    this.events.off('player-died');
    this.events.off('toggle-pause');
    this.events.off('resume-game');
    this.events.off('restart-level');
    this.events.off('change-character');
    this.events.off('cabinet-bonus-score');

    this.events.on('player-died', () => this.handlePlayerDeath());
    this.events.on('toggle-pause', () => this.togglePause());
    this.events.on('resume-game', () => this.resumeGame());
    this.events.on('restart-level', () => this.restartLevel());
    this.events.on('change-character', () => {
      this.characterId = Storage.getSelectedCharacter();
      if (this.paused) {
        this.restartLevel();
      }
    });
    this.events.on('cabinet-bonus-score', () => this.applyCabinetBonus());
  }

  private applyDailyModifiers(): void {
    const mod = this.dailyModifier ?? (GameState.isDailyChallenge ? getTodayChallenge().modifier : undefined);
    if (!mod) return;

    if (mod === 'low_gravity') {
      this.physics.world.gravity.y = GRAVITY * getModifierGravityMult(mod);
    }
    if (mod === 'double_enemies') {
      const extras = LevelBuilder.spawnEnemies(this, this.levelData);
      extras.forEach((e) => {
        e.setPosition(e.x + Phaser.Math.Between(-20, 20), e.y);
        e.setGroundLayer(this.builtLevel.groundLayer);
        this.enemies.push(e);
        this.physics.add.collider(e, this.builtLevel.groundLayer);
        this.physics.add.collider(e, this.movingPlatforms);
        this.physics.add.overlap(this.player, e, (_p, enemy) => {
          if (this.flagSliding) return;
          this.handleEnemyCollision(enemy as Enemy);
        });
      });
    }
    if (mod === 'fog') {
      this.add
        .rectangle(0, 0, GAME_WIDTH * 3, GAME_HEIGHT * 2, 0x000000, 0.45)
        .setScrollFactor(0)
        .setDepth(90)
        .setOrigin(0);
    }
    if (mod === 'coin_frenzy') {
      this.levelData.coins.slice(0, 6).forEach((c) => {
        const { x, y } = Block.worldPos(c.x + 1, c.y);
        const coin = new Coin(this, x, y);
        this.coins.push(coin);
        this.physics.add.overlap(this.player, coin, () => {
          coin.collect(this.audio);
          Missions.onCoinCollected();
        });
      });
    }
  }

  private emitAchievement(id: string, title: string, icon: string): void {
    GameBridge.emit('achievement-unlock', { id, title, icon });
  }

  private emitMissionComplete(title: string, rewardScore: number): void {
    GameState.addScore(rewardScore);
    spawnCoinShower(this, this.player.x, this.player.y - 40);
    this.audio.playWin();
    GameBridge.emit('mission-complete', { title, rewardScore });
  }

  private applyThemeBackground(): void {
    const theme = this.levelData.theme;
    const skyColor =
      theme === 'underground' ? 0x1a1a2e : theme === 'castle' ? 0x2a1a1a : theme === 'sky' ? 0x87ceeb : 0x5bc0eb;

    this.add.image(0, 0, 'bg-sky').setOrigin(0).setScrollFactor(0).setTint(
      theme === 'underground' ? 0x333355 : theme === 'castle' ? 0x553333 : 0xffffff,
    );

    this.parallaxMountains = this.add
      .image(0, GAME_HEIGHT - 200, 'bg-mountains')
      .setOrigin(0, 1)
      .setScrollFactor(0.12)
      .setAlpha(theme === 'sky' ? 0.35 : theme === 'underground' ? 0.2 : 0.75)
      .setTint(theme === 'underground' ? 0x332244 : theme === 'castle' ? 0x553333 : 0xffffff);

    this.parallaxClouds = this.add
      .image(0, 24, 'bg-clouds')
      .setOrigin(0)
      .setScrollFactor(0.2)
      .setAlpha(theme === 'underground' || theme === 'castle' ? 0.08 : theme === 'sky' ? 1 : 0.85);

    this.parallaxHills = this.add
      .image(0, GAME_HEIGHT - 8, 'bg-hills')
      .setOrigin(0, 1)
      .setScrollFactor(0.38)
      .setAlpha(theme === 'underground' ? 0.15 : theme === 'castle' ? 0.35 : 0.9)
      .setTint(theme === 'underground' ? 0x224422 : theme === 'castle' ? 0x444444 : 0xffffff);

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

  private applyCabinetBonus(): void {
    if (this.cabinetBonusUsed || this.paused || this.levelComplete) return;
    this.cabinetBonusUsed = true;
    GameState.addScore(100);
    this.syncHud();
  }

  private restartLevel(): void {
    this.paused = false;
    this.cabinetBonusUsed = false;
    this.physics.resume();
    GameState.combo = 0;
    GameState.comboTimer = 0;
    this.scene.restart({ levelIndex: this.levelIndex, characterId: this.characterId });
  }

  private syncHud(): void {
    const rules = getGameModeRules(GameState.gameMode);
    GameState.tickSpeedrun();
    GameBridge.updateHud({
      score: GameState.score,
      coins: GameState.coins,
      lives: GameState.lives,
      world: this.levelData.name,
      characterName: this.player.characterName,
      combo: GameState.combo,
      comboMultiplier: GameState.comboMultiplier,
      levelIndex: this.levelIndex,
      totalLevels: LEVELS.filter((l) => !l.secret).length,
      highScore: GameState.highScore,
      timeLeft: Math.ceil(GameState.timeLeft),
      levelBonus: GameState.lastLevelBonus || undefined,
      canFire: this.player?.canFire ?? false,
      gameMode: GameState.gameMode,
      speedrunElapsed: rules.showSpeedrunTimer ? Math.floor(GameState.speedrunElapsedMs / 1000) : undefined,
      speedrunGhost: rules.trackSpeedrunGhost ? Math.floor(Storage.getSpeedrunGhost() / 1000) : undefined,
      coinRushTime: rules.showCoinRushTimer ? Math.ceil(GameState.timeLeft) : undefined,
      missions: Missions.getActiveMissions(),
      checkpointActive: GameState.hasCheckpoint,
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
    this.coins.forEach((c) => c.updateSpin(delta));

    GameState.updateCombo(delta);
    Missions.onComboUpdate(GameState.combo);

    if (this.inputManager.dashPressed && !this.prevDashPressed) {
      GameState.dashCount += 1;
      Missions.onDash();
    }
    this.prevDashPressed = this.inputManager.dashPressed;

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
    this.checkQuestSigns();
    this.checkHiddenRoom();
    this.updateCamera();
    this.syncHud();

    const cam = this.cameras.main;
    this.parallaxMountains.x = Math.round(cam.scrollX * 0.15);
    this.parallaxClouds.x = Math.round(cam.scrollX * 0.25);
    this.parallaxHills.x = Math.round(cam.scrollX * 0.45);
  }

  private updateCamera(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const targetLook = Math.sign(body.velocity.x) * 64;
    this.cameraLookAhead = Phaser.Math.Linear(this.cameraLookAhead, targetLook, 0.05);
    this.cameras.main.setFollowOffset(Math.round(this.cameraLookAhead), 0);
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
        spawnSpringBurst(this, block.x, block.y);
        screenShake(this, 4, 100);
        squashStretch(this.player, 0.75, 1.25, 120);
        if (EasterEggs.onSpringBounce()) {
          this.showSecretToast('Spring obsessed!');
          this.audio.playSecret();
        }
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
    if (enemy.enemyType === 'boss') {
      Missions.onBossEncounter();
    }
    const result = enemy.handlePlayerCollision(this.player);
    if (result === 'stomp') {
      enemy.stomp();
      this.player.stompBounce();
      this.audio.playStomp();
      screenShake(this, 4, 100);
      freezeFrame(this, 50);
      const prevCombo = GameState.combo;
      GameState.addStomp();
      Missions.onStomp();
      if (GameState.levelStomps === 1 && Achievements.unlock('first-stomp')) {
        this.emitAchievement('first-stomp', 'First Stomp', '👟');
      }
      if (GameState.combo >= 5 && Achievements.unlock('combo-5')) {
        this.emitAchievement('combo-5', 'Combo Starter', '🔥');
      }
      if (GameState.combo > prevCombo && GameState.combo > 1) {
        spawnComboText(this, this.player.x, this.player.y, GameState.combo, GameState.comboMultiplier);
      }
    } else if (result === 'hurt') {
      const damaged = this.player.takeDamage();
      if (!damaged) {
        GameState.levelDamageTaken = true;
        Missions.onDamage();
        screenShake(this, 6, 150);
        const pb = this.player.body as Phaser.Physics.Arcade.Body;
        pb.setVelocityX(enemy.x < this.player.x ? 200 : -200);
      }
    }
  }

  private fireProjectile(): void {
    Missions.onFireUsed();
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
    spawnPipeWarp(this, this.player.x, this.player.y);

    this.tweens.add({
      targets: this.player,
      y: this.player.y + TILE_SIZE,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 300,
      onComplete: () => {
        const exit = Block.worldPos(pipe.config.exitX, pipe.config.exitY);
        this.player.setPosition(exit.x, exit.y);
        this.player.setVelocity(0, 0);
        this.player.setScale(0.5);
        spawnPipeWarp(this, exit.x, exit.y);
        this.tweens.add({
          targets: this.player,
          y: exit.y - TILE_SIZE,
          alpha: 1,
          scaleX: 1,
          scaleY: 1,
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

  private checkQuestSigns(): void {
    let nearSign: QuestSign | undefined;
    for (const sign of this.questSigns) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, sign.x, sign.y);
      sign.showPrompt(dist < TILE_SIZE * 1.5);
      if (dist < TILE_SIZE * 1.5) nearSign = sign;
    }

    if (nearSign && this.inputManager.interactPressed) {
      const { message, reward, id } = nearSign.config;
      GameState.addScore(reward);
      if (EasterEggs.onSignTalk(id)) {
        this.showSecretToast('Sign reader!');
      }
      this.sideQuestPopup?.destroy();
      this.sideQuestPopup = this.add.text(this.player.x, this.player.y - 70, message, {
        fontSize: '12px',
        color: '#fff8dc',
        backgroundColor: '#5d4037dd',
        padding: { x: 10, y: 6 },
        wordWrap: { width: 220 },
        align: 'center',
      }).setOrigin(0.5).setDepth(100);
      this.time.delayedCall(3500, () => this.sideQuestPopup?.destroy());
      this.audio.playSecret();
      nearSign.talked = true;
    }
  }

  private checkHiddenRoom(): void {
    const room = this.levelData.hiddenRoom;
    if (!room || this.pipeWarping || this.hiddenRoomEntered) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const entry = Block.worldPos(room.entryX, room.entryY);
    const movingDown = this.inputManager.down && body.blocked.down;
    if (
      movingDown &&
      Math.abs(this.player.x - entry.x) < TILE_SIZE &&
      Math.abs(this.player.y - entry.y) < TILE_SIZE * 1.5
    ) {
      this.warpToHiddenRoom(room.exitX, room.exitY);
    }
  }

  private warpToHiddenRoom(exitX: number, exitY: number): void {
    this.pipeWarping = true;
    this.audio.playPipe();
    spawnPipeWarp(this, this.player.x, this.player.y);
    this.tweens.add({
      targets: this.player,
      alpha: 0,
      duration: 250,
      onComplete: () => {
        const exit = Block.worldPos(exitX, exitY);
        this.player.setPosition(exit.x, exit.y);
        this.player.setAlpha(1);
        this.hiddenRoomEntered = true;
        this.pipeWarping = false;
        if (EasterEggs.unlock('hidden-room-2-1')) {
          this.showSecretToast('Hidden chamber found!');
          Achievements.unlock('secret-room');
          this.emitAchievement('secret-room', 'Hidden Explorer', '🚪');
          this.audio.playSecret();
        }
        spawnCoinShower(this, exit.x, exit.y);
      },
    });
  }

  private checkGoal(): void {
    const { poleX } = this.flagpole.bounds;
    if (this.player.x >= poleX - TILE_SIZE * 1.5 && !this.levelComplete && !this.flagSliding) {
      this.startFlagSequence();
    }
  }

  private startFlagSequence(): void {
    if (this.levelComplete || this.flagSliding) return;

    this.levelComplete = true;
    this.flagSliding = true;
    this.flagTouchY = this.player.y;
    this.player.setFlagSequenceActive(true);
    this.audio.playFlagGrab();

    const { poleX, poleTopY, poleBottomY } = this.flagpole.bounds;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);

    const approach = () => {
      const needsClimb = this.player.y > poleTopY + 12;
      if (needsClimb) {
        this.tweens.add({
          targets: this.player,
          x: poleX,
          y: poleTopY,
          duration: 500,
          ease: 'Quad.easeOut',
          onComplete: () => this.runFlagTopPause(poleX, poleTopY, poleBottomY),
        });
      } else {
        this.tweens.add({
          targets: this.player,
          x: poleX,
          duration: 280,
          ease: 'Quad.easeOut',
          onComplete: () => {
            if (Math.abs(this.player.y - poleTopY) > 8) {
              this.tweens.add({
                targets: this.player,
                y: poleTopY,
                duration: 220,
                ease: 'Quad.easeOut',
                onComplete: () => this.runFlagTopPause(poleX, poleTopY, poleBottomY),
              });
            } else {
              this.runFlagTopPause(poleX, poleTopY, poleBottomY);
            }
          },
        });
      }
    };

    if (Math.abs(this.player.x - poleX) > 6) {
      this.tweens.add({
        targets: this.player,
        x: poleX,
        duration: 200,
        ease: 'Quad.easeOut',
        onComplete: approach,
      });
    } else {
      approach();
    }
  }

  private runFlagTopPause(poleX: number, poleTopY: number, poleBottomY: number): void {
    this.player.setPosition(poleX, poleTopY);
    GameState.addFlagBonus(this.flagTouchY, poleTopY, poleBottomY);
    this.syncHud();

    this.time.delayedCall(400, () => {
      this.audio.playFlag();
      this.time.delayedCall(350, () => this.runFlagSpin(poleX, poleTopY, poleBottomY));
    });
  }

  private runFlagSpin(poleX: number, poleTopY: number, poleBottomY: number): void {
    const radius = 22;
    const spinDuration = 650;

    this.tweens.addCounter({
      from: 0,
      to: Math.PI * 2,
      duration: spinDuration,
      ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        const angle = tween.getValue() ?? 0;
        this.player.x = poleX + Math.cos(angle) * radius;
        this.player.y = poleTopY + Math.sin(angle) * 10;
        this.player.setFlipX(Math.cos(angle) < 0);
      },
      onComplete: () => {
        this.player.setPosition(poleX, poleTopY);
        this.runFlagSlide(poleX, poleTopY, poleBottomY);
      },
    });
  }

  private runFlagSlide(poleX: number, _poleTopY: number, poleBottomY: number): void {
    this.audio.playFlagSlide();
    this.flagpole.startFlagWave();

    const slideDuration = 900;
    const flagLandY = poleBottomY - 8;

    this.flagpole.slideFlagTo(flagLandY, slideDuration, 'Quad.easeIn');

    this.tweens.add({
      targets: this.player,
      y: poleBottomY,
      duration: slideDuration,
      ease: 'Quad.easeIn',
      onUpdate: () => {
        this.player.x = poleX;
      },
      onComplete: () => this.runFlagWalkOff(poleX, poleBottomY),
    });
  }

  private runFlagWalkOff(poleX: number, poleBottomY: number): void {
    this.flagpole.stopFlagWave();
    this.player.setPosition(poleX, poleBottomY);

    const doorX = poleX + TILE_SIZE * 2.5;
    this.add
      .image(doorX, poleBottomY + TILE_SIZE / 2, 'goal-castle-door')
      .setOrigin(0.5, 1)
      .setDepth(2);

    this.tweens.add({
      targets: this.player,
      x: doorX + TILE_SIZE,
      duration: 600,
      ease: 'Linear',
      onStart: () => {
        this.player.setFlipX(false);
        this.player.setFlagSequenceActive(false);
      },
      onComplete: () => this.finishLevel(),
    });
  }

  private updateFlagSlide(_delta: number): void {
    this.syncHud();
  }

  private finishLevel(): void {
    this.flagSliding = false;
    Missions.onLevelClear(GameState.timeLeft);

    const completedMissions = Missions.consumeCompleted();
    completedMissions.forEach((m) => {
      this.emitMissionComplete(m.def.title, m.def.rewardScore);
    });

    if (!GameState.levelDamageTaken && Achievements.unlock('no-damage-level')) {
      this.emitAchievement('no-damage-level', 'Untouchable', '🛡');
    }

    if (GameState.isDailyChallenge && !isDailyCompleted()) {
      const { streak, reward } = markDailyCompleted();
      GameState.addScore(reward);
      this.showSecretToast(`Daily complete! Streak: ${streak} (+${reward})`);
      if (streak >= 7 && Achievements.unlock('daily-7')) {
        this.emitAchievement('daily-7', 'Week Warrior', '📅');
      }
    }

    const rules = getGameModeRules(GameState.gameMode);
    if (rules.trackSpeedrunGhost) {
      const elapsed = GameState.finishSpeedrun();
      const ghost = Storage.getSpeedrunGhost();
      if (ghost === 0 || elapsed < ghost) {
        Storage.setSpeedrunGhost(elapsed);
        if (Storage.setSpeedrunBest(elapsed)) {
          this.showSecretToast('New speedrun best!');
          if (ghost > 0 && Achievements.unlock('speedrun-ghost')) {
            this.emitAchievement('speedrun-ghost', 'Ghost Buster', '👻');
          }
        }
      }
    }

    if (Missions.allMissionsComplete()) {
      Storage.unlockNova();
      EasterEggs.unlock('nova-unlock');
      if (Achievements.unlock('nova-unlock')) {
        this.emitAchievement('nova-unlock', 'Nova Rising', '✨');
      }
    }

    if (Achievements.unlock('world-clear') && this.levelIndex === 0) {
      this.emitAchievement('world-clear', 'World Traveler', '🌍');
    }

    this.audio.playWin();
    this.physics.pause();
    GameBridge.setScreen('level-clear');

    this.time.delayedCall(2500, () => {
      const showShop =
        GameState.gameMode === 'adventure' &&
        !GameState.isDailyChallenge &&
        (this.levelIndex + 1) % 2 === 0 &&
        this.levelIndex < LEVELS.filter((l) => !l.secret).length - 1;

      if (showShop) {
        GameBridge.setScreen('shop', {
          shopCoins: Storage.getShopCoins(),
          nextLevelIndex: this.levelIndex + 1,
          characterId: this.characterId,
        });
        return;
      }

      this.advanceAfterLevel();
    });
  }

  private advanceAfterLevel(): void {
    GameState.nextLevel();
    const playableCount = LEVELS.filter((l) => !l.secret).length;

    if (GameState.gameMode === 'bossRush') {
      const { highScore, isNewRecord } = GameState.recordHighScore();
      this.audio.stopMusic();
      GameBridge.setScreen('game-over', { won: true, score: GameState.score, highScore, isNewRecord });
      this.scene.stop();
      return;
    }

    if (GameState.gameMode === 'coinRush') {
      const { highScore, isNewRecord } = GameState.recordHighScore();
      this.audio.stopMusic();
      GameBridge.setScreen('game-over', {
        won: true,
        score: GameState.score,
        highScore,
        isNewRecord,
      });
      this.scene.stop();
      return;
    }

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
      this.physics.resume();
      this.scene.restart({ levelIndex: GameState.currentLevel, characterId: this.characterId });
    }
  }

  private checkPitDeath(): void {
    if (this.flagSliding || this.levelComplete) return;
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

    const { poleX, poleTopY } = this.flagpole.bounds;
    if (this.player.x >= poleX - TILE_SIZE * 2 && this.player.y < poleTopY + TILE_SIZE) {
      if (EasterEggs.unlock('flag-top')) {
        GameState.addScore(5000);
        this.showSecretToast('Flag top bonus!');
        this.audio.playSecret();
      }
    }

    if (GameState.score >= 10000 && EasterEggs.unlock('score-10k')) {
      this.showSecretToast('Score master!');
    }

    if (
      this.levelData.name === 'World 1-2' &&
      this.player.hasTripleJump &&
      this.player.y < this.builtLevel.height * TILE_SIZE * 0.45 &&
      EasterEggs.unlock('triple-jump-cliff')
    ) {
      this.showSecretToast('Sky walker!');
      this.audio.playSecret();
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (
      this.inputManager.dashPressed &&
      body.velocity.x !== 0 &&
      this.player.x >= this.flagpole.bounds.poleX - TILE_SIZE * 4 &&
      EasterEggs.unlock('flag-dash')
    ) {
      this.showSecretToast('Flag dash!');
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
    const rules = getGameModeRules(GameState.gameMode);
    if (!rules.respawnPowerUp) {
      GameState.savedPowerState = 'small';
    } else {
      GameState.savedPowerState = this.player.playerState as 'small' | 'big' | 'blaze';
    }

    this.time.delayedCall(1000, () => {
      if (GameState.hasCheckpoint && rules.respawnPowerUp) {
        GameState.lives = Math.max(0, GameState.lives);
        this.paused = false;
        this.physics.resume();
        this.player.setPosition(GameState.checkpointX, GameState.checkpointY);
        this.player.revive(GameState.savedPowerState);
        GameState.clearCheckpoint();
        this.syncHud();
        return;
      }

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
        this.paused = false;
        this.physics.resume();
        if (!rules.respawnPowerUp) {
          GameState.savedPowerState = 'small';
        }
        this.scene.restart({ levelIndex: this.levelIndex, characterId: this.characterId });
      }
    });
  }
}
