export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 480;
export const TILE_SIZE = 32;

export const GRAVITY = 1000;
export const PLAYER_SPEED = 200;
export const PLAYER_ACCEL = 1200;
export const PLAYER_FRICTION = 1000;
export const JUMP_VELOCITY = -420;
export const DOUBLE_JUMP_VELOCITY = -340;
export const JUMP_CUT_VELOCITY = -180;
export const COYOTE_TIME_MS = 100;
export const JUMP_BUFFER_MS = 100;
export const WALL_SLIDE_SPEED = 60;
export const WALL_JUMP_VELOCITY_X = 280;
export const WALL_JUMP_VELOCITY_Y = -380;
export const DASH_SPEED = 400;
export const DASH_DURATION_MS = 150;
export const DASH_COOLDOWN_MS = 800;

export const ENEMY_WALKER_SPEED = 60;
export const ENEMY_SHELL_SPEED = 280;
export const ENEMY_FLYER_SPEED = 80;
export const PROJECTILE_SPEED = 320;

export const STAR_DURATION_MS = 8000;
export const INVINCIBLE_FLASH_MS = 1500;
export const COIN_VALUE = 100;
export const STOMP_BOUNCE = -280;

export const STARTING_LIVES = 3;
export const LEVEL_TIME_SECONDS = 400;
export const COIN_BLOCK_COINS = 8;
export const SPRING_BOUNCE_VELOCITY = -520;

export const LevelTheme = {
  Overworld: 'overworld',
  Underground: 'underground',
  Sky: 'sky',
  Castle: 'castle',
} as const;
export type LevelTheme = (typeof LevelTheme)[keyof typeof LevelTheme];

export const TileType = {
  Empty: 0,
  Ground: 1,
  Brick: 2,
  Question: 3,
  Pipe: 4,
  OneWay: 5,
  Hard: 6,
  Hidden: 7,
  CoinBlock: 8,
  Spring: 9,
} as const;
export type TileType = (typeof TileType)[keyof typeof TileType];

export const PowerUpType = {
  Spark: 'spark',
  Blaze: 'blaze',
  Star: 'star',
  OneUp: 'oneup',
} as const;
export type PowerUpType = (typeof PowerUpType)[keyof typeof PowerUpType];

export const EnemyType = {
  Walker: 'walker',
  Shell: 'shell',
  Flyer: 'flyer',
  Piranha: 'piranha',
  Boss: 'boss',
} as const;
export type EnemyType = (typeof EnemyType)[keyof typeof EnemyType];

export const PlayerState = {
  Small: 'small',
  Big: 'big',
  Blaze: 'blaze',
} as const;
export type PlayerState = (typeof PlayerState)[keyof typeof PlayerState];
