import { GAME_HEIGHT, GAME_WIDTH } from './constants';

/** Fixed chrome dimensions (px) — game area scales via integer Phaser zoom. */
export const CABINET = {
  MARQUEE_H: 72,
  CONTROL_H: 148,
  SIDE_W: 52,
  BEZEL: 18,
  BASE_H: 28,
  VIEWPORT_PAD: 20,
} as const;

export interface CabinetLayout {
  gameScale: number;
  scaledW: number;
  scaledH: number;
  cabinetW: number;
  cabinetH: number;
  cabinetLeft: number;
  cabinetTop: number;
  crtLeft: number;
  crtTop: number;
  crtW: number;
  crtH: number;
}

export function computeGameScale(isFullscreen: boolean, viewportW: number, viewportH: number): number {
  if (isFullscreen) {
    const pad = 0;
    const maxW = viewportW - pad * 2;
    const maxH = viewportH - pad * 2;
    return Math.max(
      1,
      Math.min(Math.floor(maxW / GAME_WIDTH), Math.floor(maxH / GAME_HEIGHT)),
    );
  }

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

export function computeCabinetLayout(
  isFullscreen: boolean,
  viewportW: number,
  viewportH: number,
  gameScale: number,
): CabinetLayout {
  const scaledW = GAME_WIDTH * gameScale;
  const scaledH = GAME_HEIGHT * gameScale;

  if (isFullscreen) {
    const crtLeft = Math.max(0, (viewportW - scaledW) / 2);
    const crtTop = Math.max(0, (viewportH - scaledH) / 2);
    return {
      gameScale,
      scaledW,
      scaledH,
      cabinetW: scaledW,
      cabinetH: scaledH,
      cabinetLeft: crtLeft,
      cabinetTop: crtTop,
      crtLeft,
      crtTop,
      crtW: scaledW,
      crtH: scaledH,
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
    gameScale,
    scaledW,
    scaledH,
    cabinetW,
    cabinetH,
    cabinetLeft,
    cabinetTop,
    crtLeft,
    crtTop,
    crtW: scaledW,
    crtH: scaledH,
  };
}
