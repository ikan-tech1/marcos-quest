import { useCallback, useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, GRAVITY } from './config/constants';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { GameScene } from './scenes/GameScene';
import { GameBridge } from './systems/GameBridge';
import type { GameOverState, GameScreen, HudState, StartGamePayload } from './systems/GameBridge';
import { GameState } from './systems/GameState';
import { Storage, type ViewMode } from './systems/Storage';
import { VirtualInput } from './systems/VirtualInput';
import { LEVELS } from './levels/levelData';
import { MenuOverlay } from './ui/MenuOverlay';
import { HUD } from './ui/HUD';
import { GameOverOverlay } from './ui/GameOverOverlay';
import { LoadingOverlay } from './ui/LoadingOverlay';
import { LevelClearOverlay } from './ui/LevelClearOverlay';
import { PauseOverlay } from './ui/PauseOverlay';
import { TouchControls } from './ui/TouchControls';
import { ArcadeCabinet } from './ui/ArcadeCabinet';
import { UISounds } from './utils/uiSounds';
import { useFullscreen } from './hooks/useFullscreen';
import { computeViewGameScale, computeViewLayout } from './config/cabinetLayout';
import { getCharacterById } from './config/characters';

const defaultHud: HudState = {
  score: 0,
  coins: 0,
  lives: 3,
  world: '',
  characterName: getCharacterById(Storage.getSelectedCharacter()).name.toUpperCase(),
  combo: 0,
  comboMultiplier: 1,
  levelIndex: 0,
  totalLevels: LEVELS.filter((l) => !l.secret).length,
  highScore: Storage.getHighScore(),
  timeLeft: 400,
};

function isTouchDevice(): boolean {
  return 'ontouchstart' in window || window.matchMedia('(pointer: coarse)').matches;
}

function emitToGameScene(event: string): void {
  const scene = gameRefStatic.current?.scene.getScene('GameScene');
  scene?.events.emit(event);
}

const gameRefStatic = { current: null as Phaser.Game | null };

const GAMEPLAY_SCREENS: GameScreen[] = ['playing', 'paused', 'level-clear', 'game-over'];

