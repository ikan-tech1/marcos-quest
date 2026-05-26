import { GAME_HEIGHT, GAME_WIDTH } from './constants';

export interface GameLayout {
  gameScale: number;
  scaledW: number;
  scaledH: number;
  left: number;
  top: number;
}

/**
 * Integer Phaser zoom — contain mode: largest integer scale that fits entirely
 * inside the viewport (letterbox margins filled by CSS world backdrop).
 */
export function computeGameScale(viewportW: number, viewportH: number): number {
  const byWidth = Math.floor(viewportW / GAME_WIDTH);
  const byHeight = Math.floor(viewportH / GAME_HEIGHT);
  return Math.max(1, Math.min(byWidth, byHeight));
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
    left: (viewportW - scaledW) / 2,
    top: (viewportH - scaledH) / 2,
  };
}
