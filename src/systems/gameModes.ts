export type GameModeId = 'adventure' | 'speedrun' | 'hardcore' | 'coinRush' | 'bossRush';

export interface GameModeConfig {
  id: GameModeId;
  name: string;
  description: string;
  icon: string;
  badgeColor: string;
}

export const GAME_MODES: GameModeConfig[] = [
  {
    id: 'adventure',
    name: 'Adventure',
    description: 'Classic campaign — unlock worlds as you progress',
    icon: '🗺',
    badgeColor: '#27ae60',
  },
  {
    id: 'speedrun',
    name: 'Speedrun',
    description: 'Beat your ghost time — no level select skips',
    icon: '⏱',
    badgeColor: '#3498db',
  },
  {
    id: 'hardcore',
    name: 'Hardcore',
    description: 'One life — no power-up respawn on death',
    icon: '💀',
    badgeColor: '#c0392b',
  },
  {
    id: 'coinRush',
    name: 'Coin Rush',
    description: '60 seconds — collect max coins in a random level',
    icon: '🪙',
    badgeColor: '#f1c40f',
  },
  {
    id: 'bossRush',
    name: 'Boss Rush',
    description: 'Jump straight to boss encounters',
    icon: '👹',
    badgeColor: '#8e44ad',
  },
];

export interface GameModeRules {
  allowLevelSelect: boolean;
  startingLives: number;
  respawnPowerUp: boolean;
  showSpeedrunTimer: boolean;
  showCoinRushTimer: boolean;
  coinRushDuration: number;
  bossRushOnly: boolean;
  trackSpeedrunGhost: boolean;
  sequentialLevels: boolean;
}

export function getGameModeRules(mode: GameModeId): GameModeRules {
  switch (mode) {
    case 'speedrun':
      return {
        allowLevelSelect: false,
        startingLives: 3,
        respawnPowerUp: true,
        showSpeedrunTimer: true,
        showCoinRushTimer: false,
        coinRushDuration: 0,
        bossRushOnly: false,
        trackSpeedrunGhost: true,
        sequentialLevels: true,
      };
    case 'hardcore':
      return {
        allowLevelSelect: false,
        startingLives: 1,
        respawnPowerUp: false,
        showSpeedrunTimer: false,
        showCoinRushTimer: false,
        coinRushDuration: 0,
        bossRushOnly: false,
        trackSpeedrunGhost: false,
        sequentialLevels: true,
      };
    case 'coinRush':
      return {
        allowLevelSelect: false,
        startingLives: 1,
        respawnPowerUp: true,
        showSpeedrunTimer: false,
        showCoinRushTimer: true,
        coinRushDuration: 60,
        bossRushOnly: false,
        trackSpeedrunGhost: false,
        sequentialLevels: false,
      };
    case 'bossRush':
      return {
        allowLevelSelect: false,
        startingLives: 3,
        respawnPowerUp: true,
        showSpeedrunTimer: false,
        showCoinRushTimer: false,
        coinRushDuration: 0,
        bossRushOnly: true,
        trackSpeedrunGhost: false,
        sequentialLevels: false,
      };
    default:
      return {
        allowLevelSelect: true,
        startingLives: 3,
        respawnPowerUp: true,
        showSpeedrunTimer: false,
        showCoinRushTimer: false,
        coinRushDuration: 0,
        bossRushOnly: false,
        trackSpeedrunGhost: false,
        sequentialLevels: false,
      };
  }
}

export function getBossRushLevelIndices(): number[] {
  return [7]; // World 4-1 — Iron Guard boss
}

export function getCoinRushLevelIndex(seed: number): number {
  const playable = 8;
  return seed % playable;
}

export function getGameModeById(id: string): GameModeConfig {
  return GAME_MODES.find((m) => m.id === id) ?? GAME_MODES[0];
}
