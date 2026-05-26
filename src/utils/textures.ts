import Phaser from 'phaser';
import { CHARACTERS } from '../config/characters';

function drawRect(g: Phaser.GameObjects.Graphics, w: number, h: number, color: number, border?: number): void {
  g.fillStyle(color, 1);
  g.fillRect(0, 0, w, h);
  if (border !== undefined) {
    g.lineStyle(2, border, 1);
    g.strokeRect(1, 1, w - 2, h - 2);
  }
}

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

const BLAZE_PALETTES: Record<string, CharColors> = {
  eashan: { ...PALETTES.eashan, head: 0xff6600, headShade: 0xcc5200, body: 0xff9933, bodyShade: 0xe67e22 },
  luna: { ...PALETTES.luna, head: 0xff44aa, headShade: 0xcc2288, body: 0xff66cc, bodyShade: 0xdd44aa },
  rex: { ...PALETTES.rex, head: 0x00cc66, headShade: 0x009944, body: 0x44ff88, bodyShade: 0x22cc66 },
  zap: { ...PALETTES.zap, head: 0xffff00, headShade: 0xcccc00, body: 0xffee44, bodyShade: 0xffcc00 },
};

type Pose = 'idle' | 'run1' | 'run2' | 'run3';

function px(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
  alpha = 1,
): void {
  g.fillStyle(color, alpha);
  g.fillRect(x, y, w, h);
}

function runOffsets(pose: Pose): { lLeg: number; rLeg: number; lArm: number; rArm: number; bounce: number } {
  switch (pose) {
    case 'run1':
      return { lLeg: -2, rLeg: 2, lArm: 2, rArm: -2, bounce: -1 };
    case 'run2':
      return { lLeg: 0, rLeg: 0, lArm: 0, rArm: 0, bounce: -2 };
    case 'run3':
      return { lLeg: 2, rLeg: -2, lArm: -2, rArm: 2, bounce: -1 };
    default:
      return { lLeg: 0, rLeg: 0, lArm: 0, rArm: 0, bounce: 0 };
  }
}

function drawEashan(g: Phaser.GameObjects.Graphics, c: CharColors, big: boolean, pose: Pose): void {
  const h = big ? 48 : 28;
  const { lLeg, rLeg, lArm, rArm, bounce } = runOffsets(pose);
  const y0 = big ? 0 : 0;
  const capH = big ? 11 : 9;

  // Cap brim + dome (kingdom hero)
  px(g, 1, y0 + capH - 2 + bounce, 22, 3, c.headShade);
  px(g, 3, y0 + 1 + bounce, 18, capH - 2, c.head);
  px(g, 3, y0 + 1 + bounce, 5, capH - 3, c.headShade);
  px(g, 10, y0 + 3 + bounce, 6, 4, 0xffffff);
  px(g, 11, y0 + 4 + bounce, 4, 2, c.head);

  // Face
  px(g, 7, y0 + (big ? 7 : 6) + bounce, 10, big ? 7 : 5, c.skin);
  px(g, 7, y0 + (big ? 7 : 6) + bounce, 10, 2, c.skin, 0.85);
  px(g, 9, y0 + (big ? 9 : 8) + bounce, 2, 2, c.eye);
  px(g, 14, y0 + (big ? 9 : 8) + bounce, 2, 2, c.eye);
  px(g, 10, y0 + (big ? 12 : 10) + bounce, 4, 1, 0xc0392b);

  // Overalls + straps
  const bodyY = y0 + (big ? 14 : 11) + bounce;
  const bodyH = big ? 22 : 11;
  px(g, 5, bodyY, 14, bodyH, c.body);
  px(g, 5, bodyY, 3, bodyH, c.bodyShade);
  px(g, 16, bodyY, 3, bodyH, c.bodyShade);
  px(g, 7, bodyY - (big ? 4 : 3), 2, big ? 6 : 4, c.bodyShade);
  px(g, 15, bodyY - (big ? 4 : 3), 2, big ? 6 : 4, c.bodyShade);
  px(g, 10, bodyY + 1, 4, big ? 7 : 4, c.accent);
  px(g, 11, bodyY + (big ? 3 : 2), 2, big ? 3 : 2, c.bodyShade);

  // Arms
  px(g, 3 + lArm, bodyY + 2, 3, big ? 8 : 5, c.body);
  px(g, 16 + rArm, bodyY + 2, 3, big ? 8 : 5, c.body);

  // Boots
  const footY = h - 6 + bounce;
  px(g, 6 + lLeg, footY, 5, 6, c.boots);
  px(g, 6 + lLeg, footY + 4, 5, 2, c.bootsShade);
  px(g, 14 + rLeg, footY, 5, 6, c.boots);
  px(g, 14 + rLeg, footY + 4, 5, 2, c.bootsShade);
}

