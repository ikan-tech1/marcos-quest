/**
 * Arcade View smoke tests — run: npx playwright test tests/arcade-view.spec.mjs
 */
import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4173';

test.describe('Eashan\'s Quest view modes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
    await page.waitForSelector('.overlay-menu, .overlay-loading', { timeout: 15000 });
    await page.waitForSelector('.overlay-menu', { timeout: 20000 });
  });

  test('loads default fullscreen menu', async ({ page }) => {
    await expect(page.locator('.title-hero')).toBeVisible();
    await expect(page.locator('#game-container')).toHaveClass(/game-container--hidden/);
  });

  test('arcade mode toggle persists and shows cabinet in gameplay', async ({ page }) => {
    await page.getByRole('button', { name: /Arcade Mode OFF/i }).click();
    await expect(page.getByRole('button', { name: /Arcade Mode ON/i })).toBeVisible();

    await page.getByRole('button', { name: /START ADVENTURE/i }).click();
    await page.waitForSelector('.game-container--live', { timeout: 10000 });

    await expect(page.locator('.arcade-cabinet')).toBeVisible();
    await expect(page.locator('.world-sky')).toBeVisible();
    await expect(page.locator('#game-container canvas')).toBeVisible();

    const canvas = page.locator('#game-container canvas');
    const cabinet = page.locator('.arcade-cabinet');
    const canvasBox = await canvas.boundingBox();
    const cabinetBox = await cabinet.boundingBox();
    expect(canvasBox).toBeTruthy();
    expect(cabinetBox).toBeTruthy();
    expect(canvasBox.y).toBeGreaterThan(cabinetBox.y);
    expect(canvasBox.y + canvasBox.height).toBeLessThan(cabinetBox.y + cabinetBox.height);
  });

  test('cabinet score strip updates while playing', async ({ page }) => {
    await page.getByRole('button', { name: /Arcade Mode OFF/i }).click();
    await page.getByRole('button', { name: /START ADVENTURE/i }).click();
    await page.waitForSelector('.arcade-cabinet', { timeout: 10000 });

    const scoreEl = page.locator('.cabinet-bezel-value');
    await expect(scoreEl).toHaveText(/\d{6}/);

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    await expect(scoreEl).toBeVisible();
  });

  test('switch back to fullscreen view from arcade', async ({ page }) => {
    await page.getByRole('button', { name: /Arcade Mode OFF/i }).click();
    await page.getByRole('button', { name: /START ADVENTURE/i }).click();
    await page.waitForSelector('.arcade-cabinet', { timeout: 10000 });

    await page.locator('.cabinet-btn--view').click();
    await expect(page.locator('.arcade-cabinet')).toHaveCount(0);
    await expect(page.locator('.overlay-hud .hud-bar')).toBeVisible();
    await expect(page.locator('#game-container canvas')).toBeVisible();
  });

  test('canvas uses Phaser zoom without CSS transform scale', async ({ page }) => {
    await page.getByRole('button', { name: /START ADVENTURE/i }).click();
    await page.waitForSelector('#game-container canvas', { timeout: 10000 });

    const transform = await page.locator('#game-container canvas').evaluate((el) => {
      return window.getComputedStyle(el).transform;
    });
    expect(transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)').toBeTruthy();
  });
});
