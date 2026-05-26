import Phaser from 'phaser';

export function screenShake(scene: Phaser.Scene, intensity = 4, duration = 100): void {
  scene.cameras.main.shake(duration, intensity / 1000);
}

export function spawnDust(scene: Phaser.Scene, x: number, y: number): void {
  const particles = scene.add.particles(x, y, 'particle', {
    speed: { min: 20, max: 80 },
    angle: { min: 200, max: 340 },
    lifespan: 300,
    scale: { start: 0.6, end: 0 },
    quantity: 6,
    tint: 0xc4a882,
  });
  scene.time.delayedCall(400, () => particles.destroy());
}

export function spawnSparkle(scene: Phaser.Scene, x: number, y: number): void {
  const particles = scene.add.particles(x, y, 'particle', {
    speed: { min: 40, max: 120 },
    lifespan: 400,
    scale: { start: 0.8, end: 0 },
    quantity: 10,
    tint: [0xffd700, 0xffaa00, 0xffffff],
  });
  scene.time.delayedCall(500, () => particles.destroy());
}

export function spawnDebris(scene: Phaser.Scene, x: number, y: number, tint = 0xc45c26): void {
  const particles = scene.add.particles(x, y, 'particle', {
    speed: { min: 60, max: 180 },
    angle: { min: 180, max: 360 },
    lifespan: 500,
    scale: { start: 0.8, end: 0.2 },
    gravityY: 400,
    quantity: 8,
    tint,
  });
  scene.time.delayedCall(600, () => particles.destroy());
}

export function squashStretch(
  target: Phaser.GameObjects.Sprite | Phaser.Physics.Arcade.Sprite,
  sx: number,
  sy: number,
  duration = 100,
): void {
  target.scene.tweens.add({
    targets: target,
    scaleX: sx,
    scaleY: sy,
    duration: duration / 2,
    yoyo: true,
    ease: 'Sine.easeOut',
  });
}
