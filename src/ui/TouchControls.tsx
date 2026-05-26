import { useCallback, useEffect } from 'react';
import { VirtualInput } from '../systems/VirtualInput';

function bindButton(
  onDown: () => void,
  onUp: () => void,
): { onPointerDown: (e: React.PointerEvent) => void; onPointerUp: () => void; onPointerLeave: () => void } {
  return {
    onPointerDown: (e) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      onDown();
    },
    onPointerUp: () => onUp(),
    onPointerLeave: () => onUp(),
  };
}

export function TouchControls() {
  const releaseAll = useCallback(() => {
    VirtualInput.left = false;
    VirtualInput.right = false;
    VirtualInput.setJump(false);
  }, []);

  useEffect(() => () => releaseAll(), [releaseAll]);

  const left = bindButton(
    () => { VirtualInput.left = true; },
    () => { VirtualInput.left = false; },
  );
  const right = bindButton(
    () => { VirtualInput.right = true; },
    () => { VirtualInput.right = false; },
  );
  const jump = bindButton(
    () => VirtualInput.setJump(true),
    () => VirtualInput.setJump(false),
  );
  const dash = bindButton(
    () => VirtualInput.setDash(),
    () => undefined,
  );
  const fire = bindButton(
    () => VirtualInput.setFire(),
    () => undefined,
  );

  return (
    <div className="touch-controls" aria-label="Touch controls">
      <div className="touch-dpad">
        <button type="button" className="touch-btn touch-btn-left touch-btn--block" aria-label="Move left" {...left}>
          ◀
        </button>
        <button type="button" className="touch-btn touch-btn-right touch-btn--block" aria-label="Move right" {...right}>
          ▶
        </button>
      </div>
      <div className="touch-actions">
        <button type="button" className="touch-btn touch-btn-dash touch-btn--wood" aria-label="Dash" {...dash}>
          DASH
        </button>
        <button type="button" className="touch-btn touch-btn-jump touch-btn--coin" aria-label="Jump" {...jump}>
          JUMP
        </button>
        <button type="button" className="touch-btn touch-btn-fire touch-btn--wood" aria-label="Fire" {...fire}>
          FIRE
        </button>
      </div>
    </div>
  );
}
