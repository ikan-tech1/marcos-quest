/** Canvas-based character idle previews for React menu (matches in-game pixel art). */

interface CharColors {
  head: number;
  headShade: number;
  body: number;
  bodyShade: number;
  accent: number;
  skin: number;
  boots: number;
  bootsShade: number;
  eye: number;
}

const PALETTES: Record<string, CharColors> = {
  eashan: {
    head: 0xe74c3c,
    headShade: 0xc0392b,
    body: 0x3498db,
    bodyShade: 0x2471a3,
    accent: 0xf5deb3,
    skin: 0xffdbac,
    boots: 0x2c3e50,
    bootsShade: 0x1a252f,
    eye: 0x2c3e50,
  },
  luna: {
    head: 0x9b59b6,
    headShade: 0x7d3c98,
    body: 0x6c3483,
    bodyShade: 0x512e5f,
    accent: 0xe056fd,
    skin: 0xffeaa7,
    boots: 0x5f27cd,
    bootsShade: 0x341f97,
    eye: 0x2d3436,
  },
  rex: {
    head: 0x27ae60,
    headShade: 0x1e8449,
    body: 0x2ecc71,
    bodyShade: 0x1a8f4a,
    accent: 0x145a32,
    skin: 0xd4a574,
    boots: 0x1a5276,
    bootsShade: 0x0e3250,
    eye: 0x1b2631,
  },
  zap: {
    head: 0xf1c40f,
    headShade: 0xd4ac0d,
    body: 0xf39c12,
    bodyShade: 0xca7a0a,
    accent: 0xfff176,
    skin: 0xffdbac,
    boots: 0xe67e22,
    bootsShade: 0xba4a00,
    eye: 0x2c3e50,
  },
};

function hex(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

function fill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
): void {
  ctx.fillStyle = hex(color);
  ctx.fillRect(x, y, w, h);
}

function drawEashan(ctx: CanvasRenderingContext2D, c: CharColors, big: boolean): void {
  const h = big ? 48 : 28;
  fill(ctx, 2, big ? 8 : 6, 20, 3, c.headShade);
  fill(ctx, 4, 0, 16, big ? 10 : 8, c.head);
  fill(ctx, 4, 0, 4, big ? 6 : 5, c.headShade);
  fill(ctx, 6, big ? 6 : 5, 12, big ? 6 : 5, c.skin);
  fill(ctx, 8, big ? 8 : 7, 2, 2, c.eye);
  fill(ctx, 14, big ? 8 : 7, 2, 2, c.eye);
  fill(ctx, 4, big ? 12 : 10, 16, big ? 20 : 10, c.body);
  fill(ctx, 4, big ? 12 : 10, 4, big ? 20 : 10, c.bodyShade);
  fill(ctx, 16, big ? 12 : 10, 4, big ? 20 : 10, c.bodyShade);
  fill(ctx, 10, big ? 14 : 11, 4, big ? 6 : 4, c.accent);
  fill(ctx, 5, h - 6, 5, 6, c.boots);
  fill(ctx, 14, h - 6, 5, 6, c.boots);
  fill(ctx, 5, h - 2, 5, 2, c.bootsShade);
  fill(ctx, 14, h - 2, 5, 2, c.bootsShade);
}

function drawLuna(ctx: CanvasRenderingContext2D, c: CharColors, big: boolean): void {
  const h = big ? 48 : 28;
  fill(ctx, 3, 0, 18, big ? 9 : 7, c.head);
  fill(ctx, 18, 2, 4, big ? 14 : 8, c.head);
  fill(ctx, 3, 0, 6, big ? 9 : 7, c.headShade);
  fill(ctx, 4, big ? 5 : 4, 16, 2, c.accent);
  fill(ctx, 6, big ? 6 : 5, 12, big ? 5 : 4, c.skin);
  fill(ctx, 8, big ? 7 : 6, 2, 2, c.eye);
  fill(ctx, 14, big ? 7 : 6, 2, 2, c.eye);
  fill(ctx, 5, big ? 11 : 9, 14, big ? 21 : 11, c.body);
  fill(ctx, 5, big ? 11 : 9, 3, big ? 21 : 11, c.bodyShade);
  fill(ctx, 11, big ? 13 : 10, 2, big ? 16 : 8, c.accent);
  fill(ctx, 7, big ? 18 : 14, 10, 1, c.accent);
  fill(ctx, 6, h - 5, 4, 5, c.boots);
  fill(ctx, 14, h - 5, 4, 5, c.boots);
}

