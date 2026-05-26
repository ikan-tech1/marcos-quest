import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameScreen, HudState } from '../systems/GameBridge';
import { GameBridge } from '../systems/GameBridge';
import type { ViewLayout } from '../config/cabinetLayout';
import { Storage } from '../systems/Storage';
import { VirtualInput } from '../systems/VirtualInput';
import { EasterEggs } from '../systems/EasterEggs';
import { UISounds } from '../utils/uiSounds';
import { CharacterSelectCabinet } from './CharacterSelect';

const HERO_TAGLINES = [
  'Jump · Dash · Conquer',
  'Coins unlock extra lives',
  'Blaze form shoots fireballs',
  'Secret pipes hide bonus worlds',
  'Stomp combos multiply score',
  'Hold dash for wall jumps',
];

const KINGDOM_FACTS = [
  'Tip: Chain stomps for combo multipliers!',
  'Fact: 100 coins earns an extra life.',
  'Tip: Look for hidden 1-up blocks.',
  'Fact: The secret level hides behind a pipe.',
  'Tip: Dash into walls to wall-jump.',
  'Fact: Flag height affects your bonus.',
  'Tip: Konami code grants +3 lives!',
  'Fact: Each hero has unique stats.',
];

type CrtFlash = 'jump' | 'dash' | 'fire' | 'no-fire' | 'color-test' | null;
type JoystickDir = 'left' | 'right' | 'up' | 'down' | null;
type PressedBtn = 'a' | 'b' | 'fire' | 'start' | null;

interface Props {
  layout: ViewLayout;
  hud: HudState;
  screen: GameScreen;
  isPlaying: boolean;
  isBrowserFullscreen: boolean;
  onPause: () => void;
  onToggleBrowserFullscreen: () => void;
  onToggleViewMode: () => void;
  onCharacterChange?: (characterId: string) => void;
  onCrtFlash?: (flash: CrtFlash) => void;
  onCabinetBonus?: () => void;
}

