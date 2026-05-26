import { useCallback, useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, GRAVITY } from './config/constants';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { GameScene } from './scenes/GameScene';
import { GameBridge } from './systems/GameBridge';
import type { GameOverState, GameScreen, HudState, StartGamePayload } from './systems/GameBridge';
import { GameState } from './systems/GameState';
import { Storage } from './systems/Storage';
import { VirtualInput } from './systems/VirtualInput';
import { LEVELS } from './levels/levelData';
import { MenuOverlay } from './ui/MenuOverlay';
import { HUD } from './ui/HUD';
import { GameOverOverlay } from './ui/GameOverOverlay';
import { LoadingOverlay } from './ui/LoadingOverlay';
import { LevelClearOverlay } from './ui/LevelClearOverlay';
import { PauseOverlay } from './ui/PauseOverlay';
import { TouchControls } from './ui/TouchControls';

const defaultHud: HudState = {
  score: 0,
  coins: 0,
  lives: 3,
  world: '',
  combo: 0,
  comboMultiplier: 1,
  levelIndex: 0,
  totalLevels: LEVELS.length,
  highScore: Storage.getHighScore(),
};

const GROUND_STRIP_PX = 64;
const FOOTER_CLEARANCE_PX = 28;

function computeGameScale(immersive: boolean): number {
  const stagePad = immersive ? 12 : 56;
  const maxW = window.innerWidth - 24;
  const maxH = window.innerHeight - GROUND_STRIP_PX - FOOTER_CLEARANCE_PX - stagePad;
  return Math.max(
    1,
    Math.min(
      Math.floor(maxW / GAME_WIDTH),
      Math.floor(maxH / GAME_HEIGHT),
    ),
  );
}

function isTouchDevice(): boolean {
  return 'ontouchstart' in window || window.matchMedia('(pointer: coarse)').matches;
}

function emitToGameScene(event: string): void {
  const scene = gameRefStatic.current?.scene.getScene('GameScene');
  scene?.events.emit(event);
}

const gameRefStatic = { current: null as Phaser.Game | null };

