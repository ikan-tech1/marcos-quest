import { GameBridge } from '../systems/GameBridge';

interface Props {
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export function PauseOverlay({ soundEnabled, onToggleSound }: Props) {
  return (
    <div className="overlay overlay-pause">
      <div className="glass-panel pause-panel">
        <h2 className="pause-title">PAUSED</h2>
        <div className="pause-actions">
          <button type="button" className="btn-primary" onClick={() => GameBridge.emit('resume-game')}>
            RESUME
          </button>
          <button type="button" className="btn-secondary" onClick={() => GameBridge.emit('restart-level')}>
            RESTART LEVEL
          </button>
          <button type="button" className="btn-secondary" onClick={onToggleSound}>
            SOUND: {soundEnabled ? 'ON' : 'OFF'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => GameBridge.emit('back-to-menu')}>
            QUIT TO MENU
          </button>
        </div>
        <p className="pause-hint">ESC / P to resume</p>
      </div>
    </div>
  );
}
