import { useEffect, useRef, useState } from 'react';
import type { GameScreen, HudState } from '../systems/GameBridge';
import type { ViewLayout } from '../config/cabinetLayout';
import { Storage } from '../systems/Storage';
import { UISounds } from '../utils/uiSounds';
import { CharacterSelectCabinet } from './CharacterSelect';

interface Props {
  layout: ViewLayout;
  hud: HudState;
  screen: GameScreen;
  isPlaying: boolean;
  isBrowserFullscreen: boolean;
  onPause: () => void;
  onToggleBrowserFullscreen: () => void;
  onToggleViewMode: () => void;
  onCharacterChange?: (characterId: string) => void;
}

export function ArcadeCabinet({
  layout,
  hud,
  screen,
  isPlaying,
  isBrowserFullscreen,
  onPause,
  onToggleBrowserFullscreen,
  onToggleViewMode,
  onCharacterChange,
}: Props) {
  const prevCoins = useRef(hud.coins);
  const [coinPulse, setCoinPulse] = useState(false);
  const [characterId, setCharacterId] = useState(Storage.getSelectedCharacter());

  useEffect(() => {
    if (hud.coins > prevCoins.current) {
      setCoinPulse(true);
      const t = window.setTimeout(() => setCoinPulse(false), 600);
      prevCoins.current = hud.coins;
      return () => window.clearTimeout(t);
    }
    prevCoins.current = hud.coins;
  }, [hud.coins]);

  const showAttract = screen === 'paused';
  const maxLives = 3;

  const handleCharacterChange = (id: string) => {
    setCharacterId(id);
    onCharacterChange?.(id);
  };

  return (
    <div
      className={`arcade-cabinet${isPlaying ? ' arcade-cabinet--active' : ''}`}
      style={{
        width: layout.cabinetW,
        height: layout.cabinetH,
        left: layout.cabinetLeft,
        top: layout.cabinetTop,
        '--cabinet-game-w': `${layout.scaledW}px`,
        '--cabinet-game-h': `${layout.scaledH}px`,
      } as React.CSSProperties}
    >
      <div className="cabinet-glow" aria-hidden="true" />

      <header className="cabinet-marquee">
        <div className="cabinet-marquee-neon" aria-hidden="true">
          <span className="cabinet-neon-line cabinet-neon-line--top">EASHAN&apos;S</span>
          <span className="cabinet-neon-line cabinet-neon-line--bottom">QUEST</span>
          {hud.characterName && (
            <span className="cabinet-neon-hero">{hud.characterName}</span>
          )}
        </div>
        <div className="cabinet-marquee-world">{hud.world || 'WORLD 1-1'}</div>
        <div className="cabinet-marquee-stats" aria-label="Game stats">
          <span className="cabinet-marquee-stat">
            <span className="cabinet-marquee-stat-label">SCORE</span>
            <span className="cabinet-marquee-stat-value">{hud.score.toString().padStart(6, '0')}</span>
          </span>
          <span className="cabinet-marquee-stat">
            <span className="cabinet-marquee-stat-label">TIME</span>
            <span className={`cabinet-marquee-stat-value${hud.timeLeft <= 100 ? ' cabinet-marquee-stat-value--warn' : ''}`}>
              {Math.ceil(hud.timeLeft)}
            </span>
          </span>
          <span className="cabinet-marquee-stat">
            <span className="cabinet-marquee-stat-label">COINS</span>
            <span className="cabinet-marquee-stat-value">×{hud.coins.toString().padStart(2, '0')}</span>
          </span>
          <span className="cabinet-marquee-stat">
            <span className="cabinet-marquee-stat-label">LIVES</span>
            <span className="cabinet-marquee-stat-value cabinet-marquee-stat-value--lives">♥ {hud.lives}</span>
          </span>
        </div>
        <div className="cabinet-marquee-actions">
          <button
            type="button"
            className="cabinet-btn cabinet-btn--view"
            onClick={() => {
              UISounds.click();
              onToggleViewMode();
            }}
            aria-label="Switch to fullscreen view"
            title="Fullscreen view"
          >
            ⛶
          </button>
          <button
            type="button"
            className="cabinet-btn"
            onClick={() => {
              UISounds.pause();
              onPause();
            }}
            aria-label="Pause game"
            title="Pause (Esc / P)"
          >
            ⏸
          </button>
          <button
            type="button"
            className="cabinet-btn"
            onClick={() => {
              UISounds.click();
              onToggleBrowserFullscreen();
            }}
            aria-label={isBrowserFullscreen ? 'Exit browser fullscreen' : 'Enter browser fullscreen'}
            title={isBrowserFullscreen ? 'Exit browser fullscreen (F)' : 'Browser fullscreen (F)'}
          >
            {isBrowserFullscreen ? '⤢' : '▢'}
          </button>
        </div>
      </header>

      <div className="cabinet-body">
        <aside className="cabinet-side cabinet-side--left" aria-hidden="true">
          <div className="cabinet-side-art">
            <div className="side-art-castle" />
            <div className="side-art-hill" />
            <div className="side-art-coin" />
            <div className="side-art-pipe" />
          </div>
        </aside>

        <div className="cabinet-screen-wrap">
          <div className="cabinet-bezel">
            <div
              className="cabinet-crt cabinet-crt--hole"
              style={{
                width: layout.scaledW,
                height: layout.scaledH,
              }}
            >
              <div className="cabinet-crt-vignette" aria-hidden="true" />
            </div>
          </div>

          <div className="cabinet-bezel-score">
            <span className="cabinet-bezel-label">SCORE</span>
            <span className="cabinet-bezel-value">{hud.score.toString().padStart(6, '0')}</span>
            <span className="cabinet-bezel-time">T {Math.ceil(hud.timeLeft)}</span>
            <span className="cabinet-bezel-hi">HI {hud.highScore.toString().padStart(6, '0')}</span>
          </div>
        </div>

        <aside className="cabinet-side cabinet-side--right" aria-hidden="true">
          <div className="cabinet-side-art cabinet-side-art--mirror">
            <div className="side-art-castle" />
            <div className="side-art-hill" />
            <div className="side-art-coin" />
            <div className="side-art-pipe" />
          </div>
        </aside>
      </div>

      <footer className="cabinet-controls">
        <div className="cabinet-speaker cabinet-speaker--left" aria-hidden="true">
          <div className="speaker-grille" />
        </div>

        <div className="cabinet-panel-center">
          <div className="cabinet-coin-slot">
            <span className="cabinet-coin-slot-label">COIN</span>
            <div
              className={`cabinet-coin-led${hud.coins > 0 || coinPulse ? ' cabinet-coin-led--on' : ''}${coinPulse ? ' cabinet-coin-led--pulse' : ''}`}
              aria-hidden="true"
            />
            <span className="cabinet-coin-count">{hud.coins.toString().padStart(2, '0')}</span>
          </div>

          <div className="cabinet-joystick-area" aria-hidden="true">
            <div className="cabinet-joystick-base" />
            <div className="cabinet-joystick-stick" />
            <span className="cabinet-joystick-label">MOVE</span>
          </div>

          <div className="cabinet-buttons-deco" aria-hidden="true">
            <div className="cabinet-btn-deco cabinet-btn-deco--a">
              <span className="cabinet-btn-cap cabinet-btn-cap--red" />
              <span className="cabinet-btn-label">A · JUMP</span>
            </div>
            <div className="cabinet-btn-deco cabinet-btn-deco--b">
              <span className="cabinet-btn-cap cabinet-btn-cap--green" />
              <span className="cabinet-btn-label">B · DASH</span>
            </div>
            <div className="cabinet-btn-deco cabinet-btn-deco--fire">
              <span className="cabinet-btn-cap cabinet-btn-cap--blue" />
              <span className="cabinet-btn-label">Z · FIRE</span>
            </div>
            <div className="cabinet-btn-deco cabinet-btn-deco--start">
              <span className="cabinet-btn-cap cabinet-btn-cap--yellow" />
              <span className="cabinet-btn-label">START</span>
            </div>
          </div>

          <div className="cabinet-lives">
            <span className="cabinet-lives-label">LIVES</span>
            <div className="cabinet-life-icons">
              {Array.from({ length: maxLives }, (_, i) => (
                <span
                  key={i}
                  className={`cabinet-life-icon${i < hud.lives ? ' cabinet-life-icon--on' : ''}`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>

          {showAttract && (
            <div className="cabinet-attract">
              <CharacterSelectCabinet selectedId={characterId} onSelect={handleCharacterChange} />
              <span className="cabinet-attract-line blink">RESUME TO PLAY</span>
            </div>
          )}
        </div>

        <div className="cabinet-speaker cabinet-speaker--right" aria-hidden="true">
          <div className="speaker-grille" />
        </div>
      </footer>

      <div className="cabinet-base" aria-hidden="true">
        <div className="cabinet-base-shadow" />
      </div>
    </div>
  );
}
