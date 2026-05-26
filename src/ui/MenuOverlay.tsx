import { useEffect, useState } from 'react';
import { GameBridge } from '../systems/GameBridge';
import { Storage } from '../systems/Storage';
import { EasterEggs } from '../systems/EasterEggs';
import { LEVELS } from '../levels/levelData';
import { UISounds } from '../utils/uiSounds';

interface Props {
  highScore: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export function MenuOverlay({ highScore, soundEnabled, onToggleSound }: Props) {
  const [konamiMsg, setKonamiMsg] = useState('');
  const secretUnlocked = EasterEggs.isSecretLevelUnlocked();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (EasterEggs.handleKey(e.code)) {
        setKonamiMsg('Konami code! +3 lives on next run');
        EasterEggs.unlock('konami');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const start = (levelIndex = 0) => {
    UISounds.confirm();
    GameBridge.emit('start-game', { levelIndex });
  };

  const completedLevels = Storage.getCompletedLevels();
  const playableLevels = LEVELS.filter((l) => !l.secret);
  const secretIndex = LEVELS.findIndex((l) => l.secret);

  return (
    <div className="overlay overlay-menu overlay--fullscreen screen-enter">
      <div className="menu-vignette" aria-hidden="true" />

      <div className="menu-hero">
        <div className="menu-title-block">
          <p className="menu-hero-tag screen-enter screen-enter--1">★ Welcome, Eashan! ★</p>
          <h1 className="title-hero screen-enter screen-enter--2">
            <span className="title-line title-line--top">EASHAN&apos;S</span>
            <span className="title-line title-line--bottom">QUEST</span>
          </h1>
          <p className="subtitle-hero screen-enter screen-enter--3">Jump · Dash · Conquer the Kingdom</p>
        </div>

        <div className="wood-sign menu-sign screen-enter screen-enter--4">
          <div className="wood-sign-post wood-sign-post--left" aria-hidden="true" />
          <div className="wood-sign-post wood-sign-post--right" aria-hidden="true" />
          <div className="wood-sign-board">
            {highScore > 0 && (
              <p className="menu-high-score">
                <span className="score-label">HIGH SCORE</span>
                <span className="score-value">{highScore.toString().padStart(6, '0')}</span>
              </p>
            )}

            {konamiMsg && <p className="menu-konami">{konamiMsg}</p>}

            <div className="feature-pills">
              <span className="pill pill-green">Double Jump</span>
              <span className="pill pill-green">Wall Jump</span>
              <span className="pill pill-red">Dash</span>
              <span className="pill pill-gold">Combos</span>
              <span className="pill pill-blue">Power-Ups</span>
            </div>

            <button type="button" className="btn-start-coin" onClick={() => start(0)}>
              <span className="btn-start-coin-inner">
                <span className="btn-start-coin-shine" />
                START ADVENTURE
              </span>
            </button>

            <div className="level-select">
              <p className="level-select-label">CHOOSE YOUR WORLD</p>
              <div className="level-select-grid">
                {playableLevels.map((level, index) => {
                  const unlocked = Storage.isLevelUnlocked(index);
                  const cleared = index < completedLevels;
                  return (
                    <button
                      key={level.name}
                      type="button"
                      className={`level-btn${unlocked ? '' : ' level-btn--locked'}${cleared ? ' level-btn--cleared' : ''}`}
                      disabled={!unlocked}
                      onClick={() => start(index)}
                      title={unlocked ? level.name : 'Complete previous world to unlock'}
                    >
                      {unlocked ? `${index + 1}` : '🔒'}
                    </button>
                  );
                })}
                {secretIndex >= 0 && secretUnlocked && (
                  <button
                    type="button"
                    className="level-btn level-btn--secret"
                    onClick={() => start(secretIndex)}
                    title="Star Chamber — secret level"
                  >
                    ★
                  </button>
                )}
              </div>
            </div>

            <div className="menu-options">
              <button
                type="button"
                className="btn-wood"
                onClick={() => {
                  UISounds.click();
                  onToggleSound();
                }}
              >
                {soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
              </button>
            </div>
          </div>
        </div>

        <p className="menu-press-start blink screen-enter screen-enter--5">▶ Press Start to Enter the World ◀</p>

        <div className="controls-sign wood-sign screen-enter screen-enter--6">
          <div className="wood-sign-board wood-sign-board--compact">
            <p className="controls-sign-title">CONTROLS</p>
            <div className="controls-grid">
              <div><kbd>←→</kbd> / <kbd>A D</kbd> Move</div>
              <div><kbd>Space</kbd> / <kbd>W</kbd> Jump ×2</div>
              <div><kbd>↓</kbd> / <kbd>S</kbd> Enter pipes</div>
              <div><kbd>Shift</kbd> / <kbd>K</kbd> Dash</div>
              <div><kbd>Z</kbd> / <kbd>J</kbd> Fire</div>
              <div><kbd>Esc</kbd> / <kbd>P</kbd> Pause</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