function drawRex(ctx: CanvasRenderingContext2D, c: CharColors, big: boolean): void {
  const h = big ? 48 : 28;
  fill(ctx, 2, 0, 20, big ? 10 : 8, c.head);
  fill(ctx, 2, 0, 6, big ? 10 : 8, c.headShade);
  fill(ctx, 5, big ? 4 : 3, 14, 3, c.accent);
  fill(ctx, 6, big ? 7 : 6, 12, big ? 6 : 5, c.skin);
  fill(ctx, 8, big ? 9 : 8, 2, 2, c.eye);
  fill(ctx, 14, big ? 9 : 8, 2, 2, c.eye);
  fill(ctx, 3, big ? 13 : 11, 18, big ? 22 : 11, c.body);
  fill(ctx, 3, big ? 13 : 11, 5, big ? 22 : 11, c.bodyShade);
  fill(ctx, 16, big ? 13 : 11, 5, big ? 22 : 11, c.bodyShade);
  fill(ctx, 4, h - 7, 7, 7, c.boots);
  fill(ctx, 13, h - 7, 7, 7, c.boots);
  fill(ctx, 4, h - 2, 7, 2, c.bootsShade);
  fill(ctx, 13, h - 2, 7, 2, c.bootsShade);
}

function drawZap(ctx: CanvasRenderingContext2D, c: CharColors, big: boolean): void {
  const h = big ? 48 : 28;
  fill(ctx, 5, 2, 14, 5, c.head);
  fill(ctx, 5, 2, 4, 5, c.headShade);
  fill(ctx, 6, big ? 7 : 6, 12, big ? 5 : 4, c.skin);
  fill(ctx, 8, big ? 8 : 7, 2, 2, c.eye);
  fill(ctx, 14, big ? 8 : 7, 2, 2, c.eye);
  fill(ctx, 6, big ? 12 : 10, 12, big ? 20 : 10, c.body);
  fill(ctx, 6, big ? 12 : 10, 2, big ? 20 : 10, c.bodyShade);
  fill(ctx, 11, big ? 14 : 11, 2, 3, c.accent);
  fill(ctx, 9, big ? 17 : 14, 6, 2, c.accent);
  fill(ctx, 11, big ? 19 : 16, 2, 3, c.accent);
  fill(ctx, 7, h - 5, 4, 5, c.boots);
  fill(ctx, 13, h - 5, 4, 5, c.boots);
}

const DRAWERS: Record<string, (ctx: CanvasRenderingContext2D, c: CharColors, big: boolean) => void> = {
  eashan: drawEashan,
  luna: drawLuna,
  rex: drawRex,
  zap: drawZap,
};

const cache = new Map<string, string>();

export function getCharacterPreviewDataUrl(characterId: string, scale = 3): string {
  const key = `${characterId}@${scale}`;
  if (cache.has(key)) return cache.get(key)!;

  const drawer = DRAWERS[characterId] ?? drawEashan;
  const palette = PALETTES[characterId] ?? PALETTES.eashan;
  const w = 24;
  const h = 48;

  const canvas = document.createElement('canvas');
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.imageSmoothingEnabled = false;
  ctx.scale(scale, scale);
  drawer(ctx, palette, true);

  const url = canvas.toDataURL('image/png');
  cache.set(key, url);
  return url;
}
