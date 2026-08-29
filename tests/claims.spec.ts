import { expect, test } from '@playwright/test';

test('@claim:offline-reload Works offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Set ledger' })).toBeVisible();
  await expect(page.getByText('Back squat', { exact: true }).first()).toBeVisible();
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByText('Back squat', { exact: true }).first()).toBeVisible();
});

test('@claim:confirmed-device-write A confirmed set survives a reload', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Workout' }).click();
  await page.getByRole('button', { name: /Tuesday strength/ }).click();
  await page.getByLabel('Back squat weight in kilograms').fill('85');
  await page.getByLabel('Back squat repetitions').fill('5');
  await page.locator('[data-exercise="demo-back-squat"] [data-action="complete"]').click();
  await expect(page.getByText('Back squat set 1 saved on this device.')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Set 1 · 85 kg × 5', { exact: true })).toBeVisible();
});

test('@claim:csv-export Exports the sample ledger as CSV', async ({ page }) => {
  await page.goto('/demo');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const csv = await (await download).createReadStream();
  let text = '';
  for await (const chunk of csv!) text += chunk.toString();
  expect(text).toContain('event_id');
  expect(text).toContain('Back squat');
});

test('@claim:local-privacy The demo workout flow makes no third-party requests', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Workout' }).click();
  await page.getByRole('button', { name: /Tuesday strength/ }).click();
  await page.locator('[data-exercise="demo-back-squat"] [data-action="complete"]').click();
  await expect(page.getByText(/Back squat set 1 saved on this device/)).toBeVisible();
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('@claim:demo-isolated Demo changes never appear in the real ledger', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.getByRole('button', { name: 'Routines' }).click();
  await page.getByRole('button', { name: 'New routine' }).click();
  await page.getByLabel('Routine name').fill('Demo-only routine');
  await page.getByLabel('Exercise name').fill('Demo lift');
  await page.getByRole('button', { name: 'Save routine' }).click();
  await expect(page.getByText('Demo-only routine saved on this device.')).toBeVisible();
  await page.goto('/');
  await expect(page.getByText('Demo-only routine', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
});
