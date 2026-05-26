import { EnemyType, LevelTheme, PowerUpType, TileType } from '../config/constants';
import type { PipeWarpConfig } from '../objects/Pipe';

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
  theme: LevelTheme;
  map: string[];
  spawns: LevelSpawn[];
  coins: LevelCoin[];
  blockContents: LevelBlockContent[];
  movingPlatforms?: MovingPlatformConfig[];
  pipes?: PipeWarpConfig[];
  playerStart: { x: number; y: number };
  goalX: number;
  timeLimit?: number;
  secret?: boolean;
  devMessageTile?: { x: number; y: number };
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
  C: TileType.CoinBlock,
  '^': TileType.Spring,
};

export function parseLevelMap(map: string[]): TileType[][] {
  return map.map((row) => [...row].map((ch) => CHAR_MAP[ch] ?? TileType.Empty));
}

export function themeGroundTexture(theme: LevelTheme): string {
  switch (theme) {
    case LevelTheme.Underground:
      return 'tile-ground-underground';
    case LevelTheme.Sky:
      return 'tile-ground-sky';
    case LevelTheme.Castle:
      return 'tile-ground-castle';
    default:
      return 'tile-ground';
  }
}

export const LEVELS: LevelData[] = [
  {
    name: 'World 1-1',
    theme: LevelTheme.Overworld,
    playerStart: { x: 2, y: 10 },
    goalX: 78,
    devMessageTile: { x: 4, y: 11 },
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
      '....................BBB.......................................................F',
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
      { x: 12, y: 8 }, { x: 13, y: 8 }, { x: 14, y: 8 },
      { x: 30, y: 5 }, { x: 31, y: 5 }, { x: 32, y: 5 },
      { x: 55, y: 9 }, { x: 56, y: 9 },
      { x: 38, y: 11 }, { x: 39, y: 11 }, { x: 40, y: 11 },
    ],
    blockContents: [
      { tileX: 20, tileY: 7, contents: PowerUpType.Spark },
      { tileX: 21, tileY: 7, contents: 'coin' },
      { tileX: 22, tileY: 7, contents: 'coin' },
      { tileX: 4, tileY: 11, contents: PowerUpType.OneUp },
      { tileX: 38, tileY: 10, contents: 'coin' },
    ],
    movingPlatforms: [{ tileX: 30, tileY: 9, width: 3, range: 80, speed: 1.2, axis: 'x' }],
  },
  {
    name: 'World 1-2',
    theme: LevelTheme.Overworld,
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
      { x: 10, y: 7 }, { x: 11, y: 6 }, { x: 12, y: 5 },
      { x: 28, y: 8 }, { x: 29, y: 8 }, { x: 30, y: 8 },
      { x: 48, y: 4 }, { x: 49, y: 4 }, { x: 50, y: 4 },
      { x: 75, y: 9 }, { x: 76, y: 8 }, { x: 77, y: 7 },
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
    pipes: [{ entryX: 38, entryY: 12, exitX: 55, exitY: 8 }],
  },
  {
    name: 'World 1-3',
    theme: LevelTheme.Overworld,
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
      { x: 8, y: 6 }, { x: 16, y: 5 }, { x: 24, y: 6 }, { x: 32, y: 4 },
      { x: 40, y: 5 }, { x: 48, y: 6 }, { x: 56, y: 4 }, { x: 62, y: 5 },
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
  {
    name: 'World 1-4',
    theme: LevelTheme.Overworld,
    playerStart: { x: 2, y: 10 },
    goalX: 95,
    map: [
      '................................................................................................F',
      '................................................................................................F',
      '........................???.....................................................................F',
      '................................................................................................F',
      '...........====...........................====...........................====.................F',
      '................................................................................................F',
      '.....====....................................................====...............................F',
      '................................................................................................F',
      '....................===.......................................................................F',
      '................................................................................................F',
      '................................................................................................F',
      '................................................................................................F',
      '................................................................................................F',
      '................................................................................................F',
      '##...##...##...##...##...##...##...##...##...##...##...##...##...##...##...##...##...##...##..#XX',
    ],
    spawns: [
      { type: EnemyType.Walker, x: 12, y: 13, patrolMin: 10, patrolMax: 16 },
      { type: EnemyType.Shell, x: 22, y: 13, patrolMin: 20, patrolMax: 26 },
      { type: EnemyType.Flyer, x: 32, y: 5, patrolMin: 28, patrolMax: 38 },
      { type: EnemyType.Walker, x: 40, y: 13, patrolMin: 38, patrolMax: 44 },
      { type: EnemyType.Shell, x: 50, y: 13, patrolMin: 48, patrolMax: 54 },
      { type: EnemyType.Flyer, x: 58, y: 4, patrolMin: 54, patrolMax: 64 },
      { type: EnemyType.Walker, x: 66, y: 13, patrolMin: 64, patrolMax: 70 },
      { type: EnemyType.Shell, x: 74, y: 13, patrolMin: 72, patrolMax: 78 },
      { type: EnemyType.Flyer, x: 82, y: 5, patrolMin: 78, patrolMax: 90 },
      { type: EnemyType.Walker, x: 88, y: 13, patrolMin: 86, patrolMax: 92 },
    ],
    coins: [
      { x: 8, y: 7 }, { x: 16, y: 6 }, { x: 24, y: 5 }, { x: 32, y: 4 },
      { x: 40, y: 5 }, { x: 48, y: 6 }, { x: 56, y: 4 }, { x: 64, y: 5 },
      { x: 72, y: 6 }, { x: 80, y: 5 }, { x: 86, y: 4 }, { x: 90, y: 3 },
    ],
    blockContents: [
      { tileX: 24, tileY: 2, contents: PowerUpType.Star },
      { tileX: 25, tileY: 2, contents: PowerUpType.Blaze },
      { tileX: 26, tileY: 2, contents: 'coin' },
      { tileX: 60, tileY: 8, contents: PowerUpType.Spark },
    ],
    movingPlatforms: [
      { tileX: 10, tileY: 9, width: 2, range: 55, speed: 2, axis: 'x' },
      { tileX: 28, tileY: 8, width: 2, range: 70, speed: 1.6, axis: 'y' },
      { tileX: 46, tileY: 9, width: 3, range: 85, speed: 1.4, axis: 'x' },
      { tileX: 64, tileY: 7, width: 2, range: 60, speed: 2.2, axis: 'y' },
      { tileX: 78, tileY: 9, width: 3, range: 100, speed: 1.8, axis: 'x' },
    ],
  },
  {
    name: 'World 2-1',
    theme: LevelTheme.Underground,
    playerStart: { x: 2, y: 10 },
    goalX: 70,
    map: [
      '......................................................................F',
      '......................................................................F',
      '...................CCC................................................F',
      '......................................................................F',
      '...........====....................====...............................F',
      '......................................................................F',
      '.....P..............^.................................................F',
      '......................................................................F',
      '......................................................................F',
      '......................................................................F',
      '......................................................................F',
      '......................................................................F',
      '................................H.....................................F',
      '......................................................................F',
      '############################...############################...########XX',
    ],
    spawns: [
      { type: EnemyType.Walker, x: 15, y: 13, patrolMin: 12, patrolMax: 22 },
      { type: EnemyType.Piranha, x: 6, y: 11, patrolMin: 4, patrolMax: 8 },
      { type: EnemyType.Shell, x: 30, y: 13, patrolMin: 26, patrolMax: 36 },
      { type: EnemyType.Walker, x: 45, y: 13, patrolMin: 42, patrolMax: 52 },
      { type: EnemyType.Piranha, x: 55, y: 11, patrolMin: 53, patrolMax: 57 },
    ],
    coins: [
      { x: 8, y: 8 }, { x: 9, y: 8 }, { x: 10, y: 8 },
      { x: 35, y: 6 }, { x: 36, y: 6 }, { x: 37, y: 6 },
      { x: 52, y: 9 }, { x: 53, y: 9 }, { x: 54, y: 9 },
    ],
    blockContents: [
      { tileX: 19, tileY: 2, contents: 'coin' },
      { tileX: 20, tileY: 2, contents: 'coin' },
      { tileX: 21, tileY: 2, contents: PowerUpType.Spark },
      { tileX: 32, tileY: 12, contents: PowerUpType.OneUp },
      { tileX: 52, tileY: 10, contents: 'coin' },
    ],
    pipes: [
      { entryX: 6, entryY: 12, exitX: 48, exitY: 10, secret: true },
    ],
    movingPlatforms: [{ tileX: 22, tileY: 9, width: 2, range: 60, speed: 1.5, axis: 'x' }],
  },
  {
    name: 'World 2-2',
    theme: LevelTheme.Sky,
    playerStart: { x: 2, y: 10 },
    goalX: 65,
    map: [
      '.................................................................F',
      '.................................................................F',
      '....................???..........................................F',
      '.................................................................F',
      '...........====...........====...........====......................F',
      '.................................................................F',
      '.....====..............................====........................F',
      '.................................................................F',
      '.................................................................F',
      '.................................................................F',
      '.................................................................F',
      '.................................................................F',
      '.................................................................F',
      '.................................................................F',
      '####...####...####...####...####...####...####...####...####...#XX',
    ],
    spawns: [
      { type: EnemyType.Flyer, x: 12, y: 5, patrolMin: 8, patrolMax: 18 },
      { type: EnemyType.Flyer, x: 22, y: 4, patrolMin: 18, patrolMax: 28 },
      { type: EnemyType.Flyer, x: 35, y: 3, patrolMin: 30, patrolMax: 42 },
      { type: EnemyType.Flyer, x: 48, y: 4, patrolMin: 44, patrolMax: 56 },
      { type: EnemyType.Shell, x: 40, y: 13, patrolMin: 38, patrolMax: 48 },
    ],
    coins: [
      { x: 10, y: 7 }, { x: 18, y: 6 }, { x: 26, y: 5 }, { x: 34, y: 4 },
      { x: 42, y: 5 }, { x: 50, y: 6 }, { x: 58, y: 7 },
    ],
    blockContents: [
      { tileX: 20, tileY: 2, contents: PowerUpType.Star },
      { tileX: 21, tileY: 2, contents: 'coin' },
      { tileX: 22, tileY: 2, contents: PowerUpType.OneUp },
    ],
    movingPlatforms: [
      { tileX: 14, tileY: 9, width: 2, range: 80, speed: 1.2, axis: 'x' },
      { tileX: 28, tileY: 7, width: 3, range: 100, speed: 1, axis: 'x' },
      { tileX: 44, tileY: 8, width: 2, range: 70, speed: 1.8, axis: 'y' },
    ],
  },
  {
    name: 'World 3-1',
    theme: LevelTheme.Castle,
    playerStart: { x: 2, y: 10 },
    goalX: 75,
    map: [
      '...........................................................................F',
      '...........................................................................F',
      '........................???................................................F',
      '...........................................................................F',
      '...........====...........................====.............................F',
      '...........................................................................F',
      '.....====..................................................................F',
      '...........................................................................F',
      '...........................................................................F',
      '...........................................................................F',
      '...........................................................................F',
      '...........................................................................F',
      '...........................................................................F',
      '...........................................................................F',
      '##...##...##...##...##...##...##...##...##...##...##...##...##...##...##..#XX',
    ],
    spawns: [
      { type: EnemyType.Walker, x: 12, y: 13, patrolMin: 10, patrolMax: 16 },
      { type: EnemyType.Piranha, x: 20, y: 11, patrolMin: 18, patrolMax: 22 },
      { type: EnemyType.Shell, x: 28, y: 13, patrolMin: 26, patrolMax: 32 },
      { type: EnemyType.Flyer, x: 38, y: 5, patrolMin: 34, patrolMax: 44 },
      { type: EnemyType.Piranha, x: 48, y: 11, patrolMin: 46, patrolMax: 50 },
      { type: EnemyType.Shell, x: 56, y: 13, patrolMin: 54, patrolMax: 60 },
      { type: EnemyType.Walker, x: 64, y: 13, patrolMin: 62, patrolMax: 68 },
    ],
    coins: [
      { x: 8, y: 7 }, { x: 16, y: 6 }, { x: 24, y: 5 }, { x: 32, y: 4 },
      { x: 40, y: 5 }, { x: 48, y: 6 }, { x: 56, y: 5 }, { x: 64, y: 4 },
    ],
    blockContents: [
      { tileX: 24, tileY: 2, contents: PowerUpType.Blaze },
      { tileX: 25, tileY: 2, contents: PowerUpType.Star },
      { tileX: 26, tileY: 2, contents: 'coin' },
    ],
    movingPlatforms: [
      { tileX: 18, tileY: 9, width: 2, range: 55, speed: 2, axis: 'x' },
      { tileX: 36, tileY: 7, width: 2, range: 65, speed: 1.8, axis: 'y' },
      { tileX: 52, tileY: 9, width: 3, range: 80, speed: 1.4, axis: 'x' },
    ],
  },
  {
    name: 'World 4-1',
    theme: LevelTheme.Castle,
    playerStart: { x: 2, y: 10 },
    goalX: 60,
    map: [
      '............................................................F',
      '............................................................F',
      '............................................................F',
      '............................................................F',
      '............................................................F',
      '...........====....................====.....................F',
      '............................................................F',
      '............................................................F',
      '............................................................F',
      '............................................................F',
      '............................................................F',
      '............................................................F',
      '............................................................F',
      '............................................................F',
      '##...##...##...##...##...##...##...##...##...##...##...##..#XX',
    ],
    spawns: [
      { type: EnemyType.Boss, x: 35, y: 12, patrolMin: 28, patrolMax: 48 },
      { type: EnemyType.Shell, x: 20, y: 13, patrolMin: 18, patrolMax: 24 },
      { type: EnemyType.Walker, x: 12, y: 13, patrolMin: 10, patrolMax: 16 },
      { type: EnemyType.Flyer, x: 28, y: 5, patrolMin: 24, patrolMax: 34 },
    ],
    coins: [
      { x: 8, y: 8 }, { x: 9, y: 7 }, { x: 10, y: 6 },
      { x: 45, y: 8 }, { x: 46, y: 7 }, { x: 47, y: 6 },
    ],
    blockContents: [
      { tileX: 8, tileY: 7, contents: PowerUpType.Spark },
      { tileX: 45, tileY: 7, contents: PowerUpType.Star },
    ],
    movingPlatforms: [{ tileX: 22, tileY: 9, width: 2, range: 50, speed: 1.6, axis: 'x' }],
  },
  {
    name: 'Star Chamber',
    theme: LevelTheme.Sky,
    secret: true,
    playerStart: { x: 2, y: 10 },
    goalX: 40,
    map: [
      '........................................F',
      '........................................F',
      '........???.............................F',
      '........................................F',
      '.....====...............................F',
      '........................................F',
      '........................................F',
      '........................................F',
      '........................................F',
      '........................................F',
      '........................................F',
      '........................................F',
      '........................................F',
      '........................................F',
      '########...########...########...#######XX',
    ],
    spawns: [
      { type: EnemyType.Flyer, x: 15, y: 5, patrolMin: 10, patrolMax: 22 },
      { type: EnemyType.Flyer, x: 28, y: 4, patrolMin: 24, patrolMax: 34 },
    ],
    coins: [
      { x: 10, y: 6 }, { x: 11, y: 5 }, { x: 12, y: 4 },
      { x: 20, y: 6 }, { x: 21, y: 5 }, { x: 22, y: 4 },
      { x: 30, y: 6 }, { x: 31, y: 5 }, { x: 32, y: 4 },
    ],
    blockContents: [
      { tileX: 9, tileY: 2, contents: PowerUpType.Star },
      { tileX: 10, tileY: 2, contents: PowerUpType.OneUp },
      { tileX: 11, tileY: 2, contents: PowerUpType.Blaze },
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
    [TileType.CoinBlock]: 'C',
    [TileType.Spring]: '^',
  };
  const ch = reverseMap[type] ?? '.';
  const row = level.map[tileY].split('');
  row[tileX] = ch;
  level.map[tileY] = row.join('');
}

export function getPlayableLevels(includeSecret: boolean): LevelData[] {
  if (includeSecret) return LEVELS;
  return LEVELS.filter((l) => !l.secret);
}
