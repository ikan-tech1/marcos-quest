import type { GameModeId } from './gameModes';
import type { ActiveMission } from './missions';

export type GameScreen =
  | 'loading'
  | 'menu'
  | 'playing'
  | 'paused'
  | 'level-clear'
  | 'game-over'
  | 'shop';

export interface HudState {
  score: number;
  coins: number;
  lives: number;
  world: string;
  characterName: string;
  combo: number;
  comboMultiplier: number;
  levelIndex: number;
  totalLevels: number;
  highScore: number;
  timeLeft: number;
  levelBonus?: number;
  canFire?: boolean;
  gameMode?: GameModeId;
  speedrunElapsed?: number;
  speedrunGhost?: number;
  coinRushTime?: number;
  missions?: ActiveMission[];
  checkpointActive?: boolean;
}

export interface GameOverState {
  won: boolean;
  score: number;
  highScore: number;
  isNewRecord: boolean;
}

export interface StartGamePayload {
  levelIndex?: number;
  characterId?: string;
  gameMode?: GameModeId;
  dailyChallenge?: boolean;
}

export interface AchievementUnlockPayload {
  id: string;
  title: string;
  icon: string;
}

export interface MissionCompletePayload {
  title: string;
  rewardScore: number;
}

export interface ShopPayload {
  shopCoins: number;
  nextLevelIndex: number;
  characterId: string;
}

type Listener = (...args: unknown[]) => void;

class GameBridgeClass {
  private listeners = new Map<string, Set<Listener>>();
  private currentScreen: GameScreen = 'loading';
  private lastScreenData?: unknown;
  private lastHud?: HudState;

  on(event: string, fn: Listener): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn);

    if (event === 'screen') {
      fn({ screen: this.currentScreen, data: this.lastScreenData });
    } else if (event === 'hud' && this.lastHud) {
      fn(this.lastHud);
    }

    return () => this.listeners.get(event)?.delete(fn);
  }

  emit(event: string, data?: unknown): void {
    this.listeners.get(event)?.forEach((fn) => fn(data));
  }

  getScreen(): GameScreen {
    return this.currentScreen;
  }

  setScreen(screen: GameScreen, data?: unknown): void {
    this.currentScreen = screen;
    this.lastScreenData = data;
    this.emit('screen', { screen, data });
  }

  updateHud(hud: HudState): void {
    this.lastHud = hud;
    this.emit('hud', hud);
  }
}

export const GameBridge = new GameBridgeClass();