export function ArcadeCabinet({
  layout,
  hud,
  screen,
  isPlaying,
  isBrowserFullscreen,
  onPause,
  onToggleBrowserFullscreen,
  onToggleViewMode,
  onCharacterChange,
  onCrtFlash,
  onCabinetBonus,
}: Props) {
  const prevCoins = useRef(hud.coins);
  const coinInsertCount = useRef(0);
  const coinInsertTimer = useRef<number | null>(null);
  const speakerClicks = useRef<number[]>([]);
  const pauseStartClicks = useRef<number[]>([]);
  const bonusLevelRef = useRef(hud.levelIndex);

  const [coinPulse, setCoinPulse] = useState(false);
  const [characterId, setCharacterId] = useState(Storage.getSelectedCharacter());
  const [pressedBtn, setPressedBtn] = useState<PressedBtn>(null);
  const [joystickDir, setJoystickDir] = useState<JoystickDir>(null);
  const [joystickWobble, setJoystickWobble] = useState(false);
  const [crtMessage, setCrtMessage] = useState<string | null>(null);
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [freePlay, setFreePlay] = useState(false);
  const [konamiMsg, setKonamiMsg] = useState('');
  const [sideTip, setSideTip] = useState<string | null>(null);
  const [showCredits, setShowCredits] = useState(false);
  const [scoreFlash, setScoreFlash] = useState(false);
  const [coinBonusUsed, setCoinBonusUsed] = useState(false);

  const showAttract = screen === 'paused';
  const showInsertCoin = screen === 'game-over' && hud.lives <= 0;
  const isActiveGameplay = screen === 'playing';

  useEffect(() => {
    if (hud.levelIndex !== bonusLevelRef.current) {
      bonusLevelRef.current = hud.levelIndex;
      setCoinBonusUsed(false);
    }
  }, [hud.levelIndex]);

  useEffect(() => {
    if (hud.coins > prevCoins.current) {
      setCoinPulse(true);
      const t = window.setTimeout(() => setCoinPulse(false), 600);
      prevCoins.current = hud.coins;
      return () => window.clearTimeout(t);
    }
    prevCoins.current = hud.coins;
  }, [hud.coins]);

  const flashCrt = useCallback(
    (msg: string, type: CrtFlash, duration = 700) => {
      setCrtMessage(msg);
      onCrtFlash?.(type);
      window.setTimeout(() => {
        setCrtMessage(null);
        if (type !== 'color-test') onCrtFlash?.(null);
      }, duration);
    },
    [onCrtFlash],
  );

  const pressButton = useCallback((btn: PressedBtn, fn: () => void) => {
    setPressedBtn(btn);
    fn();
    window.setTimeout(() => setPressedBtn(null), 140);
  }, []);

  const tryKonami = useCallback((code: string) => {
    if (EasterEggs.handleKey(code)) {
      setKonamiMsg('KONAMI! +3 LIVES');
      UISounds.secretJingle();
      window.setTimeout(() => setKonamiMsg(''), 4000);
    }
  }, []);

  const nudgeJoystick = useCallback(
    (dir: JoystickDir) => {
      setJoystickDir(dir);
      setJoystickWobble(true);
      window.setTimeout(() => {
        setJoystickDir(null);
        setJoystickWobble(false);
      }, 320);

      if (dir === 'left') VirtualInput.left = true;
      if (dir === 'right') VirtualInput.right = true;
      window.setTimeout(() => {
        if (dir === 'left') VirtualInput.left = false;
        if (dir === 'right') VirtualInput.right = false;
      }, 200);

      if (dir === 'up') tryKonami('ArrowUp');
      if (dir === 'down') tryKonami('ArrowDown');
      if (dir === 'left') tryKonami('ArrowLeft');
      if (dir === 'right') tryKonami('ArrowRight');

      UISounds.click();
    },
    [tryKonami],
  );

  const handleJump = useCallback(() => {
    UISounds.jump();
    if (isActiveGameplay) {
      VirtualInput.setJump(true);
      window.setTimeout(() => VirtualInput.setJump(false), 120);
      flashCrt('JUMP!', 'jump');
    } else {
      UISounds.click();
    }
  }, [flashCrt, isActiveGameplay]);

  const handleDash = useCallback(() => {
    UISounds.dash();
    if (isActiveGameplay) {
      VirtualInput.setDash();
      flashCrt('DASH!', 'dash');
    }
  }, [flashCrt, isActiveGameplay]);

  const handleFire = useCallback(() => {
    if (isActiveGameplay && hud.canFire) {
      UISounds.fire();
      VirtualInput.setFire();
      flashCrt('FIRE!', 'fire');
    } else if (isActiveGameplay) {
      UISounds.noFire();
      flashCrt('NO FIRE', 'no-fire');
    } else {
      UISounds.noFire();
    }
  }, [flashCrt, hud.canFire, isActiveGameplay]);

  const handleStart = useCallback(() => {
    UISounds.start();
    if (screen === 'paused') {
      pauseStartClicks.current.push(Date.now());
      const recent = pauseStartClicks.current.filter((t) => Date.now() - t < 2500);
      pauseStartClicks.current = recent;
      if (recent.length >= 3) {
        pauseStartClicks.current = [];
        onCrtFlash?.('color-test');
        flashCrt('COLOR TEST', 'color-test', 5000);
        window.setTimeout(() => onCrtFlash?.(null), 5000);
        return;
      }
      GameBridge.emit('resume-game');
      return;
    }
    if (screen === 'playing') {
      onPause();
    }
  }, [flashCrt, onCrtFlash, onPause, screen]);

  const handleCoinInsert = useCallback(() => {
    UISounds.coin();
    setCoinPulse(true);
    window.setTimeout(() => setCoinPulse(false), 600);

    coinInsertCount.current += 1;
    if (coinInsertTimer.current) window.clearTimeout(coinInsertTimer.current);
    coinInsertTimer.current = window.setTimeout(() => {
      coinInsertCount.current = 0;
    }, 3000);

    if (coinInsertCount.current >= 10) {
      coinInsertCount.current = 0;
      setFreePlay(true);
      UISounds.secretJingle();
      window.setTimeout(() => setFreePlay(false), 5000);
    }

    if (isActiveGameplay && !coinBonusUsed) {
      setCoinBonusUsed(true);
      setScoreFlash(true);
      onCabinetBonus?.();
      window.setTimeout(() => setScoreFlash(false), 900);
      flashCrt('+100', 'jump', 900);
    }
  }, [coinBonusUsed, flashCrt, isActiveGameplay, onCabinetBonus]);

  const handleSpeakerClick = useCallback(() => {
    UISounds.click();
    const now = Date.now();
    speakerClicks.current = speakerClicks.current.filter((t) => now - t < 1200);
    speakerClicks.current.push(now);
    if (speakerClicks.current.length >= 5) {
      speakerClicks.current = [];
      UISounds.secretJingle();
      flashCrt('DEV MODE', 'fire', 2000);
      setKonamiMsg('Built with ★ by Eashan');
      window.setTimeout(() => setKonamiMsg(''), 3000);
    }
  }, [flashCrt]);

  const handleMarqueeClick = useCallback(() => {
    UISounds.click();
    setTaglineIdx((i) => (i + 1) % HERO_TAGLINES.length);
  }, []);

  const handleSideArtClick = useCallback((side: 'left' | 'right') => {
    UISounds.click();
    const fact = KINGDOM_FACTS[Math.floor(Math.random() * KINGDOM_FACTS.length)];
    setSideTip(`${side === 'left' ? '◀' : '▶'} ${fact}`);
    window.setTimeout(() => setSideTip(null), 3500);
  }, []);

  const handleCharacterChange = (id: string) => {
    setCharacterId(id);
    onCharacterChange?.(id);
  };

  const handleBtnKonami = (code: string) => {
    tryKonami(code);
  };

  const maxLives = 3;
  const marqueeHero = konamiMsg || (freePlay ? 'FREE PLAY!' : hud.characterName);
  const marqueeTagline = HERO_TAGLINES[taglineIdx];

  return (
    <div
      className={`arcade-cabinet${isPlaying ? ' arcade-cabinet--active' : ''}${showInsertCoin ? ' arcade-cabinet--insert-coin' : ''}`}
      style={{
        width: layout.cabinetW,
        height: layout.cabinetH,
        left: layout.cabinetLeft,
        top: layout.cabinetTop,
        '--cabinet-game-w': `${layout.scaledW}px`,
        '--cabinet-game-h': `${layout.scaledH}px`,
      } as React.CSSProperties}
    >
      <div className="cabinet-glow" aria-hidden="true" />
      <div className="cabinet-crt-flicker" aria-hidden="true" />

      {showCredits && (
        <div className="cabinet-dev-credits" role="dialog" aria-label="Developer credits">
          <p className="cabinet-dev-credits-title">EASHAN&apos;S QUEST</p>
          <p>Design · Code · Kingdom</p>
          <p className="cabinet-dev-credits-name">Eashan Gupta</p>
          <p className="cabinet-dev-credits-sub">Phaser · React · Vite</p>
          <button type="button" className="cabinet-dev-credits-close" onClick={() => setShowCredits(false)}>
            CLOSE
          </button>
        </div>
      )}

      {sideTip && (
        <div className="cabinet-side-tip" role="status">
          {sideTip}
        </div>
      )}

      {crtMessage && (
        <div className={`cabinet-crt-flash cabinet-crt-flash--${crtMessage.replace(/\s+/g, '-').toLowerCase()}`} aria-hidden="true">
          {crtMessage}
        </div>
      )}

      {scoreFlash && (
        <div className="cabinet-score-bonus" aria-hidden="true">
          +100
        </div>
      )}

      <header className="cabinet-marquee">
        <button
          type="button"
          className="cabinet-marquee-neon cabinet-marquee-neon--clickable"
          onClick={handleMarqueeClick}
          aria-label="Cycle hero taglines"
          title="Click for tips"
        >
          <span className="cabinet-neon-line cabinet-neon-line--top">EASHAN&apos;S</span>
          <span className="cabinet-neon-line cabinet-neon-line--bottom">QUEST</span>
          {marqueeHero && (
            <span className={`cabinet-neon-hero${freePlay ? ' cabinet-neon-hero--free-play' : ''}`}>
              {marqueeHero}
            </span>
          )}
          <span className="cabinet-neon-tagline">{marqueeTagline}</span>
        </button>
        <div className="cabinet-marquee-world">{hud.world || 'WORLD 1-1'}</div>
        <div className="cabinet-marquee-stats" aria-label="Game stats">
          <span className="cabinet-marquee-stat">
            <span className="cabinet-marquee-stat-label">SCORE</span>
            <span className={`cabinet-marquee-stat-value${scoreFlash ? ' cabinet-marquee-stat-value--pulse' : ''}`}>
              {hud.score.toString().padStart(6, '0')}
            </span>
          </span>
          <span className="cabinet-marquee-stat">
            <span className="cabinet-marquee-stat-label">TIME</span>
            <span className={`cabinet-marquee-stat-value${hud.timeLeft <= 100 ? ' cabinet-marquee-stat-value--warn' : ''}`}>
              {Math.ceil(hud.timeLeft)}
            </span>
          </span>
          <span className="cabinet-marquee-stat">
            <span className="cabinet-marquee-stat-label">COINS</span>
            <span className="cabinet-marquee-stat-value">×{hud.coins.toString().padStart(2, '0')}</span>
          </span>
          <span className="cabinet-marquee-stat">
            <span className="cabinet-marquee-stat-label">LIVES</span>
            <span className="cabinet-marquee-stat-value cabinet-marquee-stat-value--lives">♥ {hud.lives}</span>
          </span>
        </div>
        <div className="cabinet-marquee-actions">
          <button
            type="button"
            className="cabinet-btn cabinet-btn--view"
            onClick={() => {
              UISounds.click();
              onToggleViewMode();
            }}
            aria-label="Switch to fullscreen view"
            title="Fullscreen view"
          >
            ⛶
          </button>
          <button
            type="button"
            className="cabinet-btn"
            onClick={() => {
              UISounds.pause();
              onPause();
            }}
            aria-label="Pause game"
            title="Pause (Esc / P)"
          >
            ⏸
          </button>
          <button
            type="button"
            className="cabinet-btn"
            onClick={() => {
              UISounds.click();
              onToggleBrowserFullscreen();
            }}
            aria-label={isBrowserFullscreen ? 'Exit browser fullscreen' : 'Enter browser fullscreen'}
            title={isBrowserFullscreen ? 'Exit browser fullscreen (F)' : 'Browser fullscreen (F)'}
          >
            {isBrowserFullscreen ? '⤢' : '▢'}
          </button>
        </div>
      </header>

      <div className="cabinet-body">
        <aside className="cabinet-side cabinet-side--left">
          <button
            type="button"
            className="cabinet-side-art cabinet-side-art--clickable"
            onClick={() => handleSideArtClick('left')}
            aria-label="Kingdom tip"
          >
            <div className="side-art-castle" />
            <div className="side-art-hill" />
            <div className="side-art-coin" />
            <div className="side-art-pipe" />
          </button>
          <button
            type="button"
            className="cabinet-screw cabinet-screw--left"
            onClick={() => {
              UISounds.click();
              setShowCredits(true);
            }}
            aria-label="Hidden screw"
            title=""
          />
        </aside>

        <div className="cabinet-screen-wrap">
          <div className="cabinet-bezel">
            <div
              className="cabinet-crt cabinet-crt--hole"
              style={{
                width: layout.scaledW,
                height: layout.scaledH,
              }}
            >
              <div className="cabinet-crt-vignette" aria-hidden="true" />
            </div>
          </div>

          <div className="cabinet-bezel-score">
            <span className="cabinet-bezel-label">SCORE</span>
            <span className={`cabinet-bezel-value${scoreFlash ? ' cabinet-bezel-value--pulse' : ''}`}>
              {hud.score.toString().padStart(6, '0')}
            </span>
            <span className="cabinet-bezel-time">T {Math.ceil(hud.timeLeft)}</span>
            <span className="cabinet-bezel-hi">HI {hud.highScore.toString().padStart(6, '0')}</span>
          </div>
        </div>

        <aside className="cabinet-side cabinet-side--right">
          <button
            type="button"
            className="cabinet-side-art cabinet-side-art--mirror cabinet-side-art--clickable"
            onClick={() => handleSideArtClick('right')}
            aria-label="Kingdom tip"
          >
            <div className="side-art-castle" />
            <div className="side-art-hill" />
            <div className="side-art-coin" />
            <div className="side-art-pipe" />
          </button>
          <button
            type="button"
            className="cabinet-screw cabinet-screw--right"
            onClick={() => {
              UISounds.click();
              setShowCredits(true);
            }}
            aria-label="Hidden screw"
            title=""
          />
        </aside>
      </div>

      <footer className="cabinet-controls">
        <button
          type="button"
          className="cabinet-speaker cabinet-speaker--left"
          onClick={handleSpeakerClick}
          aria-label="Speaker grille"
        >
          <div className="speaker-grille" />
        </button>

        <div className="cabinet-panel-center">
          <button
            type="button"
            className="cabinet-coin-slot cabinet-coin-slot--clickable"
            onClick={() => pressButton(null, handleCoinInsert)}
            aria-label="Insert coin"
          >
            <span className="cabinet-coin-slot-label">COIN</span>
            <div
              className={`cabinet-coin-led${hud.coins > 0 || coinPulse ? ' cabinet-coin-led--on' : ''}${coinPulse ? ' cabinet-coin-led--pulse' : ''}`}
              aria-hidden="true"
            />
            <span className="cabinet-coin-count">{hud.coins.toString().padStart(2, '0')}</span>
            {showInsertCoin && (
              <span className="cabinet-insert-coin blink">INSERT COIN</span>
            )}
          </button>

          <div
            className={`cabinet-joystick-area${joystickWobble ? ' cabinet-joystick-area--wobble' : ''}`}
            role="group"
            aria-label="Joystick"
          >
            <button type="button" className="cabinet-joystick-nudge cabinet-joystick-nudge--left" onClick={() => nudgeJoystick('left')} aria-label="Joystick left" />
            <button type="button" className="cabinet-joystick-nudge cabinet-joystick-nudge--right" onClick={() => nudgeJoystick('right')} aria-label="Joystick right" />
            <button type="button" className="cabinet-joystick-nudge cabinet-joystick-nudge--up" onClick={() => nudgeJoystick('up')} aria-label="Joystick up" />
            <button type="button" className="cabinet-joystick-nudge cabinet-joystick-nudge--down" onClick={() => nudgeJoystick('down')} aria-label="Joystick down" />
            <div className="cabinet-joystick-base" />
            <div
              className={`cabinet-joystick-stick${joystickDir ? ` cabinet-joystick-stick--${joystickDir}` : ''}`}
            />
            <span className="cabinet-joystick-label">MOVE</span>
          </div>

          <div className="cabinet-buttons-deco">
            <button
              type="button"
              className={`cabinet-btn-deco cabinet-btn-deco--a${pressedBtn === 'a' ? ' cabinet-btn-deco--pressed' : ''}`}
              onClick={() => pressButton('a', () => { handleBtnKonami('KeyA'); handleJump(); })}
              aria-label="Jump button"
            >
              <span className="cabinet-btn-cap cabinet-btn-cap--red" />
              <span className="cabinet-btn-label">A · JUMP</span>
            </button>
            <button
              type="button"
              className={`cabinet-btn-deco cabinet-btn-deco--b${pressedBtn === 'b' ? ' cabinet-btn-deco--pressed' : ''}`}
              onClick={() => pressButton('b', () => { handleBtnKonami('KeyB'); handleDash(); })}
              aria-label="Dash button"
            >
              <span className="cabinet-btn-cap cabinet-btn-cap--green" />
              <span className="cabinet-btn-label">B · DASH</span>
            </button>
            <button
              type="button"
              className={`cabinet-btn-deco cabinet-btn-deco--fire${pressedBtn === 'fire' ? ' cabinet-btn-deco--pressed' : ''}`}
              onClick={() => pressButton('fire', handleFire)}
              aria-label="Fire button"
            >
              <span className="cabinet-btn-cap cabinet-btn-cap--blue" />
              <span className="cabinet-btn-label">Z · FIRE</span>
            </button>
            <button
              type="button"
              className={`cabinet-btn-deco cabinet-btn-deco--start${pressedBtn === 'start' ? ' cabinet-btn-deco--pressed' : ''}`}
              onClick={() => pressButton('start', handleStart)}
              aria-label="Start button"
            >
              <span className="cabinet-btn-cap cabinet-btn-cap--yellow" />
              <span className="cabinet-btn-label">START</span>
            </button>
          </div>

          <div className="cabinet-lives">
            <span className="cabinet-lives-label">LIVES</span>
            <div className="cabinet-life-icons" aria-label={`${hud.lives} lives remaining`}>
              {Array.from({ length: maxLives }, (_, i) => (
                <span
                  key={i}
                  className={`cabinet-life-icon${i < hud.lives ? ' cabinet-life-icon--on' : ''}`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>

          {showAttract && (
            <div className="cabinet-attract">
              <CharacterSelectCabinet selectedId={characterId} onSelect={handleCharacterChange} />
              <span className="cabinet-attract-line blink">RESUME TO PLAY</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="cabinet-speaker cabinet-speaker--right"
          onClick={handleSpeakerClick}
          aria-label="Speaker grille"
        >
          <div className="speaker-grille" />
        </button>
      </footer>

      <div className="cabinet-base" aria-hidden="true">
        <div className="cabinet-base-shadow" />
      </div>
    </div>
  );
}
