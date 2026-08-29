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

test('legal, offline, and 404 pages use the shared site skeleton', async ({ page }) => {
  for (const route of ['/privacy/', '/terms/', '/offline.html', '/404.html']) {
    await page.goto(route);
    await expect(page.getByRole('link', { name: 'Durable Set Log home' })).toBeVisible();
    const navigation = page.getByRole('navigation', { name: 'Primary navigation' });
    await expect(navigation.getByRole('link', { name: 'Demo' })).toHaveAttribute('href', '/demo');
    await expect(navigation.getByRole('link', { name: 'Routines' })).toHaveAttribute('href', '/routines');
    await expect(navigation.getByRole('link', { name: 'Ledger' })).toHaveAttribute('href', '/ledger');
    await expect(navigation.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy/');
    await expect(page.locator('footer').getByRole('link', { name: 'Privacy' })).toBeVisible();
    await expect(page.locator('footer').getByRole('link', { name: 'Terms' })).toBeVisible();
    await expect(page.locator('footer')).toContainText('Built by Param Factory · v1.0.4');
  }
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Durable Set Log');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
});

test('legal skip links move keyboard focus to main content', async ({ page }) => {
  await page.goto('/privacy/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to privacy details' });
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('nested demo documents resolve PWA head assets at the site root and load without errors', async ({ page, request }) => {
  const consoleErrors: string[] = [];
  const failedResources: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400) failedResources.push(`${response.status()} ${response.url()}`);
  });

  for (const route of ['/demo/workout', '/demo/routines', '/demo/more']) {
    await page.goto(route, { waitUntil: 'networkidle' });
    const assets = await page.evaluate(() => ({
      icon: document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.href,
      apple: document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]')?.href,
      manifest: document.querySelector<HTMLLinkElement>('link[rel="manifest"]')?.href,
      preload: document.querySelector<HTMLLinkElement>('link[rel="preload"][as="image"]')?.href,
    }));
    for (const asset of Object.values(assets)) {
      expect(asset, `${route} should have every PWA head asset`).toBeTruthy();
      expect(new URL(asset!).pathname, `${route} head asset should be root absolute`).toMatch(/^\/(?:icons\/|manifest\.webmanifest$|art\/)/);
      expect((await request.get(new URL(asset!).pathname)).status(), asset).toBe(200);
    }
  }
  expect(failedResources).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('landing page includes the required use, privacy, and paid-tier sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'How it works' })).toBeVisible();
  await expect(page.getByText('The app confirms only after it saves the set.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Privacy and limits' })).toBeVisible();
  await expect(page.getByText('Workout records stay in this browser unless you export them. There is no account or cloud sync.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'One-time unlock' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'See the US$14 license' })).toBeVisible();
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

test('mobile in-content and legal contact links are at least 44 CSS pixels', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Mobile target sizing regression');
  const targetSize = async (locator: import('@playwright/test').Locator) => {
    const box = await locator.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  };

  await page.goto('/more');
  await targetSize(page.locator('main').getByRole('link', { name: 'Privacy' }));
  await targetSize(page.locator('main').getByRole('link', { name: 'Terms' }));
  await page.goto('/privacy/');
  await targetSize(page.getByRole('link', { name: 'privacy@sociobot.in' }));
  await page.goto('/terms/');
  await targetSize(page.getByRole('link', { name: 'support@sociobot.in' }));
});
