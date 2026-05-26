import { GAME_HEIGHT, GAME_WIDTH } from './constants';
import { computeGameLayout, computeGameScale as computeFullscreenScale } from './gameLayout';

export type ViewMode = 'fullscreen' | 'arcade';

/** Fixed chrome dimensions (px) — game area scales via integer Phaser zoom only. */
export const CABINET = {
  MARQUEE_H: 72,
  CONTROL_H: 148,
  SIDE_W: 52,
  BEZEL: 18,
  BASE_H: 28,
  VIEWPORT_PAD: 24,
} as const;

export interface ViewLayout {
  viewMode: ViewMode;
  gameScale: number;
  scaledW: number;
  scaledH: number;
  left: number;
  top: number;
  crtLeft: number;
  crtTop: number;
  cabinetW: number;
  cabinetH: number;
  cabinetLeft: number;
  cabinetTop: number;
}

export function computeArcadeGameScale(viewportW: number, viewportH: number): number {
  const { MARQUEE_H, CONTROL_H, SIDE_W, BEZEL, BASE_H, VIEWPORT_PAD } = CABINET;
  const chromeW = SIDE_W * 2 + BEZEL * 2;
  const chromeH = MARQUEE_H + BEZEL * 2 + CONTROL_H + BASE_H;
  const maxW = viewportW - VIEWPORT_PAD * 2;
  const maxH = viewportH - VIEWPORT_PAD * 2;

  return Math.max(
    1,
    Math.min(
      Math.floor((maxW - chromeW) / GAME_WIDTH),
      Math.floor((maxH - chromeH) / GAME_HEIGHT),
    ),
  );
}

export function computeViewGameScale(
  viewMode: ViewMode,
  viewportW: number,
  viewportH: number,
): number {
  return viewMode === 'arcade'
    ? computeArcadeGameScale(viewportW, viewportH)
    : computeFullscreenScale(viewportW, viewportH);
}

export function computeViewLayout(
  viewMode: ViewMode,
  viewportW: number,
  viewportH: number,
  gameScale: number,
): ViewLayout {
  const scaledW = GAME_WIDTH * gameScale;
  const scaledH = GAME_HEIGHT * gameScale;

  if (viewMode === 'fullscreen') {
    const layout = computeGameLayout(viewportW, viewportH, gameScale);
    return {
      viewMode,
      gameScale,
      scaledW,
      scaledH,
      left: layout.left,
      top: layout.top,
      crtLeft: layout.left,
      crtTop: layout.top,
      cabinetW: scaledW,
      cabinetH: scaledH,
      cabinetLeft: layout.left,
      cabinetTop: layout.top,
    };
  }

  const { MARQUEE_H, CONTROL_H, SIDE_W, BEZEL, BASE_H } = CABINET;
  const crtW = scaledW + BEZEL * 2;
  const crtH = scaledH + BEZEL * 2;
  const cabinetW = crtW + SIDE_W * 2;
  const cabinetH = MARQUEE_H + crtH + CONTROL_H + BASE_H;
  const cabinetLeft = Math.max(0, (viewportW - cabinetW) / 2);
  const cabinetTop = Math.max(0, (viewportH - cabinetH) / 2);
  const crtLeft = cabinetLeft + SIDE_W + BEZEL;
  const crtTop = cabinetTop + MARQUEE_H + BEZEL;

  return {
    viewMode,
    gameScale,
    scaledW,
    scaledH,
    left: crtLeft,
    top: crtTop,
    crtLeft,
    crtTop,
    cabinetW,
    cabinetH,
    cabinetLeft,
    cabinetTop,
  };
}
