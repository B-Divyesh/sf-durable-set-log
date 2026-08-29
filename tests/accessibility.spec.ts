import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('empty state has no accessibility violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Log every strength set, even offline.' })).toBeVisible();
  await expect(page.getByText('For strength trainees who need each completed set to survive a reload or lost signal.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('routine dialog is keyboard operable', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to workout log' })).toBeFocused();
  await page.getByRole('button', { name: 'Make your first routine' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByLabel('Routine name')).toBeFocused();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('dialog traps focus, closes with Escape, and restores its trigger', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Make your first routine' });
  await trigger.focus();
  await trigger.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  for (let press = 0; press < 8; press += 1) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement?.closest('dialog')?.id)).toBe('routine-dialog');
  }
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('app, demo, and supporting pages have no accessibility violations', async ({ page }) => {
  for (const route of ['/routines', '/ledger', '/more', '/demo', '/demo/routines', '/demo/more', '/privacy/', '/terms/', '/offline.html', '/404.html']) {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, route).toEqual([]);
  }
});
