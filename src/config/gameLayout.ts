import { GAME_HEIGHT, GAME_WIDTH } from './constants';

/** Fixed top chrome for fullscreen HUD (px) — game scales in the area below. */
export const FULLSCREEN_HUD_HEIGHT = 44;

export interface GameLayout {
  gameScale: number;
  scaledW: number;
  scaledH: number;
  left: number;
  top: number;
  hudTop: number;
}

/**
 * Integer Phaser zoom — contain mode: largest integer scale that fits entirely
 * inside the viewport play area (letterbox margins filled by CSS world backdrop).
 */
export function computeGameScale(
  viewportW: number,
  viewportH: number,
  hudHeight = FULLSCREEN_HUD_HEIGHT,
): number {
  const playH = Math.max(GAME_HEIGHT, viewportH - hudHeight);
  const byWidth = Math.floor(viewportW / GAME_WIDTH);
  const byHeight = Math.floor(playH / GAME_HEIGHT);
  return Math.max(1, Math.min(byWidth, byHeight));
}

export function computeGameLayout(
  viewportW: number,
  viewportH: number,
  gameScale: number,
  hudHeight = FULLSCREEN_HUD_HEIGHT,
): GameLayout {
  const scaledW = GAME_WIDTH * gameScale;
  const scaledH = GAME_HEIGHT * gameScale;
  const playTop = hudHeight;
  const playH = Math.max(scaledH, viewportH - hudHeight);
  return {
    gameScale,
    scaledW,
    scaledH,
    left: (viewportW - scaledW) / 2,
    top: playTop + (playH - scaledH) / 2,
    hudTop: playTop,
  };
}
