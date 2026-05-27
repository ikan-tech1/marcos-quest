import Phaser from 'phaser';
import { TILE_SIZE } from '../config/constants';
import { Block } from '../objects/Block';

export interface QuestSignConfig {
  x: number;
  y: number;
  id: string;
  message: string;
  reward: number;
}

export class QuestSign extends Phaser.GameObjects.Container {
  readonly config: QuestSignConfig;
  private prompt?: Phaser.GameObjects.Text;
  talked = false;

  constructor(scene: Phaser.Scene, config: QuestSignConfig) {
    const { x, y } = Block.worldPos(config.x, config.y);
    super(scene, x, y - TILE_SIZE);

    const post = scene.add.image(0, TILE_SIZE / 2, 'tile-ground').setTint(0x8b6914).setScale(0.35, 0.8);
    const board = scene.add.rectangle(0, -4, 28, 22, 0xf5deb3, 1).setStrokeStyle(2, 0x5d4037);
    const mark = scene.add.text(0, -4, '?', {
      fontSize: '16px',
      color: '#5d4037',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add([post, board, mark]);
    this.config = config;
    this.setDepth(6);
    scene.add.existing(this);

    scene.tweens.add({
      targets: mark,
      y: mark.y - 3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  showPrompt(show: boolean): void {
    if (show && !this.prompt) {
      this.prompt = this.scene.add.text(this.x, this.y - 48, 'Press E', {
        fontSize: '11px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 6, y: 3 },
      }).setOrigin(0.5).setDepth(50);
    } else if (!show && this.prompt) {
      this.prompt.destroy();
      this.prompt = undefined;
    }
  }

  destroy(fromScene?: boolean): void {
    this.prompt?.destroy();
    super.destroy(fromScene);
  }
}
