import Phaser from 'phaser';

export function screenShake(scene: Phaser.Scene, intensity = 4, duration = 100): void {
  scene.cameras.main.shake(duration, intensity / 1000);
}

export function freezeFrame(scene: Phaser.Scene, ms = 50): void {
  scene.physics.world.pause();
  scene.tweens.pauseAll();
  scene.time.delayedCall(ms, () => {
    if (scene.scene.isActive()) {
      scene.physics.world.resume();
      scene.tweens.resumeAll();
    }
  });
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

export function spawnDeathBurst(scene: Phaser.Scene, x: number, y: number, tint = 0xff4444): void {
  const particles = scene.add.particles(x, y, 'particle', {
    speed: { min: 80, max: 220 },
    angle: { min: 0, max: 360 },
    lifespan: 600,
    scale: { start: 1, end: 0 },
    gravityY: 300,
    quantity: 14,
    tint: [tint, 0xffffff, 0xffaa00],
  });
  screenShake(scene, 5, 120);
  scene.time.delayedCall(700, () => particles.destroy());
}

export function spawnPowerUpBurst(scene: Phaser.Scene, x: number, y: number, tint = 0xffd700): void {
  const ring = scene.add.circle(x, y, 8, tint, 0.6);
  ring.setDepth(50);
  scene.tweens.add({
    targets: ring,
    scaleX: 3,
    scaleY: 3,
    alpha: 0,
    duration: 350,
    onComplete: () => ring.destroy(),
  });
  spawnSparkle(scene, x, y);
}

export function spawnFireImpact(scene: Phaser.Scene, x: number, y: number): void {
  const particles = scene.add.particles(x, y, 'particle', {
    speed: { min: 60, max: 160 },
    angle: { min: 0, max: 360 },
    lifespan: 280,
    scale: { start: 0.9, end: 0 },
    quantity: 8,
    tint: [0xff6600, 0xffcc00, 0xff4400],
  });
  screenShake(scene, 2, 60);
  scene.time.delayedCall(350, () => particles.destroy());
}

export function spawnSpringBurst(scene: Phaser.Scene, x: number, y: number): void {
  const particles = scene.add.particles(x, y, 'particle', {
    speed: { min: 40, max: 100 },
    angle: { min: 220, max: 320 },
    lifespan: 350,
    scale: { start: 0.7, end: 0 },
    quantity: 8,
    tint: [0x44ff44, 0x88ff88, 0xffffff],
  });
  scene.time.delayedCall(400, () => particles.destroy());
}

export function spawnPipeWarp(scene: Phaser.Scene, x: number, y: number): void {
  for (let i = 0; i < 6; i++) {
    const swirl = scene.add.image(x, y, 'particle');
    swirl.setTint(0x66ccff);
    swirl.setScale(2);
    swirl.setDepth(15);
    const angle = (i / 6) * Math.PI * 2;
    scene.tweens.add({
      targets: swirl,
      x: x + Math.cos(angle) * 24,
      y: y + Math.sin(angle) * 24,
      alpha: 0,
      scale: 0.2,
      duration: 400,
      delay: i * 30,
      onComplete: () => swirl.destroy(),
    });
  }
}

export function spawnStarTrail(scene: Phaser.Scene, x: number, y: number): void {
  const colors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff, 0xff00ff];
  const spark = scene.add.image(x, y, 'particle');
  spark.setTint(colors[Phaser.Math.Between(0, colors.length - 1)]);
  spark.setAlpha(0.8);
  spark.setDepth(8);
  scene.tweens.add({
    targets: spark,
    alpha: 0,
    scale: 0.3,
    duration: 200,
    onComplete: () => spark.destroy(),
  });
}

export function spawnComboText(scene: Phaser.Scene, x: number, y: number, combo: number, mult: number): void {
  const text = scene.add.text(x, y - 20, `${combo}× COMBO! ×${mult}`, {
    fontSize: '14px',
    color: '#ffd700',
    stroke: '#000000',
    strokeThickness: 3,
    fontFamily: 'monospace',
  });
  text.setOrigin(0.5);
  text.setDepth(100);
  text.setScale(0.5);
  scene.tweens.add({
    targets: text,
    scale: 1.2,
    y: y - 50,
    duration: 200,
    ease: 'Back.easeOut',
    onComplete: () => {
      scene.tweens.add({
        targets: text,
        alpha: 0,
        y: y - 70,
        duration: 400,
        onComplete: () => text.destroy(),
      });
    },
  });
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
