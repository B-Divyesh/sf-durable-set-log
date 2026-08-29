import { expect, test } from '@playwright/test';

test('active workout rejects values outside the displayed constraints', async ({ page }) => {
  await page.goto('/demo/workout');
  await page.getByRole('button', { name: /Tuesday strength/ }).click();
  const weight = page.getByLabel('Back squat weight in kilograms');
  const reps = page.getByLabel('Back squat repetitions');
  await weight.fill('2000.5');
  await reps.fill('1001');
  await page.locator('[data-exercise="demo-back-squat"] [data-action="complete"]').click();
  await expect(weight).toBeFocused();
  expect(await weight.evaluate((input: HTMLInputElement) => input.checkValidity())).toBe(false);
  await expect(page.locator('[data-exercise="demo-back-squat"] .last-set')).toHaveText('No set written yet.');

  await weight.fill('2000');
  await page.locator('[data-exercise="demo-back-squat"] [data-action="complete"]').click();
  await expect(reps).toBeFocused();
  expect(await reps.evaluate((input: HTMLInputElement) => input.checkValidity())).toBe(false);
  await expect(page.locator('[data-exercise="demo-back-squat"] .last-set')).toHaveText('No set written yet.');
});

test('app views have deep links and browser history', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Routines' }).click();
  await expect(page).toHaveURL('/routines');
  await expect(page.getByRole('heading', { name: 'Routines', exact: true })).toBeFocused();
  await page.getByRole('link', { name: 'Ledger' }).click();
  await expect(page).toHaveURL('/ledger');
  await page.goBack();
  await expect(page).toHaveURL('/routines');
  await expect(page.getByRole('heading', { name: 'Routines', exact: true })).toBeFocused();

  await page.goto('/more');
  await expect(page.getByRole('heading', { name: 'More' })).toBeVisible();
  await expect(page).toHaveTitle('More — Durable Set Log');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://durable-set-log.sociobot.in/more');

  await page.goto('/demo/routines');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Routines', exact: true })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://durable-set-log.sociobot.in/demo/routines');
});

test('share and legal route metadata is complete', async ({ page, request }) => {
  await page.goto('/demo');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /durable-set-log-share\.[a-f0-9]{8}\.jpg$/);
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /durable-set-log-share\.[a-f0-9]{8}\.jpg$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://durable-set-log.sociobot.in/demo');

  for (const route of ['privacy', 'terms']) {
    await page.goto(`/${route}/`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://durable-set-log.sociobot.in/${route}/`);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveCount(1);
  }
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('https://durable-set-log.sociobot.in/demo');
  expect(sitemap).toContain('https://durable-set-log.sociobot.in/routines');
});

test('mobile header and footer targets are at least 44 CSS pixels', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Mobile target sizing regression');
  await page.goto('/');
  for (const locator of [
    page.getByRole('link', { name: 'Durable Set Log, workout' }),
    page.locator('footer').getByRole('link', { name: 'Privacy' }),
    page.locator('footer').getByRole('link', { name: 'Terms' }),
  ]) {
    const box = await locator.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});
