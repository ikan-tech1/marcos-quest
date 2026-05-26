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
    <div className="overlay overlay-hud level-clear-overlay">
      <div className="level-clear-banner">LEVEL CLEAR!</div>
      {bonus > 0 && <p className="level-clear-sub">Time + flag bonus: {bonus}</p>}
      <p className="level-clear-sub">Get ready for the next world...</p>
    </div>
  );
}
