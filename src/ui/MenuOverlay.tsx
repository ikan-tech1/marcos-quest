import { useEffect, useState } from 'react';
import { GameBridge } from '../systems/GameBridge';
import { Storage } from '../systems/Storage';
import { EasterEggs } from '../systems/EasterEggs';
import { LEVELS } from '../levels/levelData';
import { UISounds } from '../utils/uiSounds';
import { CharacterSelect } from './CharacterSelect';
import { getCharacterById } from '../config/characters';
import type { ViewMode } from '../systems/Storage';
import type { GameModeId } from '../systems/gameModes';
import { GAME_MODES, getGameModeById } from '../systems/gameModes';
import { getTodayChallenge, getDailyStreak, isDailyCompleted } from '../systems/dailyChallenge';
import { MissionBoard } from './MissionBoard';
import { AchievementsGrid } from './AchievementsGrid';

interface Props {
  highScore: number;
  soundEnabled: boolean;
  viewMode: ViewMode;
  levelError?: string | null;
  onDismissLevelError?: () => void;
  onToggleSound: () => void;
  onToggleViewMode: () => void;
}

export function MenuOverlay({
  highScore,
  soundEnabled,
  viewMode,
  levelError,
  onDismissLevelError,
  onToggleSound,
  onToggleViewMode,
}: Props) {
  const [konamiMsg, setKonamiMsg] = useState('');
  const [characterId, setCharacterId] = useState(Storage.getSelectedCharacter());
  const [gameMode, setGameMode] = useState<GameModeId>(Storage.getGameMode());
  const [menuSection, setMenuSection] = useState<'play' | 'missions' | 'achievements'>('play');
  const secretUnlocked = EasterEggs.isSecretLevelUnlocked();
  const hero = getCharacterById(characterId);
  const daily = getTodayChallenge();
  const dailyDone = isDailyCompleted();
  const streak = getDailyStreak();
  const modeConfig = getGameModeById(gameMode);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (EasterEggs.handleKey(e.code)) {
        setKonamiMsg('Konami code! +3 lives on next run');
        EasterEggs.unlock('konami');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const start = (levelIndex = 0, opts?: { dailyChallenge?: boolean }) => {
    UISounds.confirm();
    Storage.setGameMode(gameMode);
    GameBridge.emit('start-game', {
      levelIndex,
      characterId,
      gameMode,
      dailyChallenge: opts?.dailyChallenge,
    });
  };

  const selectMode = (mode: GameModeId) => {
    UISounds.click();
    setGameMode(mode);
    Storage.setGameMode(mode);
  };

  const completedLevels = Storage.getCompletedLevels();
  const playableLevels = LEVELS.filter((l) => !l.secret);
  const secretIndex = LEVELS.findIndex((l) => l.secret);
  const allowLevelSelect = gameMode === 'adventure';

  return (
    <div className="overlay overlay-menu overlay--fullscreen screen-enter">
      <div className="menu-vignette" aria-hidden="true" />

      {levelError && (
        <div className="level-error-banner" role="alert">
          <p>{levelError}</p>
          <button type="button" className="btn-wood btn-wood--small" onClick={onDismissLevelError}>
            Dismiss
          </button>
        </div>
      )}

      <div className="menu-hero">
        <div className="menu-title-block">
          <p className="menu-hero-tag screen-enter screen-enter--1">
            ★ Playing as {hero.name} ★
          </p>
          <h1 className="title-hero screen-enter screen-enter--2">
            <span className="title-line title-line--top">EASHAN&apos;S</span>
            <span className="title-line title-line--bottom">QUEST</span>
          </h1>
          <p className="subtitle-hero screen-enter screen-enter--3">Jump · Dash · Conquer the Kingdom</p>
        </div>

        <div className="wood-sign menu-sign screen-enter screen-enter--4">
          <div className="wood-sign-post wood-sign-post--left" aria-hidden="true" />
          <div className="wood-sign-post wood-sign-post--right" aria-hidden="true" />
          <div className="wood-sign-board wood-sign-board--menu">
            {(highScore > 0 || konamiMsg) && (
              <div className="menu-sign-meta">
                {highScore > 0 && (
                  <p className="menu-high-score">
                    <span className="score-label">HIGH SCORE</span>
                    <span className="score-value">{highScore.toString().padStart(6, '0')}</span>
                  </p>
                )}
                {konamiMsg && <p className="menu-konami">{konamiMsg}</p>}
              </div>
            )}

            <section className="sign-section sign-section--hero" aria-label="Character selection">
              <CharacterSelect selectedId={characterId} onSelect={setCharacterId} />
            </section>

            <div className="sign-divider" aria-hidden="true" />

            <section className="sign-section sign-section--modes" aria-label="Game mode">
              <p className="level-select-label">GAME MODE</p>
              <div className="mode-select-grid">
                {GAME_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    className={`mode-chip${gameMode === mode.id ? ' mode-chip--active' : ''}`}
                    onClick={() => selectMode(mode.id)}
                    title={mode.description}
                    style={{ '--mode-color': mode.badgeColor } as React.CSSProperties}
                  >
                    <span className="mode-chip-icon">{mode.icon}</span>
                    <span className="mode-chip-name">{mode.name}</span>
                  </button>
                ))}
              </div>
              <p className="mode-desc">{modeConfig.description}</p>
            </section>

            <div className="sign-divider" aria-hidden="true" />

            <section className="sign-section sign-section--daily" aria-label="Daily challenge">
              <div className={`daily-card${dailyDone ? ' daily-card--done' : ''}`}>
                <div className="daily-card-header">
                  <span className="daily-card-badge">DAILY</span>
                  <span className="daily-card-date">{daily.dateKey}</span>
                  {streak > 0 && <span className="daily-card-streak">🔥 {streak} day streak</span>}
                </div>
                <h3 className="daily-card-title">{daily.label}</h3>
                <p className="daily-card-desc">{daily.description}</p>
                <p className="daily-card-reward">Reward: {daily.rewardScore.toLocaleString()} pts</p>
                <button
                  type="button"
                  className="btn-wood btn-wood--daily"
                  disabled={dailyDone}
                  onClick={() => start(daily.levelIndex, { dailyChallenge: true })}
                >
                  {dailyDone ? '✓ Completed Today' : '▶ Play Daily Challenge'}
                </button>
              </div>
            </section>

            <div className="sign-divider" aria-hidden="true" />

            <section className="sign-section sign-section--nav">
              <div className="menu-nav-tabs">
                <button
                  type="button"
                  className={`menu-nav-tab${menuSection === 'play' ? ' menu-nav-tab--active' : ''}`}
                  onClick={() => setMenuSection('play')}
                >
                  Play
                </button>
                <button
                  type="button"
                  className={`menu-nav-tab${menuSection === 'missions' ? ' menu-nav-tab--active' : ''}`}
                  onClick={() => setMenuSection('missions')}
                >
                  Missions
                </button>
                <button
                  type="button"
                  className={`menu-nav-tab${menuSection === 'achievements' ? ' menu-nav-tab--active' : ''}`}
                  onClick={() => setMenuSection('achievements')}
                >
                  Achievements
                </button>
              </div>
            </section>

            {menuSection === 'missions' && (
              <section className="sign-section">
                <MissionBoard />
              </section>
            )}

            {menuSection === 'achievements' && (
              <section className="sign-section">
                <AchievementsGrid />
              </section>
            )}

            {menuSection === 'play' && (
            <>
            <div className="sign-divider" aria-hidden="true" />

            <section className="sign-section sign-section--start">
              <button type="button" className="btn-start-coin" onClick={() => start(0)}>
                <span className="btn-start-coin-inner">
                  <span className="btn-start-coin-shine" />
                  {gameMode === 'adventure' ? 'START ADVENTURE' : `START ${modeConfig.name.toUpperCase()}`}
                </span>
              </button>
            </section>

            {allowLevelSelect && (
            <>
            <div className="sign-divider" aria-hidden="true" />

            <section className="sign-section sign-section--world" aria-label="World selection">
              <div className="level-select">
                <p className="level-select-label">CHOOSE YOUR WORLD</p>
                <div className="level-select-grid">
                  {playableLevels.map((level, index) => {
                    const unlocked = Storage.isLevelUnlocked(index);
                    const cleared = index < completedLevels;
                    return (
                      <button
                        key={level.name}
                        type="button"
                        className={`level-coin${unlocked ? '' : ' level-coin--locked'}${cleared ? ' level-coin--cleared' : ''}`}
                        disabled={!unlocked}
                        onClick={() => start(index)}
                        title={unlocked ? level.name : 'Complete previous world to unlock'}
                        aria-label={unlocked ? level.name : `${level.name} — locked`}
                      >
                        <span className="level-coin-face">
                          {unlocked ? (
                            <span className="level-coin-num">{index + 1}</span>
                          ) : (
                            <span className="level-coin-lock" aria-hidden="true">🔒</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                  {secretIndex >= 0 && secretUnlocked && (
                    <button
                      type="button"
                      className="level-coin level-coin--secret"
                      onClick={() => start(secretIndex)}
                      title="Star Chamber — secret level"
                      aria-label="Star Chamber — secret level"
                    >
                      <span className="level-coin-face">
                        <span className="level-coin-num">★</span>
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </section>
            </>
            )}
            </>
            )}

            <div className="sign-divider sign-divider--subtle" aria-hidden="true" />

            <section className="sign-section sign-section--features" aria-label="Game features">
              <div className="feature-pills feature-pills--compact">
                <span className="pill pill-green">2× Jump</span>
                <span className="pill pill-green">Wall</span>
                <span className="pill pill-red">Dash</span>
                <span className="pill pill-gold">Combo</span>
                <span className="pill pill-blue">Power</span>
              </div>
            </section>

            <section className="sign-section sign-section--options" aria-label="Settings">
              <div className="menu-options">
                <button
                  type="button"
                  className={`menu-toggle${soundEnabled ? ' menu-toggle--on' : ''}`}
                  onClick={() => {
                    UISounds.click();
                    onToggleSound();
                  }}
                  aria-pressed={soundEnabled}
                >
                  <span className="menu-toggle-plate">
                    <span className="menu-toggle-knob" />
                  </span>
                  <span className="menu-toggle-label">
                    {soundEnabled ? 'Sound ON' : 'Sound OFF'}
                  </span>
                </button>
                <button
                  type="button"
                  className={`menu-toggle menu-toggle--arcade${viewMode === 'arcade' ? ' menu-toggle--on' : ''}`}
                  onClick={() => {
                    UISounds.click();
                    onToggleViewMode();
                  }}
                  aria-pressed={viewMode === 'arcade'}
                >
                  <span className="menu-toggle-plate">
                    <span className="menu-toggle-knob" />
                  </span>
                  <span className="menu-toggle-label">
                    {viewMode === 'arcade' ? 'Arcade ON' : 'Arcade OFF'}
                  </span>
                </button>
              </div>
            </section>
          </div>
        </div>

        <div className="controls-sign wood-sign wood-sign--hanging screen-enter screen-enter--5">
          <div className="wood-sign-rope wood-sign-rope--left" aria-hidden="true" />
          <div className="wood-sign-rope wood-sign-rope--right" aria-hidden="true" />
          <div className="wood-sign-post wood-sign-post--left" aria-hidden="true" />
          <div className="wood-sign-post wood-sign-post--right" aria-hidden="true" />
          <div className="wood-sign-board wood-sign-board--controls">
            <p className="menu-press-start menu-press-start--on-sign">
              <span className="menu-press-start-glow" aria-hidden="true" />
              ▶ Press Start to Enter the World ◀
            </p>
            <p className="controls-sign-title">CONTROLS</p>
            <div className="controls-grid" role="list">
              <div className="control-cell" role="listitem">
                <span className="control-icon" aria-hidden="true">⇄</span>
                <div className="control-keys">
                  <kbd className="kbd-chip">←→</kbd>
                  <span className="control-keys-sep">/</span>
                  <kbd className="kbd-chip">A D</kbd>
                </div>
                <span className="control-label">Move</span>
              </div>
              <div className="control-cell" role="listitem">
                <span className="control-icon" aria-hidden="true">↑</span>
                <div className="control-keys">
                  <kbd className="kbd-chip">Space</kbd>
                  <span className="control-keys-sep">/</span>
                  <kbd className="kbd-chip">W</kbd>
                </div>
                <span className="control-label">Jump ×2</span>
              </div>
              <div className="control-cell" role="listitem">
                <span className="control-icon" aria-hidden="true">★</span>
                <div className="control-keys">
                  <kbd className="kbd-chip">Shift</kbd>
                  <span className="control-keys-sep">/</span>
                  <kbd className="kbd-chip">K</kbd>
                </div>
                <span className="control-label">Dash</span>
              </div>
              <div className="control-cell" role="listitem">
                <span className="control-icon" aria-hidden="true">●</span>
                <div className="control-keys">
                  <kbd className="kbd-chip">Z</kbd>
                  <span className="control-keys-sep">/</span>
                  <kbd className="kbd-chip">J</kbd>
                </div>
                <span className="control-label">Fire</span>
              </div>
              <div className="control-cell" role="listitem">
                <span className="control-icon" aria-hidden="true">↓</span>
                <div className="control-keys">
                  <kbd className="kbd-chip">↓</kbd>
                  <span className="control-keys-sep">/</span>
                  <kbd className="kbd-chip">S</kbd>
                </div>
                <span className="control-label">Pipes</span>
              </div>
              <div className="control-cell" role="listitem">
                <span className="control-icon" aria-hidden="true">‖</span>
                <div className="control-keys">
                  <kbd className="kbd-chip">Esc</kbd>
                  <span className="control-keys-sep">/</span>
                  <kbd className="kbd-chip">P</kbd>
                </div>
                <span className="control-label">Pause</span>
              </div>
              <div className="control-cell" role="listitem">
                <span className="control-icon" aria-hidden="true">▣</span>
                <div className="control-keys">
                  <kbd className="kbd-chip">F</kbd>
                </div>
                <span className="control-label">Fullscreen</span>
              </div>
              <div className="control-cell" role="listitem">
                <span className="control-icon" aria-hidden="true">▶</span>
                <div className="control-keys">
                  <kbd className="kbd-chip">Enter</kbd>
                </div>
                <span className="control-label">Start</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