function drawLuna(g: Phaser.GameObjects.Graphics, c: CharColors, big: boolean, pose: Pose): void {
  const h = big ? 48 : 28;
  const { lLeg, rLeg, bounce } = runOffsets(pose);
  const capH = big ? 10 : 8;

  // Hair + ponytail
  px(g, 4, 1 + bounce, 16, capH, c.head);
  px(g, 4, 1 + bounce, 5, capH, c.headShade);
  px(g, 18, 3 + bounce, 4, big ? 14 : 9, c.head);
  px(g, 19, 4 + bounce, 2, big ? 12 : 7, c.headShade);

  // Headband
  px(g, 4, (big ? 6 : 5) + bounce, 16, 2, c.accent);
  px(g, 5, (big ? 6 : 5) + bounce, 14, 1, 0xffffff, 0.35);

  // Face
  px(g, 7, (big ? 7 : 6) + bounce, 10, big ? 6 : 5, c.skin);
  px(g, 9, (big ? 9 : 8) + bounce, 2, 2, c.eye);
  px(g, 14, (big ? 9 : 8) + bounce, 2, 2, c.eye);

  // Sleek suit
  const bodyY = (big ? 13 : 11) + bounce;
  const bodyH = big ? 21 : 11;
  px(g, 6, bodyY, 12, bodyH, c.body);
  px(g, 6, bodyY, 2, bodyH, c.bodyShade);
  px(g, 16, bodyY, 2, bodyH, c.bodyShade);
  px(g, 11, bodyY + 1, 2, bodyH - 2, c.accent);
  px(g, 8, bodyY + (big ? 8 : 5), 8, 1, c.accent, 0.55);
  px(g, 8, bodyY + (big ? 14 : 8), 8, 1, c.accent, 0.55);

  // Boots (sprinter)
  px(g, 7 + lLeg, h - 5 + bounce, 4, 5, c.boots);
  px(g, 7 + lLeg, h - 2, 4, 2, c.bootsShade);
  px(g, 14 + rLeg, h - 5 + bounce, 4, 5, c.boots);
  px(g, 14 + rLeg, h - 2, 4, 2, c.bootsShade);
}

function drawRex(g: Phaser.GameObjects.Graphics, c: CharColors, big: boolean, pose: Pose): void {
  const h = big ? 48 : 28;
  const { lLeg, rLeg, bounce } = runOffsets(pose);

  // Helmet
  px(g, 2, 1 + bounce, 20, big ? 12 : 10, c.head);
  px(g, 2, 1 + bounce, 20, 3, c.headShade);
  px(g, 2, 1 + bounce, 4, big ? 12 : 10, c.headShade);
  px(g, 5, (big ? 6 : 5) + bounce, 14, big ? 4 : 3, c.accent);
  px(g, 6, (big ? 7 : 6) + bounce, 5, 2, 0xffffff, 0.45);
  px(g, 13, (big ? 7 : 6) + bounce, 5, 2, 0xffffff, 0.45);

  // Shoulder armor
  const bodyY = (big ? 12 : 10) + bounce;
  const bodyH = big ? 22 : 12;
  px(g, 1, bodyY, 22, bodyH, c.body);
  px(g, 1, bodyY, 5, bodyH, c.bodyShade);
  px(g, 18, bodyY, 5, bodyH, c.bodyShade);
  px(g, 1, bodyY, 6, 4, c.bodyShade);
  px(g, 17, bodyY, 6, 4, c.bodyShade);
  px(g, 8, bodyY + 2, 8, big ? 9 : 6, c.accent);
  px(g, 9, bodyY + 3, 6, big ? 7 : 4, c.bodyShade);

  // Heavy boots
  px(g, 4 + lLeg, h - 7 + bounce, 7, 7, c.boots);
  px(g, 4 + lLeg, h - 2, 7, 2, c.bootsShade);
  px(g, 13 + rLeg, h - 7 + bounce, 7, 7, c.boots);
  px(g, 13 + rLeg, h - 2, 7, 2, c.bootsShade);
}

