import Phaser from 'phaser';
import { TILE_SIZE, TileType } from '../config/constants';
import { Block } from '../objects/Block';
import { Coin } from '../objects/Coin';
import { Pipe } from '../objects/Pipe';
import { MovingPlatform } from '../entities/MovingPlatform';
import { Enemy } from '../entities/Enemy';
import { Flagpole } from '../objects/Flagpole';
import type { LevelData } from './levelData';
import { parseLevelMap, themeGroundTexture } from './levelData';

export interface BuiltLevel {
  width: number;
  height: number;
  groundLayer: Phaser.Physics.Arcade.StaticGroup;
  oneWayLayer: Phaser.Physics.Arcade.StaticGroup;
  blocks: Block[];
  pipes: Pipe[];
  tileSprites: Phaser.GameObjects.Image[];
  flagpole: Flagpole;
}

export class LevelBuilder {
  static build(scene: Phaser.Scene, level: LevelData): BuiltLevel {
    const grid = parseLevelMap(level.map);
    const height = grid.length;
    const width = grid[0].length;
    const worldWidth = width * TILE_SIZE;
    const worldHeight = height * TILE_SIZE;
    const groundTex = themeGroundTexture(level.theme);

    scene.physics.world.setBounds(0, 0, worldWidth, worldHeight + 200);

    const groundLayer = scene.physics.add.staticGroup();
    const oneWayLayer = scene.physics.add.staticGroup();
    const blocks: Block[] = [];
    const pipes: Pipe[] = [];
    const tileSprites: Phaser.GameObjects.Image[] = [];

    const blockContentsMap = new Map<string, LevelData['blockContents'][0]['contents']>();
    level.blockContents.forEach((bc) => {
      blockContentsMap.set(`${bc.tileX},${bc.tileY}`, bc.contents);
    });

    for (let ty = 0; ty < height; ty++) {
      for (let tx = 0; tx < width; tx++) {
        const type = grid[ty][tx];
        if (type === TileType.Empty) continue;

        const { x, y } = Block.worldPos(tx, ty);

        if (type === TileType.OneWay) {
          const plat = oneWayLayer.create(x, y, 'tile-oneway') as Phaser.Physics.Arcade.Sprite;
          plat.refreshBody();
          plat.setVisible(false);
          plat.body!.checkCollision.up = true;
          plat.body!.checkCollision.down = false;
          plat.body!.checkCollision.left = false;
          plat.body!.checkCollision.right = false;
          tileSprites.push(scene.add.image(x, y, 'tile-oneway').setDepth(1));
          continue;
        }

        const texture = Block.tileTypeToTexture(type, groundTex);
        if (!texture) continue;

        if (
          type === TileType.Brick ||
          type === TileType.Question ||
          type === TileType.Hidden ||
          type === TileType.CoinBlock ||
          type === TileType.Spring
        ) {
          const kind =
            type === TileType.Brick
              ? 'brick'
              : type === TileType.Hidden
                ? 'hidden'
                : type === TileType.CoinBlock
                  ? 'coin-block'
                  : type === TileType.Spring
                    ? 'spring'
                    : 'question';
          const contents = blockContentsMap.get(`${tx},${ty}`) ?? 'coin';
          const block = new Block(scene, x, y, kind, tx, ty, contents);
          blocks.push(block);
          groundLayer.add(block);
          if (kind !== 'hidden') {
            tileSprites.push(scene.add.image(x, y, texture).setDepth(1));
          }
        } else {
          const tile = groundLayer.create(x, y, texture) as Phaser.Physics.Arcade.Sprite;
          tile.refreshBody();
          tileSprites.push(scene.add.image(x, y, texture).setDepth(1));
          tile.setVisible(false);
        }
      }
    }

    const flagpole = new Flagpole(scene, level);

    level.pipes?.forEach((pipeConfig) => {
      pipes.push(new Pipe(scene, pipeConfig));
    });

    return { width, height, groundLayer, oneWayLayer, blocks, pipes, tileSprites, flagpole };
  }

  static spawnEnemies(scene: Phaser.Scene, level: LevelData): Enemy[] {
    return level.spawns.map((spawn) => {
      const { x, y } = Block.worldPos(spawn.x, spawn.y);
      const patrolMin = spawn.patrolMin !== undefined ? Block.worldPos(spawn.patrolMin, spawn.y).x : undefined;
      const patrolMax = spawn.patrolMax !== undefined ? Block.worldPos(spawn.patrolMax, spawn.y).x : undefined;
      return new Enemy(scene, x, y, spawn.type, patrolMin, patrolMax);
    });
  }

  static spawnCoins(scene: Phaser.Scene, level: LevelData): Coin[] {
    return level.coins.map((c) => {
      const { x, y } = Block.worldPos(c.x, c.y);
      return new Coin(scene, x, y);
    });
  }

  static spawnMovingPlatforms(scene: Phaser.Scene, level: LevelData): MovingPlatform[] {
    if (!level.movingPlatforms) return [];
    return level.movingPlatforms.map((config) => new MovingPlatform(scene, config));
  }
}