export function App() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [screen, setScreen] = useState<GameScreen>('loading');
  const [hud, setHud] = useState<HudState>(defaultHud);
  const [gameOver, setGameOver] = useState<GameOverState>({
    won: false,
    score: 0,
    highScore: Storage.getHighScore(),
    isNewRecord: false,
  });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [gameScale, setGameScale] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(Storage.getSoundEnabled());
  const [showTouch, setShowTouch] = useState(false);

  const isCrispStage = screen === 'playing' || screen === 'level-clear' || screen === 'paused';

  const initGame = useCallback(() => {
    if (gameRef.current || !containerRef.current) return;

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent: containerRef.current,
      backgroundColor: '#5bc0eb',
      pixelArt: true,
      roundPixels: true,
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: GRAVITY }, debug: false },
      },
      scale: { mode: Phaser.Scale.NONE },
      scene: [BootScene, PreloadScene, GameScene],
    });
    gameRefStatic.current = gameRef.current;
  }, []);

  useEffect(() => {
    initGame();
    setShowTouch(isTouchDevice());
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
      gameRefStatic.current = null;
    };
  }, [initGame]);

  useEffect(() => {
    const unsubScreen = GameBridge.on('screen', (data) => {
      const payload = data as { screen: GameScreen; data?: unknown };
      setScreen(payload.screen);
      if (payload.screen === 'game-over' && payload.data) {
        setGameOver(payload.data as GameOverState);
      }
    });

    const unsubHud = GameBridge.on('hud', (data) => {
      setHud(data as HudState);
    });

    const unsubStart = GameBridge.on('start-game', (data) => {
      const { levelIndex = 0 } = (data as StartGamePayload) ?? {};
      GameState.reset();
      GameState.currentLevel = levelIndex;
      VirtualInput.reset();
      const game = gameRef.current;
      if (game) {
        game.scene.start('GameScene', { levelIndex });
        setScreen('playing');
      }
    });

    const unsubMenu = GameBridge.on('back-to-menu', () => {
      const game = gameRef.current;
      if (game) {
        game.scene.stop('GameScene');
        GameState.reset();
      }
      VirtualInput.reset();
      setScreen('menu');
    });

    const unsubResume = GameBridge.on('resume-game', () => emitToGameScene('resume-game'));
    const unsubRestart = GameBridge.on('restart-level', () => emitToGameScene('restart-level'));
    const unsubPause = GameBridge.on('pause-game', () => emitToGameScene('toggle-pause'));

    const unsubSound = GameBridge.on('sound-toggle', (data) => {
      const { enabled } = data as { enabled: boolean };
      setSoundEnabled(enabled);
    });

    return () => {
      unsubScreen();
      unsubHud();
      unsubStart();
      unsubMenu();
      unsubResume();
      unsubRestart();
      unsubPause();
      unsubSound();
    };
  }, []);

  useEffect(() => {
    const updateScale = () => setGameScale(computeGameScale(isCrispStage));
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isCrispStage]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    game.scale.setZoom(gameScale);
  }, [gameScale]);

  useEffect(() => {
    if (isCrispStage) setTilt({ x: 0, y: 0 });
  }, [isCrispStage]);

  const toggleSound = useCallback(() => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    Storage.setSoundEnabled(next);
    GameBridge.emit('sound-toggle', { enabled: next });
  }, [soundEnabled]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!stageRef.current || isCrispStage) return;
    const rect = stageRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: -dy * 4, y: dx * 4 });
  }, [isCrispStage]);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  const scaledW = GAME_WIDTH * gameScale;
  const scaledH = GAME_HEIGHT * gameScale;

  return (
    <div className={`app-shell${isCrispStage ? ' app-shell--playing' : ' app-shell--menu'}`}>
      <div className="world-sky" aria-hidden="true" />
      <div className="world-sun" aria-hidden="true" />

      <div className="world-clouds world-clouds--static" aria-hidden="true">
        <div className="cloud cloud-static cloud-s1" />
        <div className="cloud cloud-static cloud-s2" />
        <div className="cloud cloud-static cloud-s3" />
        <div className="cloud cloud-static cloud-s4" />
      </div>

      <div className="world-clouds world-clouds--drift" aria-hidden="true">
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
        <div className="cloud cloud-4" />
        <div className="cloud cloud-5" />
      </div>

      <div className="world-hills" aria-hidden="true">
        <div className="hill hill-far" />
        <div className="hill hill-mid" />
        <div className="hill hill-near" />
      </div>

      <div className="world-bushes" aria-hidden="true">
        <div className="bush bush-1" />
        <div className="bush bush-2" />
        <div className="bush bush-3" />
      </div>

      <div className="world-floaters" aria-hidden="true">
        <div className="floater floater-coin floater-1" />
        <div className="floater floater-coin floater-2" />
        <div className="floater floater-coin floater-3" />
        <div className="floater floater-coin floater-7" />
        <div className="floater floater-qblock floater-4" />
        <div className="floater floater-qblock floater-8" />
        <div className="floater floater-brick floater-5" />
        <div className="floater floater-brick floater-6" />
        <div className="floater floater-pipe floater-pipe-left" />
        <div className="floater floater-pipe floater-pipe-right" />
      </div>

      <div className="world-ground" aria-hidden="true">
        <div className="ground-grass" />
        <div className="ground-dirt" />
      </div>

      <div
        ref={stageRef}
        className={`game-stage${isCrispStage ? ' game-stage--crisp' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={
          isCrispStage
            ? undefined
            : { transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }
        }
      >
        <div className={`portal-frame${isCrispStage ? ' portal-frame--play' : ''}`}>
          {!isCrispStage && (
            <div className="portal-frame-top">
              <span className="portal-bolt" />
              <span className="portal-label">EASHAN&apos;S QUEST</span>
              <span className="portal-bolt" />
            </div>
          )}

          <div className={`game-cabinet${isCrispStage ? ' game-cabinet--play' : ''}`}>
            <div
              className="game-cabinet-inner"
              style={
                {
                  width: scaledW,
                  height: scaledH,
                  '--game-scale': gameScale,
                } as React.CSSProperties
              }
            >
              <div id="game-container" ref={containerRef} />
              {screen === 'loading' && <LoadingOverlay />}
              {screen === 'menu' && (
                <MenuOverlay
                  highScore={Storage.getHighScore()}
                  soundEnabled={soundEnabled}
                  onToggleSound={toggleSound}
                />
              )}
              {(screen === 'playing' || screen === 'level-clear') && (
                <HUD hud={hud} onPause={() => GameBridge.emit('pause-game')} />
              )}
              {screen === 'paused' && (
                <>
                  <HUD hud={hud} onPause={() => GameBridge.emit('pause-game')} />
                  <PauseOverlay soundEnabled={soundEnabled} onToggleSound={toggleSound} />
                </>
              )}
              {screen === 'level-clear' && (
                <>
                  <LevelClearOverlay />
                </>
              )}
              {screen === 'game-over' && <GameOverOverlay state={gameOver} />}
              {showTouch && (screen === 'playing' || screen === 'paused') && <TouchControls />}
            </div>
            {isCrispStage && <div className="stage-ground-lip" style={{ width: scaledW }} />}
          </div>

          {!isCrispStage && <div className="portal-frame-bottom" />}
        </div>
      </div>

      <footer className="site-footer">
        EASHAN&apos;S QUEST — Built with Phaser + React
        {showTouch && <span className="mobile-hint"> · Tap controls enabled</span>}
      </footer>
    </div>
  );
}