function drawZap(g: Phaser.GameObjects.Graphics, c: CharColors, big: boolean, pose: Pose): void {
  const h = big ? 48 : 28;
  const { lLeg, rLeg, bounce } = runOffsets(pose);

  // Spiky hair
  px(g, 6, (big ? 4 : 3) + bounce, 12, big ? 6 : 5, c.head);
  px(g, 6, (big ? 4 : 3) + bounce, 4, big ? 6 : 5, c.headShade);
  g.fillStyle(c.head, 1);
  g.fillTriangle(6, 2 + bounce, 8, 0 + bounce, 10, 3 + bounce);
  g.fillTriangle(10, 1 + bounce, 13, 0 + bounce, 15, 3 + bounce);
  g.fillTriangle(14, 2 + bounce, 17, 0 + bounce, 18, 4 + bounce);
  px(g, 11, 1 + bounce, 2, 2, c.accent);

  // Face
  px(g, 7, (big ? 8 : 7) + bounce, 10, big ? 5 : 4, c.skin);
  px(g, 9, (big ? 9 : 8) + bounce, 2, 2, c.eye);
  px(g, 14, (big ? 9 : 8) + bounce, 2, 2, c.eye);

  // Slim suit + lightning bolt
  const bodyY = (big ? 13 : 11) + bounce;
  const bodyH = big ? 21 : 11;
  px(g, 7, bodyY, 10, bodyH, c.body);
  px(g, 7, bodyY, 2, bodyH, c.bodyShade);
  px(g, 11, bodyY + 1, 2, 3, c.accent);
  px(g, 9, bodyY + 4, 6, 2, c.accent);
  px(g, 11, bodyY + 6, 2, 3, c.accent);
  px(g, 15, bodyY, 2, bodyH, c.bodyShade);

  // Slim boots
  px(g, 8 + lLeg, h - 5 + bounce, 4, 5, c.boots);
  px(g, 8 + lLeg, h - 2, 4, 2, c.bootsShade);
  px(g, 13 + rLeg, h - 5 + bounce, 4, 5, c.boots);
  px(g, 13 + rLeg, h - 2, 4, 2, c.bootsShade);
}

const DRAWERS: Record<string, typeof drawEashan> = {
  eashan: drawEashan,
  luna: drawLuna,
  rex: drawRex,
  zap: drawZap,
};

function generateCharacterTextures(
  g: Phaser.GameObjects.Graphics,
  characterId: string,
): void {
  const drawer = DRAWERS[characterId] ?? drawEashan;
  const palette = PALETTES[characterId] ?? PALETTES.eashan;
  const blazePalette = BLAZE_PALETTES[characterId] ?? BLAZE_PALETTES.eashan;

  const variants: { prefix: string; big: boolean; colors: CharColors }[] = [
    { prefix: `${characterId}-small`, big: false, colors: palette },
    { prefix: `${characterId}-big`, big: true, colors: palette },
    { prefix: `${characterId}-blaze`, big: true, colors: blazePalette },
  ];

  for (const { prefix, big, colors } of variants) {
    const h = big ? 48 : 28;
    const w = 24;
    drawer(g, colors, big, 'idle');
    g.generateTexture(prefix, w, h);
    g.clear();

    drawer(g, colors, big, 'run1');
    g.generateTexture(`${prefix}-run1`, w, h);
    g.clear();

    drawer(g, colors, big, 'run2');
    g.generateTexture(`${prefix}-run2`, w, h);
    g.clear();

    drawer(g, colors, big, 'run3');
    g.generateTexture(`${prefix}-run3`, w, h);
    g.clear();
  }
}

