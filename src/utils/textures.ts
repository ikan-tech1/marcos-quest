import Phaser from 'phaser';

function drawRect(g: Phaser.GameObjects.Graphics, w: number, h: number, color: number, border?: number): void {
  g.fillStyle(color, 1);
  g.fillRect(0, 0, w, h);
  if (border !== undefined) {
    g.lineStyle(2, border, 1);
    g.strokeRect(1, 1, w - 2, h - 2);
  }
}

export function generateTextures(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });

  // Tileset pieces (32x32)
  drawRect(g, 32, 32, 0x6b8e23);
  g.fillStyle(0x8fbc8f, 1);
  g.fillRect(2, 2, 28, 8);
  g.generateTexture('tile-ground', 32, 32);
  g.clear();

  drawRect(g, 32, 32, 0xc45c26, 0x8b3a12);
  g.lineStyle(1, 0x8b3a12, 0.6);
  for (let y = 8; y < 32; y += 8) {
    g.lineBetween(0, y, 32, y);
  }
  for (let x = 16; x < 32; x += 16) {
    g.lineBetween(x, 0, x, 32);
  }
  g.generateTexture('tile-brick', 32, 32);
  g.clear();

  drawRect(g, 32, 32, 0xf4a020, 0xc47a00);
  g.fillStyle(0xffffff, 1);
  g.fillRect(10, 8, 12, 12);
  g.fillStyle(0x000000, 1);
  g.fillRect(14, 12, 4, 4);
  g.fillStyle(0xffd700, 0.4);
  g.fillRect(2, 2, 8, 8);
  g.generateTexture('tile-question', 32, 32);
  g.clear();

  drawRect(g, 32, 32, 0xf4a020, 0xc47a00);
  g.fillStyle(0xffd700, 1);
  g.fillRect(12, 10, 8, 12);
  g.generateTexture('tile-question-used', 32, 32);
  g.clear();

  drawRect(g, 32, 32, 0x228b22, 0x145214);
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

  // Player small (24x28)
  g.fillStyle(0xe74c3c, 1);
  g.fillRect(4, 0, 16, 10);
  g.fillStyle(0x3498db, 1);
  g.fillRect(4, 10, 16, 12);
  g.fillStyle(0x2c3e50, 1);
  g.fillRect(6, 22, 5, 6);
  g.fillRect(13, 22, 5, 6);
  g.generateTexture('player-small', 24, 28);
  g.clear();

  // Player small run frames
  g.fillStyle(0xe74c3c, 1);
  g.fillRect(4, 0, 16, 10);
  g.fillStyle(0x3498db, 1);
  g.fillRect(4, 10, 16, 12);
  g.fillStyle(0x2c3e50, 1);
  g.fillRect(5, 22, 5, 6);
  g.fillRect(14, 20, 5, 8);
  g.generateTexture('player-small-run1', 24, 28);
  g.clear();

  g.fillStyle(0xe74c3c, 1);
  g.fillRect(4, 0, 16, 10);
  g.fillStyle(0x3498db, 1);
  g.fillRect(4, 10, 16, 12);
  g.fillStyle(0x2c3e50, 1);
  g.fillRect(14, 22, 5, 6);
  g.fillRect(5, 20, 5, 8);
  g.generateTexture('player-small-run2', 24, 28);
  g.clear();

  // Player big (24x48)
  g.fillStyle(0xe74c3c, 1);
  g.fillRect(4, 0, 16, 10);
  g.fillStyle(0x3498db, 1);
  g.fillRect(2, 10, 20, 22);
  g.fillStyle(0x2c3e50, 1);
  g.fillRect(4, 32, 6, 8);
  g.fillRect(14, 32, 6, 8);
  g.generateTexture('player-big', 24, 48);
  g.clear();

  g.fillStyle(0xe74c3c, 1);
  g.fillRect(4, 0, 16, 10);
  g.fillStyle(0x3498db, 1);
  g.fillRect(2, 10, 20, 22);
  g.fillStyle(0x2c3e50, 1);
  g.fillRect(3, 32, 6, 8);
  g.fillRect(15, 30, 6, 10);
  g.generateTexture('player-big-run1', 24, 48);
  g.clear();

  g.fillStyle(0xe74c3c, 1);
  g.fillRect(4, 0, 16, 10);
  g.fillStyle(0x3498db, 1);
  g.fillRect(2, 10, 20, 22);
  g.fillStyle(0x2c3e50, 1);
  g.fillRect(15, 32, 6, 8);
  g.fillRect(3, 30, 6, 10);
  g.generateTexture('player-big-run2', 24, 48);
  g.clear();

  // Player blaze tint overlay
  g.fillStyle(0xff6600, 1);
  g.fillRect(4, 0, 16, 10);
  g.fillStyle(0xff9933, 1);
  g.fillRect(2, 10, 20, 22);
  g.fillStyle(0x2c3e50, 1);
  g.fillRect(4, 32, 6, 8);
  g.fillRect(14, 32, 6, 8);
  g.generateTexture('player-blaze', 24, 48);
  g.clear();

  g.fillStyle(0xff6600, 1);
  g.fillRect(4, 0, 16, 10);
  g.fillStyle(0xff9933, 1);
  g.fillRect(2, 10, 20, 22);
  g.fillStyle(0x2c3e50, 1);
  g.fillRect(3, 32, 6, 8);
  g.fillRect(15, 30, 6, 10);
  g.generateTexture('player-blaze-run1', 24, 48);
  g.clear();

  g.fillStyle(0xff6600, 1);
  g.fillRect(4, 0, 16, 10);
  g.fillStyle(0xff9933, 1);
  g.fillRect(2, 10, 20, 22);
  g.fillStyle(0x2c3e50, 1);
  g.fillRect(15, 32, 6, 8);
  g.fillRect(3, 30, 6, 10);
  g.generateTexture('player-blaze-run2', 24, 48);
  g.clear();

  // Walker enemy (28x24)
  g.fillStyle(0x8b4513, 1);
  g.fillEllipse(14, 14, 26, 20);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(8, 10, 4);
  g.fillCircle(20, 10, 4);
  g.fillStyle(0x000000, 1);
  g.fillCircle(9, 10, 2);
  g.fillCircle(21, 10, 2);
  g.generateTexture('enemy-walker', 28, 24);
  g.clear();

  // Shell enemy (28x24)
  g.fillStyle(0x2ecc71, 1);
  g.fillEllipse(14, 14, 26, 22);
  g.fillStyle(0xffffff, 1);
  g.fillRect(4, 6, 20, 4);
  g.fillRect(4, 14, 20, 4);
  g.generateTexture('enemy-shell', 28, 24);
  g.clear();

  // Shell only
  g.fillStyle(0x27ae60, 1);
  g.fillEllipse(14, 12, 24, 20);
  g.generateTexture('enemy-shell-only', 28, 24);
  g.clear();

  // Flyer enemy (28x20)
  g.fillStyle(0x9b59b6, 1);
  g.fillEllipse(14, 12, 24, 16);
  g.fillStyle(0xe74c3c, 1);
  g.fillCircle(8, 8, 3);
  g.fillCircle(20, 8, 3);
  g.generateTexture('enemy-flyer', 28, 20);
  g.clear();

  // Coin (16x16) — shiny gold with highlight
  g.fillStyle(0xffaa00, 1);
  g.fillCircle(8, 8, 7);
  g.fillStyle(0xffd700, 1);
  g.fillCircle(8, 8, 5);
  g.fillStyle(0xfff8dc, 1);
  g.fillCircle(6, 6, 2);
  g.fillStyle(0xcc8800, 1);
  g.fillRect(10, 4, 2, 8);
  g.generateTexture('coin', 16, 16);
  g.clear();

  g.fillStyle(0xffaa00, 1);
  g.fillEllipse(8, 8, 4, 7);
  g.fillStyle(0xffd700, 1);
  g.fillEllipse(8, 8, 2, 5);
  g.generateTexture('coin-side', 16, 16);
  g.clear();

  // Power-ups
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

  // Projectile
  g.fillStyle(0xff4400, 1);
  g.fillCircle(6, 6, 5);
  g.generateTexture('projectile', 12, 12);
  g.clear();

  // Particle
  g.fillStyle(0xffffff, 1);
  g.fillRect(0, 0, 4, 4);
  g.generateTexture('particle', 4, 4);
  g.clear();

  // Parallax layers
  g.fillStyle(0x5bc0eb, 1);
  g.fillRect(0, 0, 800, 480);
  g.generateTexture('bg-sky', 800, 480);
  g.clear();

  g.fillStyle(0xffffff, 0.8);
  g.fillEllipse(100, 80, 120, 40);
  g.fillEllipse(400, 60, 100, 35);
  g.fillEllipse(650, 100, 140, 45);
  g.generateTexture('bg-clouds', 800, 200);
  g.clear();

  g.fillStyle(0x2d6a4f, 1);
  for (let i = 0; i < 800; i += 40) {
    g.fillTriangle(i, 120, i + 20, 60, i + 40, 120);
  }
  g.generateTexture('bg-hills', 800, 120);
  g.clear();

  g.fillStyle(0x1a4a3a, 0.7);
  for (let i = 0; i < 800; i += 60) {
    g.fillTriangle(i, 150, i + 30, 40, i + 60, 150);
  }
  g.fillStyle(0x0d3328, 0.5);
  for (let i = 30; i < 800; i += 80) {
    g.fillTriangle(i, 160, i + 40, 20, i + 80, 160);
  }
  g.generateTexture('bg-mountains', 800, 160);
  g.clear();

  // Moving platform (wider, glowing)
  g.fillStyle(0x00f5ff, 0.3);
  g.fillRect(0, 0, 96, 12);
  g.fillStyle(0x4488aa, 1);
  g.fillRect(0, 2, 96, 8);
  g.fillStyle(0x66ccff, 1);
  g.fillRect(2, 3, 92, 3);
  g.generateTexture('tile-moving', 96, 12);
  g.clear();

  // Empty block (used question block)
  drawRect(g, 32, 32, 0x888888, 0x555555);
  g.generateTexture('tile-used', 32, 32);
  g.clear();

  g.destroy();
}
