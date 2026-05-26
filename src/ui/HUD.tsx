import type { HudState } from '../systems/GameBridge';

interface Props {
  hud: HudState;
  onPause?: () => void;
}

export function HUD({ hud, onPause }: Props) {
  const timeClass = hud.timeLeft <= 100 ? 'hud-time hud-time--warn' : 'hud-time';

  return (
    <div className="overlay overlay-hud">
      <div className="hud-bar">
        <div className="hud-stat">
          SCORE<br />
          <span>{hud.score.toString().padStart(6, '0')}</span>
        </div>
        <div className="hud-stat hud-center">
          {hud.world}
          <div className={`${timeClass}`}>TIME {Math.ceil(hud.timeLeft)}</div>
          <div className="hud-progress">
            {Array.from({ length: hud.totalLevels }, (_, i) => (
              <span
                key={i}
                className={`hud-dot${i === hud.levelIndex ? ' hud-dot--active' : ''}${i < hud.levelIndex ? ' hud-dot--done' : ''}`}
              />
            ))}
          </div>
        </div>
        <div className="hud-stat hud-stat-right">
          <span>{hud.coins.toString().padStart(2, '0')}</span> COINS<br />
          LIVES <span>{hud.lives}</span>
          <div className="hud-high-score">HI {hud.highScore.toString().padStart(6, '0')}</div>
        </div>
      </div>
      {onPause && (
        <button type="button" className="hud-pause-btn" onClick={onPause} aria-label="Pause game">
          ⏸
        </button>
      )}
      {hud.combo > 1 && (
        <div className="hud-combo" key={hud.combo}>
          {hud.combo}x COMBO! ×{hud.comboMultiplier}
        </div>
      )}
    </div>
  );
}
