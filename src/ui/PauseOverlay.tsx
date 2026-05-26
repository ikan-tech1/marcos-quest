import { GameBridge } from '../systems/GameBridge';
import { UISounds } from '../utils/uiSounds';

interface Props {
  soundEnabled: boolean;
  isFullscreen?: boolean;
  onToggleSound: () => void;
  onToggleFullscreen?: () => void;
}

export function PauseOverlay({
  soundEnabled,
  isFullscreen = false,
  onToggleSound,
  onToggleFullscreen,
}: Props) {
  const resume = () => {
    UISounds.confirm();
    GameBridge.emit('resume-game');
  };

  const restart = () => {
    UISounds.click();
    GameBridge.emit('restart-level');
  };

  const quit = () => {
    UISounds.cancel();
    GameBridge.emit('back-to-menu');
  };

  const toggleSound = () => {
    UISounds.click();
    onToggleSound();
  };

  return (
    <div className="overlay overlay-pause screen-enter">
      <div className="pause-backdrop" aria-hidden="true" />
      <div className="wood-sign pause-sign">
        <div className="wood-sign-post wood-sign-post--left" aria-hidden="true" />
        <div className="wood-sign-post wood-sign-post--right" aria-hidden="true" />
        <div className="wood-sign-board">
          <h2 className="pause-title">⏸ PAUSED</h2>
          <p className="pause-subtitle">The adventure waits...</p>
          <div className="pause-actions">
            <button type="button" className="btn-primary btn-primary--wide" onClick={resume}>
              ▶ RESUME
            </button>
            <button type="button" className="btn-wood" onClick={restart}>
              ↺ RESTART LEVEL
            </button>
            <button type="button" className="btn-wood" onClick={toggleSound}>
              {soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
            </button>
            {onToggleFullscreen && (
              <button type="button" className="btn-wood" onClick={onToggleFullscreen}>
                {isFullscreen ? '⛶ Exit Fullscreen' : '⛶ Enter Fullscreen (F)'}
              </button>
            )}
            <button type="button" className="btn-wood btn-wood--danger" onClick={quit}>
              ✕ QUIT TO MENU
            </button>
          </div>
          <p className="pause-hint">ESC / P to resume · F toggles fullscreen</p>
        </div>
      </div>
    </div>
  );
}
