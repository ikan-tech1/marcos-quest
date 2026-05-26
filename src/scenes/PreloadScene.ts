import Phaser from 'phaser';
import { generateTextures } from '../utils/textures';
import { GameBridge } from '../systems/GameBridge';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  create(): void {
    try {
      generateTextures(this);
    } catch (error) {
      console.error('[PreloadScene] texture generation failed', error);
    }
    GameBridge.setScreen('menu');
    this.scene.stop();
  }
}
