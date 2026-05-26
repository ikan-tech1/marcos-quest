export type GameScreen = 'loading' | 'menu' | 'playing' | 'level-clear' | 'game-over';

export interface HudState {
  score: number;
  coins: number;
  lives: number;
  world: string;
  combo: number;
  comboMultiplier: number;
}

export interface GameOverState {
  won: boolean;
  score: number;
}

type Listener = (...args: unknown[]) => void;

class GameBridgeClass {
  private listeners = new Map<string, Set<Listener>>();

  on(event: string, fn: Listener): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn);
    return () => this.listeners.get(event)?.delete(fn);
  }

  emit(event: string, data?: unknown): void {
    this.listeners.get(event)?.forEach((fn) => fn(data));
  }

  setScreen(screen: GameScreen, data?: unknown): void {
    this.emit('screen', { screen, data });
  }

  updateHud(hud: HudState): void {
    this.emit('hud', hud);
  }
}

export const GameBridge = new GameBridgeClass();
