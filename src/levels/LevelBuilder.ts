import Phaser from 'phaser';
import { TILE_SIZE, TileType } from '../config/constants';
import { Block } from '../objects/Block';
import { Coin } from '../objects/Coin';
import { MovingPlatform } from '../entities/MovingPlatform';
import { Enemy } from '../entities/Enemy';
import type { LevelData } from './levelData';
import { parseLevelMap } from './levelData';

export interface BuiltLevel {
  width: number;
  height: number;
  groundLayer: Phaser.Physics.Arcade.StaticGroup;
  oneWayLayer: Phaser.Physics.Arcade.StaticGroup;
  blocks: Block[];
  tileSprites: Phaser.GameObjects.Image[];
}

export class LevelBuilder {
  static build(scene: Phaser.Scene, level: LevelData): BuiltLevel {
    const grid = parseLevelMap(level.map);
    const height = grid.length;
    const width = grid[0].length;
    const worldWidth = width * TILE_SIZE;
    const worldHeight = height * TILE_SIZE;

    scene.physics.world.setBounds(0, 0, worldWidth, worldHeight + 200);

    const groundLayer = scene.physics.add.staticGroup();
    const oneWayLayer = scene.physics.add.staticGroup();
    const blocks: Block[] = [];
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
          tileSprites.push(
            scene.add.image(x, y, 'tile-oneway').setDepth(1),
          );
          continue;
        }

        const texture = Block.tileTypeToTexture(type);
        if (!texture) continue;

        if (type === TileType.Brick || type === TileType.Question || type === TileType.Hidden) {
          const kind =
            type === TileType.Brick ? 'brick' : type === TileType.Hidden ? 'hidden' : 'question';
          const contents = blockContentsMap.get(`${tx},${ty}`) ?? 'coin';
          const block = new Block(scene, x, y, kind, tx, ty, contents);
          blocks.push(block);
          groundLayer.add(block);
        } else {
          const tile = groundLayer.create(x, y, texture) as Phaser.Physics.Arcade.Sprite;
          tile.refreshBody();
          tileSprites.push(scene.add.image(x, y, texture).setDepth(1));
          tile.setVisible(false);
        }
      }
    }

    // Flag poles at goal
    for (let ty = 0; ty < height; ty++) {
      const row = level.map[ty];
      for (let tx = 0; tx < row.length; tx++) {
        if (row[tx] === 'F') {
          const { x, y } = Block.worldPos(tx, ty);
          scene.add.image(x, y, 'tile-flag').setDepth(2);
        }
      }
    }

    return { width, height, groundLayer, oneWayLayer, blocks, tileSprites };
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