export function App() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle: toggleFullscreen, exit: exitFullscreen } = useFullscreen(shellRef);
  const [screen, setScreen] = useState<GameScreen>('loading');
  const [hud, setHud] = useState<HudState>(defaultHud);
  const [gameOver, setGameOver] = useState<GameOverState>({
    won: false,
    score: 0,
    highScore: Storage.getHighScore(),
    isNewRecord: false,
  });
  const [gameScale, setGameScale] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>(() => Storage.getViewMode());
  const [soundEnabled, setSoundEnabled] = useState(Storage.getSoundEnabled());
  const [showTouch, setShowTouch] = useState(false);
  const [screenVisible, setScreenVisible] = useState(true);
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });

  const isArcadeView = viewMode === 'arcade';
  const showGameViewport = GAMEPLAY_SCREENS.includes(screen);
  const showHeroWorld = screen === 'loading' || screen === 'menu';
  const showGameplayBackdrop = (showGameViewport && !isArcadeView) || showHeroWorld;

  const transitionTo = useCallback((next: GameScreen, data?: unknown) => {
    setScreenVisible(false);
    window.setTimeout(() => {
      setScreen(next);
      if (next === 'game-over' && data) {
        setGameOver(data as GameOverState);
      }
      setScreenVisible(true);
    }, 120);
  }, []);

  useEffect(() => {
    setShowTouch(isTouchDevice());
    UISounds.setEnabled(Storage.getSoundEnabled());

    const unsubScreen = GameBridge.on('screen', (data) => {
      const payload = data as { screen: GameScreen; data?: unknown };
      transitionTo(payload.screen, payload.data);
    });

    const unsubHud = GameBridge.on('hud', (data) => {
      setHud(data as HudState);
    });

    const unsubStart = GameBridge.on('start-game', (data) => {
      const { levelIndex = 0, characterId = Storage.getSelectedCharacter() } =
        (data as StartGamePayload) ?? {};
      Storage.setSelectedCharacter(characterId);
      GameState.reset();
      GameState.currentLevel = levelIndex;
      VirtualInput.reset();
      const game = gameRef.current;
      if (game) {
        game.scene.start('GameScene', { levelIndex, characterId });
        transitionTo('playing');
      }
    });

    const unsubMenu = GameBridge.on('back-to-menu', () => {
      const game = gameRef.current;
      if (game) {
        game.scene.stop('GameScene');
        GameState.reset();
      }
      VirtualInput.reset();
      transitionTo('menu');
    });

    const unsubResume = GameBridge.on('resume-game', () => emitToGameScene('resume-game'));
    const unsubRestart = GameBridge.on('restart-level', () => emitToGameScene('restart-level'));
    const unsubPause = GameBridge.on('pause-game', () => emitToGameScene('toggle-pause'));

    const unsubSound = GameBridge.on('sound-toggle', (data) => {
      const { enabled } = data as { enabled: boolean };
      setSoundEnabled(enabled);
      UISounds.setEnabled(enabled);
    });

    const bridgeScreen = GameBridge.getScreen();
    if (bridgeScreen !== 'loading') {
      setScreen(bridgeScreen);
      setScreenVisible(true);
    }

    if (!gameRef.current && containerRef.current) {
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
    }

    return () => {
      unsubScreen();
      unsubHud();
      unsubStart();
      unsubMenu();
      unsubResume();
      unsubRestart();
      unsubPause();
      unsubSound();
      gameRef.current?.destroy(true);
      gameRef.current = null;
      gameRefStatic.current = null;
    };
  }, [transitionTo]);

  useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setViewport({ w, h });
      setGameScale(computeViewGameScale(viewMode, w, h));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [viewMode]);

  useEffect(() => {
    if (!showGameViewport && isFullscreen) {
      void exitFullscreen();
    }
  }, [showGameViewport, isFullscreen, exitFullscreen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!showGameViewport) return;
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        void toggleFullscreen();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showGameViewport, toggleFullscreen]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game || !showGameViewport) return;
    game.scale.setZoom(gameScale);
  }, [gameScale, showGameViewport]);

  const toggleSound = useCallback(() => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    Storage.setSoundEnabled(next);
    UISounds.setEnabled(next);
    GameBridge.emit('sound-toggle', { enabled: next });
    UISounds.click();
  }, [soundEnabled]);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => {
      const next: ViewMode = prev === 'arcade' ? 'fullscreen' : 'arcade';
      Storage.setViewMode(next);
      return next;
    });
    UISounds.click();
  }, []);

  const layout = computeViewLayout(viewMode, viewport.w, viewport.h, gameScale);
  const { scaledW, scaledH, crtLeft, crtTop } = layout;

  const handleToggleFullscreen = useCallback(() => {
    UISounds.click();
    void toggleFullscreen();
  }, [toggleFullscreen]);

  const handleCharacterChange = useCallback((id: string) => {
    Storage.setSelectedCharacter(id);
    emitToGameScene('change-character');
  }, []);

  return (
    <div
      ref={shellRef}
      className={`app-shell app-shell--${screen}${showGameViewport ? ' app-shell--gameplay' : ' app-shell--hero'}${isArcadeView && showGameViewport ? ' app-shell--arcade' : ''}${isFullscreen ? ' app-shell--browser-fullscreen' : ''}`}
      data-transition={screenVisible ? 'in' : 'out'}
    >
      {showGameViewport && isArcadeView && (
        <div className="arcade-room" aria-hidden="true">
          <div className="arcade-room-spotlight" />
          <div className="arcade-room-floor" />
          <span className="arcade-room-neon">★ ARCADE ★</span>
          <span className="arcade-room-neon arcade-room-neon--right">★ PLAY ★</span>
        </div>
      )}

      {showGameplayBackdrop && (
        <>
          <div className="world-sky" aria-hidden="true" />
          <div className="world-sun" aria-hidden="true" />
          <div className="world-clouds world-clouds--static" aria-hidden="true">
            <div className="cloud cloud-static cloud-s1" />
            <div className="cloud cloud-static cloud-s2" />
            <div className="cloud cloud-static cloud-s3" />
            <div className="cloud cloud-static cloud-s4" />
          </div>
          {showHeroWorld && (
            <div className="world-clouds world-clouds--drift" aria-hidden="true">
              <div className="cloud cloud-1" />
              <div className="cloud cloud-2" />
              <div className="cloud cloud-3" />
              <div className="cloud cloud-4" />
              <div className="cloud cloud-5" />
            </div>
          )}
          <div className="world-hills" aria-hidden="true">
            <div className="hill hill-far" />
            <div className="hill hill-mid" />
            <div className="hill hill-near" />
          </div>
          {showHeroWorld && (
            <>
              <div className="world-bushes" aria-hidden="true">
                <div className="bush bush-1" />
                <div className="bush bush-2" />
                <div className="bush bush-3" />
              </div>
              <div className="world-floaters" aria-hidden="true">
                <div className="floater floater-coin floater-1" />
                <div className="floater floater-coin floater-2" />
                <div className="floater floater-coin floater-3" />
                <div className="floater floater-qblock floater-4" />
                <div className="floater floater-brick floater-5" />
                <div className="floater floater-pipe floater-pipe-left" />
                <div className="floater floater-pipe floater-pipe-right" />
              </div>
              <div className="world-ground" aria-hidden="true">
                <div className="ground-grass" />
                <div className="ground-dirt" />
              </div>
            </>
          )}
        </>
      )}

      <div
        id="game-container"
        ref={containerRef}
        className={showGameViewport ? 'game-container--live' : 'game-container--hidden'}
        style={
          showGameViewport
            ? ({
                width: scaledW,
                height: scaledH,
                left: crtLeft,
                top: crtTop,
                '--game-scale': gameScale,
              } as React.CSSProperties)
            : undefined
        }
      />

      {showGameViewport && isArcadeView && (
        <ArcadeCabinet
          layout={layout}
          hud={hud}
          screen={screen}
          isPlaying={screen === 'playing' || screen === 'level-clear'}
          isBrowserFullscreen={isFullscreen}
          onPause={() => GameBridge.emit('pause-game')}
          onToggleBrowserFullscreen={handleToggleFullscreen}
          onToggleViewMode={toggleViewMode}
        />
      )}

      {showGameViewport && (
        <div
          className={`game-viewport${isArcadeView ? ' game-viewport--cabinet-window' : ' game-viewport--fullscreen'}`}
          style={{ width: scaledW, height: scaledH, left: crtLeft, top: crtTop }}
        >
          {isArcadeView && (
            <div className="cabinet-crt-scanlines cabinet-crt-scanlines--overlay" aria-hidden="true" />
          )}
          {(screen === 'playing' || screen === 'level-clear' || screen === 'paused') && (
            <HUD
              hud={hud}
              viewMode={viewMode}
              isFullscreen={isFullscreen}
              showControls={!isArcadeView}
              onPause={() => GameBridge.emit('pause-game')}
              onToggleFullscreen={handleToggleFullscreen}
              onToggleViewMode={toggleViewMode}
            />
          )}
          {screen === 'paused' && (
            <PauseOverlay
              soundEnabled={soundEnabled}
              isFullscreen={isFullscreen}
              selectedCharacterId={Storage.getSelectedCharacter()}
              onCharacterChange={handleCharacterChange}
              onToggleSound={toggleSound}
              onToggleFullscreen={handleToggleFullscreen}
            />
          )}
          {screen === 'level-clear' && <LevelClearOverlay />}
          {showTouch && (screen === 'playing' || screen === 'paused') && <TouchControls />}
        </div>
      )}

      <div className={`screen-layer${screen === 'game-over' ? ' screen-layer--fullscreen' : ''}`}>
        {screen === 'loading' && <LoadingOverlay />}
        {screen === 'menu' && (
          <MenuOverlay
            highScore={Storage.getHighScore()}
            soundEnabled={soundEnabled}
            viewMode={viewMode}
            onToggleSound={toggleSound}
            onToggleViewMode={toggleViewMode}
          />
        )}
        {screen === 'game-over' && <GameOverOverlay state={gameOver} />}
      </div>

      {showHeroWorld && screen === 'menu' && (
        <footer className="site-footer site-footer--hero">
          EASHAN&apos;S QUEST
          {showTouch && <span className="mobile-hint"> · Touch ready</span>}
        </footer>
      )}
    </div>
  );
}
