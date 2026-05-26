import { GameBridge } from '../systems/GameBridge';

export function MenuOverlay() {
  const start = () => {
    GameBridge.emit('start-game');
  };

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
        <p className="subtitle">A Mushroom Kingdom Adventure</p>

        <div className="feature-pills">
          <span className="pill pill-green">Double Jump</span>
          <span className="pill pill-green">Wall Jump</span>
          <span className="pill pill-red">Dash</span>
          <span className="pill pill-gold">Combos</span>
          <span className="pill pill-blue">Power-Ups</span>
        </div>

        <button type="button" className="btn-start-coin" onClick={start}>
          <span className="btn-start-coin-inner">
            <span className="btn-start-coin-shine" />
            START GAME
          </span>
        </button>

        <p className="menu-press-start blink">▶ Press to Begin ◀</p>

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
