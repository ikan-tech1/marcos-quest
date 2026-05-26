import { useEffect, useRef, useState } from 'react';
import type { GameScreen, HudState } from '../systems/GameBridge';
import type { CabinetLayout } from '../config/cabinetLayout';
import { Storage } from '../systems/Storage';
import { UISounds } from '../utils/uiSounds';
import { CharacterSelectCabinet } from './CharacterSelect';

interface Props {
  layout: CabinetLayout;
  hud: HudState;
  screen: GameScreen;
  isPlaying: boolean;
  onPause: () => void;
  onToggleFullscreen: () => void;
  onCharacterChange?: (characterId: string) => void;
}

export function ArcadeCabinet({
  layout,
  hud,
  screen,
  isPlaying,
  onPause,
  onToggleFullscreen,
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
  const displayName = hud.characterName || 'Hero';

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
        </div>
        <div className="cabinet-marquee-world">
          {hud.world || 'WORLD 1-1'}
          <span className="cabinet-marquee-hero">{displayName}</span>
        </div>
        <div className="cabinet-marquee-actions">
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
              onToggleFullscreen();
            }}
            aria-label="Enter fullscreen"
            title="Fullscreen (F)"
          >
            ⛶
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
              style={{ width: layout.scaledW, height: layout.scaledH }}
            >
              <div className="cabinet-crt-vignette" aria-hidden="true" />
            </div>
          </div>

          <div className="cabinet-bezel-score">
            <span className="cabinet-bezel-label">SCORE</span>
            <span className="cabinet-bezel-value">{hud.score.toString().padStart(6, '0')}</span>
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
