import { useCallback, useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, GRAVITY } from './config/constants';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { GameScene } from './scenes/GameScene';
import { GameBridge } from './systems/GameBridge';
import type { GameOverState, GameScreen, HudState } from './systems/GameBridge';
import { GameState } from './systems/GameState';
import { MenuOverlay } from './ui/MenuOverlay';
import { HUD } from './ui/HUD';
import { GameOverOverlay } from './ui/GameOverOverlay';
import { LoadingOverlay } from './ui/LoadingOverlay';
import { LevelClearOverlay } from './ui/LevelClearOverlay';

const defaultHud: HudState = {
  score: 0,
  coins: 0,
  lives: 3,
  world: '',
  combo: 0,
  comboMultiplier: 1,
};

export function App() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [screen, setScreen] = useState<GameScreen>('loading');
  const [hud, setHud] = useState<HudState>(defaultHud);
  const [gameOver, setGameOver] = useState<GameOverState>({ won: false, score: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

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
  }, []);

  useEffect(() => {
    initGame();
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
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

    const unsubStart = GameBridge.on('start-game', () => {
      GameState.reset();
      const game = gameRef.current;
      if (game) {
        game.scene.start('GameScene', { levelIndex: 0 });
        setScreen('playing');
      }
    });

    const unsubMenu = GameBridge.on('back-to-menu', () => {
      const game = gameRef.current;
      if (game) {
        game.scene.stop('GameScene');
        GameState.reset();
      }
      setScreen('menu');
    });

    return () => {
      unsubScreen();
      unsubHud();
      unsubStart();
      unsubMenu();
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: -dy * 6, y: dx * 6 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <div className="app-shell">
      <div className="bg-ambient" />
      <div className="bg-grid" />
      <div className="floating-orb" />
      <div className="floating-orb" />
      <div className="floating-orb" />

      <div
        ref={stageRef}
        className="game-stage"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        <div className="game-cabinet">
          <div className="game-cabinet-inner">
            <div id="game-container" ref={containerRef} />
            {screen === 'loading' && <LoadingOverlay />}
            {screen === 'menu' && <MenuOverlay />}
            {screen === 'playing' && <HUD hud={hud} />}
            {screen === 'level-clear' && (
              <>
                <HUD hud={hud} />
                <LevelClearOverlay />
              </>
            )}
            {screen === 'game-over' && <GameOverOverlay state={gameOver} />}
          </div>
        </div>
      </div>

      <footer className="site-footer">MARCO&apos;S QUEST — Built with Phaser + React</footer>
    </div>
  );
}
