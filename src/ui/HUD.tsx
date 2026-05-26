import type { HudState } from '../systems/GameBridge';
import { UISounds } from '../utils/uiSounds';

interface Props {
  hud: HudState;
  isFullscreen?: boolean;
  onPause?: () => void;
  onToggleFullscreen?: () => void;
}

export function HUD({ hud, isFullscreen = false, onPause, onToggleFullscreen }: Props) {
  const timeClass = hud.timeLeft <= 100 ? 'hud-time hud-time--warn' : 'hud-time';

  return (
    <div className="overlay overlay-hud">
      <div className="hud-bar">
        <div className="hud-plank hud-plank--left">
          <span className="hud-label">SCORE</span>
          <span className="hud-value">{hud.score.toString().padStart(6, '0')}</span>
        </div>

        <div className="hud-plank hud-plank--center">
          <span className="hud-world">{hud.world}</span>
          <div className={timeClass}>TIME {Math.ceil(hud.timeLeft)}</div>
          <div className="hud-progress">
            {Array.from({ length: hud.totalLevels }, (_, i) => (
              <span
                key={i}
                className={`hud-star${i === hud.levelIndex ? ' hud-star--active' : ''}${i < hud.levelIndex ? ' hud-star--done' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="hud-plank hud-plank--right">
          <div className="hud-stat-row">
            <span className="hud-coin-icon" aria-hidden="true" />
            <span className="hud-value">{hud.coins.toString().padStart(2, '0')}</span>
          </div>
          <div className="hud-stat-row">
            <span className="hud-label">LIVES</span>
            <span className="hud-value hud-value--lives">{hud.lives}</span>
          </div>
          <div className="hud-high-score">HI {hud.highScore.toString().padStart(6, '0')}</div>
        </div>
      </div>

      <div className="hud-controls">
        {onToggleFullscreen && (
          <button
            type="button"
            className="hud-icon-btn"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={isFullscreen ? 'Exit fullscreen (F / Esc)' : 'Fullscreen (F)'}
          >
            {isFullscreen ? '⤢' : '⛶'}
          </button>
        )}
        {onPause && (
          <button
            type="button"
            className="hud-icon-btn"
            onClick={() => {
              UISounds.pause();
              onPause();
            }}
            aria-label="Pause game"
            title="Pause (Esc / P)"
          >
            ⏸
          </button>
        )}
      </div>

      {hud.combo > 1 && (
        <div className="hud-combo" key={hud.combo}>
          <span className="hud-combo-count">{hud.combo}×</span>
          <span className="hud-combo-text">COMBO!</span>
          <span className="hud-combo-mult">×{hud.comboMultiplier}</span>
        </div>
      )}
    </div>
  );
}
