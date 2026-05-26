import { GameBridge } from '../systems/GameBridge';

export function MenuOverlay() {
  const start = () => {
    GameBridge.emit('start-game');
  };

  return (
    <div className="overlay overlay-menu">
      <div className="glass-panel" style={{ textAlign: 'center', maxWidth: 520 }}>
        <h1 className="title-3d">MARCO&apos;S QUEST</h1>
        <p className="subtitle">A Next-Gen Platform Adventure</p>

        <div className="feature-pills">
          <span className="pill">Double Jump</span>
          <span className="pill">Wall Jump</span>
          <span className="pill">Dash</span>
          <span className="pill">Combos</span>
          <span className="pill">Power-Ups</span>
        </div>

        <button type="button" className="btn-primary" onClick={start}>
          START GAME
        </button>

        <div className="controls-grid">
          <div><kbd>←→</kbd> / <kbd>A D</kbd> Move</div>
          <div><kbd>Space</kbd> / <kbd>W</kbd> Jump ×2</div>
          <div><kbd>Shift</kbd> / <kbd>K</kbd> Dash</div>
          <div><kbd>Z</kbd> / <kbd>J</kbd> Fire</div>
        </div>
      </div>
    </div>
  );
}
