import { EnemyType, PowerUpType, TileType } from '../config/constants';

export interface LevelSpawn {
  type: EnemyType;
  x: number;
  y: number;
  patrolMin?: number;
  patrolMax?: number;
}

export interface LevelCoin {
  x: number;
  y: number;
}

export interface LevelBlockContent {
  tileX: number;
  tileY: number;
  contents: 'coin' | PowerUpType;
}

import type { MovingPlatformConfig } from '../entities/MovingPlatform';

export interface LevelData {
  name: string;
  map: string[];
  spawns: LevelSpawn[];
  coins: LevelCoin[];
  blockContents: LevelBlockContent[];
  movingPlatforms?: MovingPlatformConfig[];
  playerStart: { x: number; y: number };
  goalX: number;
}

const CHAR_MAP: Record<string, TileType> = {
  '.': TileType.Empty,
  '#': TileType.Ground,
  B: TileType.Brick,
  '?': TileType.Question,
  P: TileType.Pipe,
  '=': TileType.OneWay,
  H: TileType.Hidden,
  X: TileType.Hard,
};

export function parseLevelMap(map: string[]): TileType[][] {
  return map.map((row) => [...row].map((ch) => CHAR_MAP[ch] ?? TileType.Empty));
}

export const LEVELS: LevelData[] = [
  {
    name: 'World 1-1',
    playerStart: { x: 2, y: 10 },
    goalX: 78,
    map: [
      '..............................................................................F',
      '..............................................................................F',
      '..............................................................................F',
      '..............................................................................F',
      '..............................................................................F',
      '..............................................................................F',
      '..............................................................................F',
      '....................???.......................................................F',
      '..............................................................................F',
      '..............====............................................................F',
      '..............................................................................F',
      '....H.........................................................................F',
      '..............................................................................F',
      '..............................................................................F',
      '##################...#########...##################...#######################XX',
    ],
    spawns: [
      { type: EnemyType.Walker, x: 20, y: 13, patrolMin: 18, patrolMax: 28 },
      { type: EnemyType.Walker, x: 45, y: 13, patrolMin: 42, patrolMax: 55 },
    ],
    coins: [
      { x: 12, y: 8 },
      { x: 13, y: 8 },
      { x: 14, y: 8 },
      { x: 30, y: 5 },
      { x: 31, y: 5 },
      { x: 32, y: 5 },
      { x: 55, y: 9 },
      { x: 56, y: 9 },
    ],
    blockContents: [
      { tileX: 20, tileY: 7, contents: PowerUpType.Spark },
      { tileX: 21, tileY: 7, contents: 'coin' },
      { tileX: 22, tileY: 7, contents: 'coin' },
      { tileX: 4, tileY: 11, contents: 'coin' },
    ],
    movingPlatforms: [
      { tileX: 30, tileY: 9, width: 3, range: 80, speed: 1.2, axis: 'x' },
    ],
  },
  {
    name: 'World 1-2',
    playerStart: { x: 2, y: 10 },
    goalX: 88,
    map: [
      '........................................................................................F',
      '........................................................................................F',
      '........................................................................................F',
      '........................................................................................F',
      '........................???.............................................................F',
      '........................................................................................F',
      '..................====....................====..........................................F',
      '........................................................................................F',
      '...........====.........................................................................F',
      '........................................................................................F',
      '........................................................................................F',
      '........................................................................................F',
      '........................................................................................F',
      '........................................................................................F',
      '#########...##########...##########...##########...##########...##########...##########XX',
    ],
    spawns: [
      { type: EnemyType.Walker, x: 18, y: 13, patrolMin: 15, patrolMax: 25 },
      { type: EnemyType.Shell, x: 35, y: 13, patrolMin: 32, patrolMax: 42 },
      { type: EnemyType.Flyer, x: 50, y: 6, patrolMin: 45, patrolMax: 65 },
      { type: EnemyType.Flyer, x: 70, y: 5, patrolMin: 65, patrolMax: 82 },
      { type: EnemyType.Walker, x: 60, y: 13, patrolMin: 55, patrolMax: 75 },
    ],
    coins: [
      { x: 10, y: 7 },
      { x: 11, y: 6 },
      { x: 12, y: 5 },
      { x: 28, y: 8 },
      { x: 29, y: 8 },
      { x: 30, y: 8 },
      { x: 48, y: 4 },
      { x: 49, y: 4 },
      { x: 50, y: 4 },
      { x: 75, y: 9 },
      { x: 76, y: 8 },
      { x: 77, y: 7 },
    ],
    blockContents: [
      { tileX: 24, tileY: 4, contents: PowerUpType.Blaze },
      { tileX: 25, tileY: 4, contents: 'coin' },
      { tileX: 26, tileY: 4, contents: 'coin' },
    ],
    movingPlatforms: [
      { tileX: 14, tileY: 9, width: 2, range: 60, speed: 1.5, axis: 'x' },
      { tileX: 40, tileY: 7, width: 3, range: 100, speed: 1, axis: 'x' },
      { tileX: 62, tileY: 8, width: 2, range: 50, speed: 2, axis: 'y' },
    ],
  },
  {
    name: 'World 1-3',
    playerStart: { x: 2, y: 10 },
    goalX: 72,
    map: [
      '........................................................................F',
      '........................................................................F',
      '........................................................................F',
      '....................???.................................................F',
      '........................................................................F',
      '...........====...........====...........====...........................F',
      '........................................................................F',
      '.....====...............................................................F',
      '........................................................................F',
      '........................................................................F',
      '........................................................................F',
      '........................................................................F',
      '........................................................................F',
      '........................................................................F',
      '####...####...####...####...####...####...####...####...####...####...#XX',
    ],
    spawns: [
      { type: EnemyType.Walker, x: 10, y: 13, patrolMin: 8, patrolMax: 14 },
      { type: EnemyType.Shell, x: 18, y: 13, patrolMin: 16, patrolMax: 22 },
      { type: EnemyType.Walker, x: 26, y: 13, patrolMin: 24, patrolMax: 30 },
      { type: EnemyType.Flyer, x: 34, y: 5, patrolMin: 30, patrolMax: 40 },
      { type: EnemyType.Shell, x: 42, y: 13, patrolMin: 40, patrolMax: 46 },
      { type: EnemyType.Walker, x: 50, y: 13, patrolMin: 48, patrolMax: 54 },
      { type: EnemyType.Flyer, x: 58, y: 4, patrolMin: 54, patrolMax: 64 },
      { type: EnemyType.Shell, x: 64, y: 13, patrolMin: 62, patrolMax: 68 },
    ],
    coins: [
      { x: 8, y: 6 },
      { x: 16, y: 5 },
      { x: 24, y: 6 },
      { x: 32, y: 4 },
      { x: 40, y: 5 },
      { x: 48, y: 6 },
      { x: 56, y: 4 },
      { x: 62, y: 5 },
    ],
    blockContents: [
      { tileX: 20, tileY: 3, contents: PowerUpType.Star },
      { tileX: 21, tileY: 3, contents: 'coin' },
      { tileX: 22, tileY: 3, contents: 'coin' },
    ],
    movingPlatforms: [
      { tileX: 12, tileY: 9, width: 2, range: 70, speed: 1.8, axis: 'x' },
      { tileX: 28, tileY: 7, width: 2, range: 60, speed: 2, axis: 'y' },
      { tileX: 44, tileY: 9, width: 3, range: 90, speed: 1.2, axis: 'x' },
      { tileX: 56, tileY: 7, width: 2, range: 50, speed: 2.5, axis: 'y' },
    ],
  },
];

export function getTileAt(level: LevelData, tileX: number, tileY: number): TileType {
  if (tileY < 0 || tileY >= level.map.length) return TileType.Empty;
  const row = level.map[tileY];
  if (tileX < 0 || tileX >= row.length) return TileType.Empty;
  return CHAR_MAP[row[tileX]] ?? TileType.Empty;
}

export function setTileAt(level: LevelData, tileX: number, tileY: number, type: TileType): void {
  const reverseMap: Partial<Record<TileType, string>> = {
    [TileType.Empty]: '.',
    [TileType.Ground]: '#',
    [TileType.Brick]: 'B',
    [TileType.Question]: '?',
    [TileType.Pipe]: 'P',
    [TileType.OneWay]: '=',
    [TileType.Hidden]: 'H',
    [TileType.Hard]: 'X',
  };
  const ch = reverseMap[type] ?? '.';
  const row = level.map[tileY].split('');
  row[tileX] = ch;
  level.map[tileY] = row.join('');
}
