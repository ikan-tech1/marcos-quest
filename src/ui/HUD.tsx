import type { HudState } from '../systems/GameBridge';
import type { ViewMode } from '../systems/Storage';
import { UISounds } from '../utils/uiSounds';

interface Props {
  hud: HudState;
  viewMode?: ViewMode;
  isFullscreen?: boolean;
  compact?: boolean;
  docked?: boolean;
  showControls?: boolean;
  onPause?: () => void;
  onToggleFullscreen?: () => void;
  onToggleViewMode?: () => void;
}

export function HUD({
  hud,
  viewMode = 'fullscreen',
  isFullscreen = false,
  compact = false,
  docked = false,
  showControls = false,
  onPause,
  onToggleFullscreen,
  onToggleViewMode,
}: Props) {
  const timeClass = hud.timeLeft <= 100 ? 'hud-time hud-time--warn' : 'hud-time';

  if (compact) {
    return (
      <div className={`overlay overlay-hud overlay-hud--compact${docked ? ' overlay-hud--docked' : ''}`}>
        <header className="hud-bar hud-bar--compact">
          <div className="hud-compact-group hud-compact-group--left">
            <span className="hud-compact-stat">
              <span className="hud-label">SCORE</span>
              <span className="hud-value">{hud.score.toString().padStart(6, '0')}</span>
            </span>
            <span className="hud-compact-stat">
              <span className="hud-coin-icon" aria-hidden="true" />
              <span className="hud-value">×{hud.coins.toString().padStart(2, '0')}</span>
            </span>
            <span className="hud-compact-stat">
              <span className="hud-label">LIVES</span>
              <span className="hud-value hud-value--lives">♥ {hud.lives}</span>
            </span>
          </div>

          <div className="hud-compact-group hud-compact-group--center">
            <span className="hud-world">{hud.world}</span>
            <span className={timeClass}>TIME {Math.ceil(hud.timeLeft)}</span>
            <div className="hud-progress" aria-label="Level progress">
              {Array.from({ length: hud.totalLevels }, (_, i) => (
                <span
                  key={i}
                  className={`hud-star${i === hud.levelIndex ? ' hud-star--active' : ''}${i < hud.levelIndex ? ' hud-star--done' : ''}`}
                />
              ))}
            </div>
          </div>

          {showControls && (
            <div className="hud-compact-group hud-compact-group--controls" aria-label="Game controls">
              {onToggleViewMode && (
                <button
                  type="button"
                  className="hud-icon-btn hud-icon-btn--view"
                  onClick={() => {
                    UISounds.click();
                    onToggleViewMode();
                  }}
                  aria-label={viewMode === 'arcade' ? 'Switch to fullscreen view' : 'Switch to arcade view'}
                  title={viewMode === 'arcade' ? 'Fullscreen view' : 'Arcade view'}
                >
                  {viewMode === 'arcade' ? '⛶' : '🕹'}
                </button>
              )}
              {onToggleFullscreen && (
                <button
                  type="button"
                  className="hud-icon-btn"
                  onClick={onToggleFullscreen}
                  aria-label={isFullscreen ? 'Exit browser fullscreen' : 'Enter browser fullscreen'}
                  title={isFullscreen ? 'Exit browser fullscreen (F / Esc)' : 'Browser fullscreen (F)'}
                >
                  {isFullscreen ? '⤢' : '▢'}
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
          )}
        </header>

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

  return (
    <div className="overlay overlay-hud">
      <header className="hud-bar">
        <div className="hud-plank hud-plank--left">
          <span className="hud-label">SCORE</span>
          <span className="hud-value">{hud.score.toString().padStart(6, '0')}</span>
          {hud.characterName ? (
            <span className="hud-character" title="Hero">
              ★ {hud.characterName}
            </span>
          ) : null}
        </div>

        <div className="hud-plank hud-plank--center">
          <span className="hud-world">{hud.world}</span>
          <div className={timeClass}>TIME {Math.ceil(hud.timeLeft)}</div>
          <div className="hud-progress" aria-label="Level progress">
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
            <span className="hud-value">×{hud.coins.toString().padStart(2, '0')}</span>
          </div>
          <div className="hud-stat-row">
            <span className="hud-label">LIVES</span>
            <span className="hud-value hud-value--lives">♥ {hud.lives}</span>
          </div>
        </div>
      </header>

      {showControls && (
        <div className="hud-controls" aria-label="Game controls">
          {onToggleViewMode && (
            <button
              type="button"
              className="hud-icon-btn hud-icon-btn--view"
              onClick={() => {
                UISounds.click();
                onToggleViewMode();
              }}
              aria-label={viewMode === 'arcade' ? 'Switch to fullscreen view' : 'Switch to arcade view'}
              title={viewMode === 'arcade' ? 'Fullscreen view' : 'Arcade view'}
            >
              {viewMode === 'arcade' ? '⛶' : '🕹'}
            </button>
          )}
          {onToggleFullscreen && (
            <button
              type="button"
              className="hud-icon-btn"
              onClick={onToggleFullscreen}
              aria-label={isFullscreen ? 'Exit browser fullscreen' : 'Enter browser fullscreen'}
              title={isFullscreen ? 'Exit browser fullscreen (F / Esc)' : 'Browser fullscreen (F)'}
            >
              {isFullscreen ? '⤢' : '▢'}
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
      )}

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
