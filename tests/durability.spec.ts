import { expect, test } from '@playwright/test';

test('a confirmed set survives 100 offline reloads', async ({ page, context }) => {
  test.setTimeout(180_000);
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });

  await page.goto('/');
  await page.getByRole('button', { name: 'Make your first routine' }).click();
  await page.getByLabel('Routine name').fill('Reload proof');
  await page.getByLabel('Exercise name').fill('Back squat');
  await page.getByRole('button', { name: 'Save routine' }).click();
  await expect(page.getByText('Reload proof saved on this device.')).toBeVisible();
  await page.getByRole('button', { name: /Reload proof/ }).click();
  await page.getByLabel('Back squat weight in kilograms').fill('82.5');
  await page.getByLabel('Back squat repetitions').fill('5');
  await page.getByRole('button', { name: /Complete set 1/ }).click();
  await expect(page.getByText('Back squat set 1 saved on this device.')).toBeVisible();

  await page.evaluate(async () => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.reload();
  await expect(page.getByText(/Last saved: 82.5 kg × 5/)).toBeVisible();
  await context.setOffline(true);
  for (let attempt = 0; attempt < 100; attempt += 1) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Last saved: 82.5 kg × 5/)).toBeVisible();
  }
  await context.setOffline(false);
  expect(consoleErrors).toEqual([]);
});

test('correction appends history and CSV remains free', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Make your first routine' }).click();
  await page.getByLabel('Routine name').fill('Correction proof');
  await page.getByLabel('Exercise name').fill('Deadlift');
  await page.getByRole('button', { name: 'Save routine' }).click();
  await page.getByRole('button', { name: /Correction proof/ }).click();
  await page.getByRole('button', { name: /Complete set 1/ }).click();
  await expect(page.getByText('Deadlift set 1 saved on this device.')).toBeVisible();
  await page.getByRole('button', { name: 'Ledger' }).click();
  const correct = page.getByRole('button', { name: 'Correct' }).first();
  await correct.click();
  await page.getByLabel('Weight kg').fill('85');
  await page.getByRole('button', { name: 'Save correction' }).click();
  await expect(page.getByText('Correction appended. The original remains visible.')).toBeVisible();
  await expect(page.getByText('Correction', { exact: true })).toBeVisible();
  await expect(page.getByText('Corrected', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeVisible();
});
