import type { HudState } from '../systems/GameBridge';

interface Props {
  hud: HudState;
}

export function HUD({ hud }: Props) {
  return (
    <div className="overlay overlay-hud">
      <div className="hud-bar">
        <div className="hud-stat">
          SCORE<br />
          <span>{hud.score.toString().padStart(6, '0')}</span>
        </div>
        <div className="hud-stat hud-center">
          {hud.world}
        </div>
        <div className="hud-stat" style={{ textAlign: 'right' }}>
          <span>{hud.coins.toString().padStart(2, '0')}</span> COINS<br />
          LIVES <span>{hud.lives}</span>
        </div>
      </div>
      {hud.combo > 1 && (
        <div className="hud-combo" key={hud.combo}>
          {hud.combo}x COMBO! ×{hud.comboMultiplier}
        </div>
      )}
    </div>
  );
}