export function generateTextures(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });

  // Tileset pieces (32x32)
  g.fillStyle(0x5d4037, 1);
  g.fillRect(0, 14, 32, 18);
  g.fillStyle(0x6d4c2a, 1);
  g.fillRect(0, 18, 32, 14);
  g.fillStyle(0x7cb342, 1);
  g.fillRect(0, 0, 32, 14);
  g.fillStyle(0x558b2f, 1);
  g.fillRect(0, 10, 32, 4);
  g.fillStyle(0x9ccc65, 1);
  g.fillRect(4, 2, 6, 4);
  g.fillRect(18, 4, 8, 3);
  g.fillRect(26, 2, 4, 4);
  g.lineStyle(1, 0x33691e, 0.35);
  g.lineBetween(0, 14, 32, 14);
  g.generateTexture('tile-ground', 32, 32);
  g.clear();

  g.fillStyle(0xc84b0a, 1);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(0x9a3808, 1);
  g.fillRect(0, 0, 32, 4);
  g.fillRect(0, 28, 32, 4);
  g.fillStyle(0xe8651a, 1);
  g.fillRect(2, 2, 14, 14);
  g.fillRect(16, 16, 14, 14);
  g.fillStyle(0xff8844, 0.4);
  g.fillRect(3, 3, 6, 6);
  g.fillRect(17, 17, 6, 6);
  g.lineStyle(2, 0x8b2e00, 1);
  g.strokeRect(1, 1, 30, 30);
  g.lineStyle(1, 0x6b2200, 0.5);
  for (let y = 8; y < 32; y += 8) {
    g.lineBetween(0, y, 32, y);
  }
  g.generateTexture('tile-brick', 32, 32);
  g.clear();

  g.fillStyle(0xf5a623, 1);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(0xffd54f, 1);
  g.fillRect(2, 2, 28, 10);
  g.fillStyle(0xc47d00, 1);
  g.fillRect(2, 24, 28, 6);
  g.fillStyle(0xffffff, 1);
  g.fillRect(10, 8, 12, 12);
  g.fillStyle(0x000000, 1);
  g.fillRect(13, 11, 6, 6);
  g.fillStyle(0xffd700, 0.55);
  g.fillRect(3, 3, 7, 7);
  g.generateTexture('tile-question', 32, 32);
  g.clear();

  g.fillStyle(0x8d6e4a, 1);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(0x6d4c2a, 1);
  g.fillRect(2, 2, 28, 28);
  g.fillStyle(0x5a4028, 1);
  g.fillRect(10, 10, 12, 12);
  g.generateTexture('tile-question-used', 32, 32);
  g.clear();

  g.fillStyle(0x1a6b1a, 1);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(0x228b22, 1);
  g.fillRect(2, 0, 28, 32);
  g.fillStyle(0x2ecc40, 1);
  g.fillRect(4, 2, 8, 28);
  g.fillStyle(0x44ff66, 0.35);
  g.fillRect(6, 4, 3, 20);
  g.fillStyle(0x145214, 1);
  g.fillRect(24, 0, 6, 32);
  g.lineStyle(2, 0x0d3d0d, 1);
  g.strokeRect(1, 1, 30, 30);
  g.generateTexture('tile-pipe', 32, 32);
  g.clear();

  drawRect(g, 32, 32, 0x5c4033, 0x3d2817);
  g.generateTexture('tile-hard', 32, 32);
  g.clear();

  drawRect(g, 32, 32, 0x8b6914, 0x5c4510);
  g.generateTexture('tile-hidden', 32, 32);
  g.clear();

  drawRect(g, 32, 8, 0xaaaaaa, 0x666666);
  g.generateTexture('tile-oneway', 32, 8);
  g.clear();

  drawRect(g, 32, 32, 0xff0000);
  g.fillStyle(0xffffff, 1);
  g.fillRect(14, 0, 4, 32);
  g.generateTexture('tile-flag', 32, 32);
  g.clear();

  // Flagpole — pole segment, finial ball, waving flag
  g.fillStyle(0xb0b0b0, 1);
  g.fillRect(14, 0, 4, 32);
  g.fillStyle(0x909090, 1);
  g.fillRect(15, 2, 2, 28);
  g.fillStyle(0xd8d8d8, 1);
  g.fillRect(14, 0, 4, 4);
  g.generateTexture('flagpole-pole', 32, 32);
  g.clear();

  g.fillStyle(0xb0b0b0, 1);
  g.fillRect(12, 8, 8, 24);
  g.fillStyle(0x909090, 1);
  g.fillRect(14, 10, 4, 20);
  g.fillStyle(0xe04040, 1);
  g.fillRect(16, 12, 14, 10);
  g.fillStyle(0xc03030, 1);
  g.fillRect(16, 22, 14, 8);
  g.fillStyle(0xff6060, 1);
  g.fillRect(17, 13, 5, 4);
  g.generateTexture('flagpole-top', 32, 32);
  g.clear();

  g.fillStyle(0xd4af37, 1);
  g.fillCircle(8, 8, 7);
  g.fillStyle(0xffd700, 1);
  g.fillCircle(8, 8, 5);
  g.fillStyle(0xfff8dc, 0.5);
  g.fillCircle(6, 6, 2);
  g.generateTexture('flagpole-ball', 16, 16);
  g.clear();

  g.fillStyle(0xe53935, 1);
  g.fillRect(0, 4, 22, 14);
  g.fillStyle(0xc62828, 1);
  g.fillRect(0, 14, 22, 4);
  g.fillStyle(0xff5252, 1);
  g.fillRect(2, 6, 8, 5);
  g.fillStyle(0xffffff, 1);
  g.fillRect(0, 9, 3, 4);
  g.generateTexture('flagpole-flag', 24, 20);
  g.clear();

  g.fillStyle(0x5d4037, 1);
  g.fillRect(2, 8, 20, 24);
  g.fillStyle(0x3e2723, 1);
  g.fillRect(4, 10, 16, 20);
  g.fillStyle(0x8d6e63, 1);
  g.fillRect(8, 14, 8, 12);
  g.fillStyle(0xffecb3, 0.4);
  g.fillRect(9, 15, 6, 4);
  g.generateTexture('goal-castle-door', 24, 32);
  g.clear();

  // All playable characters
  for (const character of CHARACTERS) {
    generateCharacterTextures(g, character.id);
  }

  // Walker enemy — idle + walk cycle (28x24)
  const drawWalker = (legOff: number) => {
    g.fillStyle(0x6b3410, 1);
    g.fillEllipse(14, 16, 24, 12);
    g.fillStyle(0x8b4513, 1);
    g.fillEllipse(14, 13, 26, 18);
    g.fillStyle(0xa0522d, 1);
    g.fillEllipse(14, 10, 20, 14);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 10, 4);
    g.fillCircle(20, 10, 4);
    g.fillStyle(0x000000, 1);
    g.fillCircle(9, 10, 2);
    g.fillCircle(21, 10, 2);
    g.fillStyle(0x5c3317, 1);
    g.fillRect(6 + legOff, 20, 5, 4);
    g.fillRect(17 - legOff, 20, 5, 4);
  };
  drawWalker(0);
  g.generateTexture('enemy-walker', 28, 24);
  g.clear();
  drawWalker(2);
  g.generateTexture('enemy-walker-run1', 28, 24);
  g.clear();
  drawWalker(-2);
  g.generateTexture('enemy-walker-run2', 28, 24);
  g.clear();

  // Shell enemy (28x24)
  g.fillStyle(0x2ecc71, 1);
  g.fillEllipse(14, 14, 26, 22);
  g.fillStyle(0xffffff, 1);
  g.fillRect(4, 6, 20, 4);
  g.fillRect(4, 14, 20, 4);
  g.generateTexture('enemy-shell', 28, 24);
  g.clear();

  g.fillStyle(0x27ae60, 1);
  g.fillEllipse(14, 12, 24, 20);
  g.generateTexture('enemy-shell-only', 28, 24);
  g.clear();

  const drawFlyer = (wingUp: boolean) => {
    g.fillStyle(0x7d3c98, 1);
    g.fillEllipse(14, 12, 20, 14);
    g.fillStyle(0x9b59b6, 1);
    g.fillEllipse(14, 11, 18, 12);
    g.fillStyle(wingUp ? 0xc39bd3 : 0x8e44ad, 1);
    g.fillEllipse(5, 10, 12, wingUp ? 6 : 10);
    g.fillEllipse(23, 10, 12, wingUp ? 6 : 10);
    g.fillStyle(0xe74c3c, 1);
    g.fillCircle(8, 8, 3);
    g.fillCircle(20, 8, 3);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(7, 7, 1);
    g.fillCircle(19, 7, 1);
  };
  drawFlyer(true);
  g.generateTexture('enemy-flyer', 28, 20);
  g.clear();
  drawFlyer(false);
  g.generateTexture('enemy-flyer-wing', 28, 20);
  g.clear();

  const drawCoinFrame = (frame: 0 | 1 | 2) => {
    if (frame === 0) {
      g.fillStyle(0xcc8800, 1);
      g.fillCircle(8, 8, 7);
      g.fillStyle(0xffd700, 1);
      g.fillCircle(8, 8, 6);
      g.fillStyle(0xfff8dc, 1);
      g.fillCircle(6, 6, 2);
      g.fillCircle(10, 5, 1);
      g.fillStyle(0xffffff, 0.5);
      g.fillRect(5, 4, 3, 2);
    } else if (frame === 1) {
      g.fillStyle(0xcc8800, 1);
      g.fillEllipse(8, 8, 4, 7);
      g.fillStyle(0xffd700, 1);
      g.fillEllipse(8, 8, 2, 6);
      g.fillStyle(0xfff8dc, 0.9);
      g.fillRect(7, 4, 2, 4);
    } else {
      g.fillStyle(0xcc8800, 1);
      g.fillRect(7, 2, 2, 12);
      g.fillStyle(0xffd700, 1);
      g.fillRect(7, 3, 2, 10);
    }
  };
  drawCoinFrame(0);
  g.generateTexture('coin', 16, 16);
  g.clear();
  drawCoinFrame(1);
  g.generateTexture('coin-side', 16, 16);
  g.clear();
  drawCoinFrame(2);
  g.generateTexture('coin-thin', 16, 16);
  g.clear();

  g.fillStyle(0xff4444, 1);
  g.fillRoundedRect(0, 4, 20, 16, 4);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(10, 12, 3);
  g.generateTexture('powerup-spark', 20, 24);
  g.clear();

  g.fillStyle(0xff6600, 1);
  g.fillCircle(10, 12, 10);
  g.fillStyle(0xffcc00, 1);
  g.fillCircle(10, 12, 5);
  g.generateTexture('powerup-blaze', 20, 24);
  g.clear();

  g.fillStyle(0xffff00, 1);
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    g.fillTriangle(
      10 + Math.cos(angle) * 10,
      12 + Math.sin(angle) * 10,
      10 + Math.cos(angle + 0.4) * 4,
      12 + Math.sin(angle + 0.4) * 4,
      10 + Math.cos(angle - 0.4) * 4,
      12 + Math.sin(angle - 0.4) * 4,
    );
  }
  g.generateTexture('powerup-star', 20, 24);
  g.clear();

  g.fillStyle(0xff4400, 1);
  g.fillCircle(6, 6, 5);
  g.generateTexture('projectile', 12, 12);
  g.clear();

  g.fillStyle(0xffffff, 1);
  g.fillRect(0, 0, 4, 4);
  g.generateTexture('particle', 4, 4);
  g.clear();

  g.fillStyle(0x4aa3d4, 1);
  g.fillRect(0, 0, 800, 120);
  g.fillStyle(0x5bc0eb, 1);
  g.fillRect(0, 120, 800, 180);
  g.fillStyle(0x87ceeb, 1);
  g.fillRect(0, 300, 800, 120);
  g.fillStyle(0xb8e4f9, 1);
  g.fillRect(0, 420, 800, 60);
  g.generateTexture('bg-sky', 800, 480);
  g.clear();

  g.fillStyle(0xffffff, 0.92);
  const cloudBlobs: [number, number, number, number][] = [
    [90, 70, 110, 38],
    [280, 55, 90, 32],
    [520, 85, 130, 42],
    [700, 50, 100, 36],
  ];
  for (const [cx, cy, cw, ch] of cloudBlobs) {
    g.fillEllipse(cx, cy, cw, ch);
    g.fillEllipse(cx - cw * 0.25, cy + 6, cw * 0.55, ch * 0.75);
    g.fillEllipse(cx + cw * 0.2, cy + 4, cw * 0.5, ch * 0.7);
  }
  g.generateTexture('bg-clouds', 800, 160);
  g.clear();

  g.fillStyle(0x66bb6a, 1);
  for (let x = -40; x < 840; x += 48) {
    const h = 38 + (x % 96 === 0 ? 8 : 0);
    g.fillEllipse(x + 24, 118 - h * 0.15, 56, h);
    g.fillEllipse(x + 44, 114 - h * 0.1, 36, h * 0.72);
    g.fillEllipse(x + 8, 116 - h * 0.12, 32, h * 0.65);
  }
  g.fillStyle(0x43a047, 1);
  for (let x = -20; x < 820; x += 64) {
    g.fillEllipse(x + 32, 112, 72, 34);
  }
  g.fillStyle(0x388e3c, 0.9);
  for (let x = 10; x < 810; x += 80) {
    g.fillEllipse(x + 18, 118, 28, 16);
    g.fillEllipse(x + 46, 115, 24, 14);
  }
  g.lineStyle(1, 0x2e7d32, 0.35);
  g.lineBetween(0, 119, 800, 119);
  g.generateTexture('bg-hills', 800, 120);
  g.clear();

  g.fillStyle(0x1b5e3a, 0.5);
  for (let x = -60; x < 860; x += 110) {
    g.fillEllipse(x + 55, 132, 100, 62);
  }
  g.fillStyle(0x0d4a32, 0.7);
  for (let x = -10; x < 810; x += 130) {
    g.fillEllipse(x + 65, 122, 88, 78);
  }
  g.fillStyle(0x063d28, 0.85);
  for (let x = 40; x < 780; x += 150) {
    g.fillEllipse(x + 60, 108, 72, 88);
  }
  g.generateTexture('bg-mountains', 800, 150);
  g.clear();

  g.fillStyle(0x00f5ff, 0.3);
  g.fillRect(0, 0, 96, 12);
  g.fillStyle(0x4488aa, 1);
  g.fillRect(0, 2, 96, 8);
  g.fillStyle(0x66ccff, 1);
  g.fillRect(2, 3, 92, 3);
  g.generateTexture('tile-moving', 96, 12);
  g.clear();

  drawRect(g, 32, 32, 0x888888, 0x555555);
  g.generateTexture('tile-used', 32, 32);
  g.clear();

  // Underground — darker palette with stone grain
  g.fillStyle(0x2a1a10, 1);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(0x4a3728, 1);
  g.fillRect(0, 8, 32, 24);
  g.fillStyle(0x5c4033, 1);
  g.fillRect(2, 10, 12, 8);
  g.fillRect(18, 18, 12, 8);
  g.fillStyle(0x3d2817, 1);
  g.fillRect(14, 14, 4, 4);
  g.lineStyle(1, 0x1a0f08, 0.6);
  for (let y = 8; y < 32; y += 8) g.lineBetween(0, y, 32, y);
  g.generateTexture('tile-ground-underground', 32, 32);
  g.clear();

  drawRect(g, 32, 32, 0x88ccff, 0x6699cc);
  g.generateTexture('tile-ground-sky', 32, 32);
  g.clear();

  drawRect(g, 32, 32, 0x555555, 0x333333);
  g.fillStyle(0x772222, 0.4);
  g.fillRect(4, 24, 24, 6);
  g.generateTexture('tile-ground-castle', 32, 32);
  g.clear();

  drawRect(g, 32, 32, 0xf4a020, 0xc47a00);
  g.fillStyle(0xffd700, 1);
  g.fillCircle(16, 16, 8);
  g.generateTexture('tile-coin-block', 32, 32);
  g.clear();

  drawRect(g, 32, 32, 0x44aa44, 0x228822);
  g.fillStyle(0x66cc66, 1);
  g.fillRect(6, 6, 20, 4);
  g.fillRect(6, 14, 20, 4);
  g.fillRect(6, 22, 20, 4);
  g.fillStyle(0xffffff, 1);
  g.fillRect(10, 8, 12, 8);
  g.fillStyle(0xcccccc, 1);
  g.fillRect(12, 10, 8, 4);
  g.generateTexture('tile-spring', 32, 32);
  g.clear();

  g.fillStyle(0x228822, 1);
  g.fillRect(10, 16, 8, 12);
  g.fillStyle(0xff2244, 1);
  g.fillCircle(14, 10, 10);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(10, 8, 3);
  g.fillCircle(18, 8, 3);
  g.generateTexture('enemy-piranha', 28, 28);
  g.clear();

  g.fillStyle(0x444444, 1);
  g.fillRect(4, 8, 36, 36);
  g.fillStyle(0xffcc00, 1);
  g.fillRect(10, 4, 24, 8);
  g.fillStyle(0xff0000, 1);
  g.fillCircle(14, 20, 4);
  g.fillCircle(30, 20, 4);
  g.generateTexture('enemy-boss', 44, 44);
  g.clear();

  g.fillStyle(0x00cc44, 1);
  g.fillEllipse(10, 14, 18, 14);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(6, 12, 3);
  g.fillCircle(14, 10, 3);
  g.fillStyle(0xf5deb3, 1);
  g.fillRect(7, 16, 6, 8);
  g.generateTexture('powerup-oneup', 20, 24);
  g.clear();

  g.destroy();
}
