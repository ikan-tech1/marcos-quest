import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Textures generated in PreloadScene
  }

  create(): void {
    this.scene.start('PreloadScene');
  }
}
