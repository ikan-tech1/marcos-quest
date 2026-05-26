import Phaser from 'phaser';
import { GameState } from '../systems/GameState';
import { Storage } from '../systems/Storage';
import { generateTextures } from './textures';

const REQUIRED_TEXTURES = [
  'bg-sky',
  'tile-ground',
  'tile-brick',
  'flagpole-pole',
  'goal-castle-door',
] as const;

export function texturesReady(scene: Phaser.Scene): boolean {
  return REQUIRED_TEXTURES.every((key) => scene.textures.exists(key));
}

export function ensureGameTextures(scene: Phaser.Scene): void {
  try {
    generateTextures(scene);
  } catch (error) {
    console.error('[textures] generation failed', error);
    throw error;
  }
  if (!texturesReady(scene)) {
    throw new Error('Required game textures missing after generation');
  }
}

export function attachWebGLRecovery(game: Phaser.Game): () => void {
  const onContextLost = () => {
    console.error('[Game] WebGL context lost — gameplay may show a blank sky until restored');
  };

  const onRestore = () => {
    console.error('[Game] WebGL context restored — regenerating textures');
    const host = game.scene.getScene('GameScene') ?? game.scene.getScene('PreloadScene') ?? game.scene.scenes[0];
    if (!host) return;
    try {
      ensureGameTextures(host);
      if (game.scene.isActive('GameScene')) {
        game.scene.stop('GameScene');
        game.scene.start('GameScene', {
          levelIndex: GameState.currentLevel,
          characterId: Storage.getSelectedCharacter(),
        });
      }
    } catch (error) {
      console.error('[Game] WebGL restore recovery failed', error);
    }
  };

  game.events.on(Phaser.Core.Events.CONTEXT_LOST, onContextLost);
  const renderer = game.renderer as Phaser.Renderer.WebGL.WebGLRenderer | null;
  renderer?.on?.(Phaser.Renderer.Events.RESTORE_WEBGL, onRestore);

  return () => {
    game.events.off(Phaser.Core.Events.CONTEXT_LOST, onContextLost);
    renderer?.off?.(Phaser.Renderer.Events.RESTORE_WEBGL, onRestore);
  };
}
