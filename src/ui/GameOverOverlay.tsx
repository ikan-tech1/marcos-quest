import { GameBridge } from '../systems/GameBridge';
import type { GameOverState } from '../systems/GameBridge';

interface Props {
  state: GameOverState;
}

export function GameOverOverlay({ state }: Props) {
  return (
    <div className="overlay overlay-menu">
      <div className="glass-panel" style={{ textAlign: 'center' }}>
        <h2 className={`game-over-title ${state.won ? 'won' : 'lost'}`}>
          {state.won ? 'YOU WIN!' : 'GAME OVER'}
        </h2>
        <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>
          Final Score: <strong style={{ color: 'var(--accent-gold)' }}>{state.score}</strong>
        </p>
        {state.won && (
          <p className="subtitle" style={{ marginBottom: 20 }}>
            All worlds conquered!
          </p>
        )}
        <button
          type="button"
          className="btn-primary"
          onClick={() => GameBridge.emit('back-to-menu')}
        >
          BACK TO MENU
        </button>
      </div>
    </div>
  );
}
