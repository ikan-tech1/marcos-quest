import type { CSSProperties } from 'react';
import { GameBridge } from '../systems/GameBridge';
import { useEffect, useState } from 'react';

export function LevelClearOverlay() {
  const [bonus, setBonus] = useState(0);

  useEffect(() => {
    const unsub = GameBridge.on('hud', (data) => {
      const hud = data as { levelBonus?: number };
      if (hud.levelBonus) setBonus(hud.levelBonus);
    });
    return unsub;
  }, []);

  return (
    <div className="overlay overlay-level-clear screen-enter">
      <div className="level-clear-backdrop" aria-hidden="true" />
      <div className="level-clear-content">
        <div className="level-clear-banner">
          <span className="level-clear-star level-clear-star--1">★</span>
          <span className="level-clear-text">LEVEL CLEAR!</span>
          <span className="level-clear-star level-clear-star--2">★</span>
        </div>
        {bonus > 0 && (
          <p className="level-clear-sub">Time + flag bonus: +{bonus}</p>
        )}
        <p className="level-clear-sub">Get ready for the next world...</p>
        <div className="level-clear-sparkles" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="level-clear-sparkle" style={{ '--i': i } as CSSProperties} />
          ))}
        </div>
      </div>
    </div>
  );
}
