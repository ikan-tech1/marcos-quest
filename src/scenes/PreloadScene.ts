import Phaser from 'phaser';
import { ensureGameTextures } from '../utils/textureLifecycle';
import { GameBridge } from '../systems/GameBridge';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  create(): void {
    try {
      ensureGameTextures(this);
    } catch (error) {
      console.error('[PreloadScene] texture generation failed', error);
      GameBridge.setScreen('menu', { levelError: 'Failed to load game graphics. Please refresh the page.' });
      this.scene.stop();
      return;
    }
    GameBridge.setScreen('menu');
    this.scene.stop();
  }
}
