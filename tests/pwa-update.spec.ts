import { expect, test } from '@playwright/test';

test('service-worker activation removes an old shell and retains IndexedDB data', async ({ page }) => {
  await page.goto('/demo/routines');
  await page.getByRole('button', { name: 'New routine' }).click();
  await page.getByLabel('Routine name').fill('Update survivor');
  await page.getByLabel('Exercise name').fill('Front squat');
  await page.getByRole('button', { name: 'Save routine' }).click();
  await expect(page.getByText('Update survivor saved on this device.')).toBeVisible();
  await page.evaluate(async () => navigator.serviceWorker.ready);

  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration?.unregister();
    const oldCache = await caches.open('durable-set-log-shell-v5');
    await oldCache.put('/old-shell-marker', new Response('old'));
  });
  await page.reload();
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(async () => (await caches.keys()).includes('durable-set-log-shell-v5'))).toBe(false);
  expect(await page.evaluate(async () => (await caches.keys()).includes('durable-set-log-shell-v6'))).toBe(true);
  await expect(page.getByRole('heading', { name: 'Update survivor' })).toBeVisible();
});
