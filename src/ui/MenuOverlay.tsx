import { useEffect, useState } from 'react';
import { GameBridge } from '../systems/GameBridge';
import { Storage } from '../systems/Storage';
import { EasterEggs } from '../systems/EasterEggs';
import { LEVELS } from '../levels/levelData';

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
    GameBridge.emit('start-game', { levelIndex });
  };

  const completedLevels = Storage.getCompletedLevels();
  const playableLevels = LEVELS.filter((l) => !l.secret);
  const secretIndex = LEVELS.findIndex((l) => l.secret);

  return (
    <div className="overlay overlay-menu">
      <div className="menu-world-decor" aria-hidden="true">
        <div className="decor-qblock decor-qblock-left" />
        <div className="decor-qblock decor-qblock-right" />
        <div className="decor-coin decor-coin-1" />
        <div className="decor-coin decor-coin-2" />
        <div className="decor-coin decor-coin-3" />
        <div className="decor-brick decor-brick-1" />
        <div className="decor-brick decor-brick-2" />
      </div>

      <div className="menu-panel">
        <p className="menu-hero-tag">Welcome, Eashan!</p>
        <h1 className="title-3d">EASHAN&apos;S QUEST</h1>
        <p className="subtitle">Jump • Dash • Conquer</p>

        {highScore > 0 && (
          <p className="menu-high-score">
            HIGH SCORE: <strong>{highScore.toString().padStart(6, '0')}</strong>
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
            START GAME
          </span>
        </button>

        <div className="level-select">
          <p className="level-select-label">SELECT WORLD</p>
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
          <button type="button" className="btn-ghost" onClick={onToggleSound}>
            🔊 Sound: {soundEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <p className="menu-press-start blink">▶ Press to Begin ◀</p>

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
  );
}
