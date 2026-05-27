import { useState } from 'react';
import { GameBridge } from '../systems/GameBridge';
import { Storage } from '../systems/Storage';
import { EasterEggs, SECRET_DEFINITIONS } from '../systems/EasterEggs';
import { UISounds } from '../utils/uiSounds';
import { CharacterSelect } from './CharacterSelect';
import { MissionBoard } from './MissionBoard';
import { AchievementsGrid } from './AchievementsGrid';

interface Props {
  soundEnabled: boolean;
  isFullscreen?: boolean;
  hideCharacterSelect?: boolean;
  selectedCharacterId?: string;
  onCharacterChange?: (characterId: string) => void;
  onToggleSound: () => void;
  onToggleFullscreen?: () => void;
}

type PauseTab = 'resume' | 'missions' | 'achievements' | 'settings';

export function PauseOverlay({
  soundEnabled,
  isFullscreen = false,
  hideCharacterSelect = false,
  selectedCharacterId = Storage.getSelectedCharacter(),
  onCharacterChange,
  onToggleSound,
  onToggleFullscreen,
}: Props) {
  const [tab, setTab] = useState<PauseTab>('resume');
  const [characterId, setCharacterId] = useState(selectedCharacterId);
  const [cheatInput, setCheatInput] = useState('');
  const [cheatMsg, setCheatMsg] = useState('');

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

  const tryCheat = () => {
    const result = EasterEggs.tryCheatCode(cheatInput);
    if (result) {
      setCheatMsg(`${result} activated!`);
      UISounds.confirm();
    } else {
      setCheatMsg('Unknown code');
      UISounds.cancel();
    }
    setCheatInput('');
  };

  const discovered = EasterEggs.getDiscoveredSecrets();
  const tabs: { id: PauseTab; label: string }[] = [
    { id: 'resume', label: 'Resume' },
    { id: 'missions', label: 'Missions' },
    { id: 'achievements', label: 'Badges' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="overlay overlay-pause screen-enter">
      <div className="pause-backdrop" aria-hidden="true" />
      <div className="wood-sign pause-sign pause-sign--tabs">
        <div className="wood-sign-post wood-sign-post--left" aria-hidden="true" />
        <div className="wood-sign-post wood-sign-post--right" aria-hidden="true" />
        <div className="wood-sign-board">
          <h2 className="pause-title">⏸ PAUSED</h2>
          <nav className="pause-tabs" aria-label="Pause menu">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`pause-tab${tab === t.id ? ' pause-tab--active' : ''}`}
                onClick={() => {
                  UISounds.click();
                  if (t.id === 'resume') resume();
                  else setTab(t.id);
                }}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {tab === 'resume' && (
            <div className="pause-panel">
              <p className="pause-subtitle">The adventure waits...</p>
              {!hideCharacterSelect && (
                <CharacterSelect
                  compact
                  selectedId={characterId}
                  onSelect={(id) => {
                    setCharacterId(id);
                    onCharacterChange?.(id);
                  }}
                />
              )}
              <div className="pause-actions">
                <button type="button" className="btn-primary btn-primary--wide" onClick={resume}>
                  ▶ RESUME
                </button>
                <button type="button" className="btn-wood" onClick={restart}>
                  ↺ RESTART LEVEL
                </button>
                <button type="button" className="btn-wood btn-wood--danger" onClick={quit}>
                  ✕ QUIT TO MENU
                </button>
              </div>
            </div>
          )}

          {tab === 'missions' && (
            <div className="pause-panel pause-panel--scroll">
              <MissionBoard compact />
            </div>
          )}

          {tab === 'achievements' && (
            <div className="pause-panel pause-panel--scroll">
              <AchievementsGrid compact />
            </div>
          )}

          {tab === 'settings' && (
            <div className="pause-panel pause-panel--scroll">
              <div className="pause-actions">
                <button type="button" className="btn-wood" onClick={() => { UISounds.click(); onToggleSound(); }}>
                  {soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
                </button>
                {onToggleFullscreen && (
                  <button type="button" className="btn-wood" onClick={onToggleFullscreen}>
                    {isFullscreen ? '⛶ Exit Fullscreen' : '⛶ Enter Fullscreen (F)'}
                  </button>
                )}
              </div>
              <div className="cheat-panel">
                <p className="cheat-panel-label">CHEAT CODES</p>
                <div className="cheat-panel-row">
                  <input
                    type="text"
                    className="cheat-input"
                    value={cheatInput}
                    onChange={(e) => setCheatInput(e.target.value)}
                    placeholder="Enter code..."
                    maxLength={12}
                  />
                  <button type="button" className="btn-wood btn-wood--small" onClick={tryCheat}>
                    OK
                  </button>
                </div>
                {cheatMsg && <p className="cheat-msg">{cheatMsg}</p>}
                <p className="cheat-hint">Try: QUEST · COINS · STAR</p>
              </div>
              <div className="secrets-panel">
                <p className="secrets-panel-label">
                  SECRETS ({discovered.length}/{SECRET_DEFINITIONS.length})
                </p>
                <ul className="secrets-list">
                  {discovered.map((s) => (
                    <li key={s.id}>
                      <strong>{s.title}</strong> — {s.hint}
                    </li>
                  ))}
                  {discovered.length === 0 && <li className="secrets-empty">No secrets found yet...</li>}
                </ul>
              </div>
            </div>
          )}

          <p className="pause-hint">ESC / P to resume · F toggles fullscreen</p>
        </div>
      </div>
    </div>
  );
}
