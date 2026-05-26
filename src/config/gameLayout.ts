import { GAME_HEIGHT, GAME_WIDTH } from './constants';

export interface GameLayout {
  gameScale: number;
  scaledW: number;
  scaledH: number;
  left: number;
  top: number;
}

/** Integer Phaser zoom so the canvas fills the viewport (no CSS scaling). */
export function computeGameScale(viewportW: number, viewportH: number): number {
  return Math.max(
    1,
    Math.min(Math.floor(viewportW / GAME_WIDTH), Math.floor(viewportH / GAME_HEIGHT)),
  );
}

export function computeGameLayout(
  viewportW: number,
  viewportH: number,
  gameScale: number,
): GameLayout {
  const scaledW = GAME_WIDTH * gameScale;
  const scaledH = GAME_HEIGHT * gameScale;
  return {
    gameScale,
    scaledW,
    scaledH,
    left: Math.max(0, (viewportW - scaledW) / 2),
    top: Math.max(0, (viewportH - scaledH) / 2),
  };
}
