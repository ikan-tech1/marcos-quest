import { GameBridge } from '../systems/GameBridge';
import type { GameOverState } from '../systems/GameBridge';
import { UISounds } from '../utils/uiSounds';

interface Props {
  state: GameOverState;
}

export function GameOverOverlay({ state }: Props) {
  return (
    <div className="overlay overlay-gameover overlay--fullscreen screen-enter">
      <div className="gameover-backdrop" aria-hidden="true" />
      <div className="wood-sign gameover-sign">
        <div className="wood-sign-post wood-sign-post--left" aria-hidden="true" />
        <div className="wood-sign-post wood-sign-post--right" aria-hidden="true" />
        <div className="wood-sign-board">
          <h2 className={`game-over-title ${state.won ? 'won' : 'lost'}`}>
            {state.won ? '🏆 VICTORY!' : '💀 GAME OVER'}
          </h2>

          <div className="gameover-stats">
            <div className="gameover-stat">
              <span className="gameover-stat-label">FINAL SCORE</span>
              <span className="gameover-stat-value">{state.score.toString().padStart(6, '0')}</span>
            </div>
            <div className="gameover-stat">
              <span className="gameover-stat-label">HIGH SCORE</span>
              <span className="gameover-stat-value">
                {state.highScore.toString().padStart(6, '0')}
                {state.isNewRecord && <span className="new-record"> NEW!</span>}
              </span>
            </div>
          </div>

          {state.won && (
            <p className="gameover-victory-msg">All worlds conquered — you are legendary!</p>
          )}

          <button
            type="button"
            className="btn-primary btn-primary--wide"
            onClick={() => {
              UISounds.confirm();
              GameBridge.emit('back-to-menu');
            }}
          >
            RETURN TO KINGDOM
          </button>
        </div>
      </div>
    </div>
  );
}
