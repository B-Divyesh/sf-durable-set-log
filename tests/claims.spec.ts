import { expect, test, type Download } from '@playwright/test';
import { readFileSync } from 'node:fs';

async function downloadText(download: Download): Promise<string> {
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

async function addRoutine(page: import('@playwright/test').Page, name: string): Promise<void> {
  await page.getByRole('button', { name: 'New routine' }).click();
  await page.getByLabel('Routine name').fill(name);
  await page.getByLabel('Exercise name').fill('Fixture lift');
  await page.getByRole('button', { name: 'Save routine' }).click();
  await expect(page.getByText(`${name} saved on this device.`)).toBeVisible();
}

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
  await page.getByRole('link', { name: 'Workout', exact: true }).click();
  await page.getByRole('button', { name: /Tuesday strength/ }).click();
  await page.getByLabel('Back squat weight in kilograms').fill('85');
  await page.getByLabel('Back squat repetitions').fill('5');
  await page.locator('[data-exercise="demo-back-squat"] [data-action="complete"]').click();
  await expect(page.getByText('Back squat set 1 saved on this device.')).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Last saved: 85 kg × 5/)).toBeVisible();
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
  await page.getByRole('link', { name: 'Workout', exact: true }).click();
  await page.getByRole('button', { name: /Tuesday strength/ }).click();
  await page.locator('[data-exercise="demo-back-squat"] [data-action="complete"]').click();
  await expect(page.getByText(/Back squat set 1 saved on this device/)).toBeVisible();
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('@claim:no-account-or-sync The app has no account or cloud sync', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  for (const route of ['/demo', '/demo/workout', '/demo/routines', '/demo/more']) {
    await page.goto(route);
    await expect(page.getByRole('link', { name: /sign in|log in|account|sync/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /sign in|log in|account|sync/i })).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: /email|account|sync/i })).toHaveCount(0);
  }
  await expect(page.getByText('There is no account or cloud sync.', { exact: false })).toBeVisible();
  expect(requests.every((value) => {
    const url = new URL(value);
    return url.origin === 'http://127.0.0.1:4173' && !/(?:account|auth|login|signin|sync)/i.test(url.pathname);
  })).toBe(true);
});

test('@claim:not-medical-guidance The medical-guidance disclaimer stays visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('This app records training. It does not provide medical guidance.')).toBeVisible();
  await page.goto('/terms/');
  await expect(page.getByText('It does not prescribe training and is not medical guidance.', { exact: false })).toBeVisible();
  expect(readFileSync('README.md', 'utf8').replace(/\s+/g, ' ')).toContain('Durable Set Log records training. It does not provide medical guidance.');
});

test('@claim:demo-isolated Demo changes never appear in the real ledger', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.getByRole('link', { name: 'Routines' }).click();
  await page.getByRole('button', { name: 'New routine' }).click();
  await page.getByLabel('Routine name').fill('Demo-only routine');
  await page.getByLabel('Exercise name').fill('Demo lift');
  await page.getByRole('button', { name: 'Save routine' }).click();
  await expect(page.getByText('Demo-only routine saved on this device.')).toBeVisible();
  await page.goto('/');
  await expect(page.getByText('Demo-only routine', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
});

test('@claim:append-only-corrections Corrections append a row and retain the earlier value', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('.ledger-row')).toHaveCount(3);
  const rowsBefore = await page.locator('.ledger-row').count();
  await page.getByRole('button', { name: 'Correct' }).first().click();
  const original = await page.getByRole('dialog').getByText(/entry remains in history/).textContent();
  await page.getByLabel('Weight kg').fill('57.5');
  await page.getByRole('button', { name: 'Save correction' }).click();
  await expect(page.getByText('Correction appended. The original remains visible.')).toBeVisible();
  await expect(page.locator('.ledger-row')).toHaveCount(rowsBefore + 1);
  await expect(page.getByText('Correction', { exact: true })).toBeVisible();
  await expect(page.getByText('Corrected', { exact: true })).toBeVisible();
  expect(original).toContain('55 kg × 8');
  await expect(page.getByText('Set 1 · 57.5 kg × 8', { exact: true })).toBeVisible();
  await expect(page.getByText('Set 1 · 55 kg × 8', { exact: true })).toBeVisible();
});

test('@claim:json-backup-restore JSON backup restores routines without overwriting local edits', async ({ page }) => {
  await page.goto('/demo/more');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Back up JSON' }).click();
  const text = await downloadText(await downloadPromise);
  const backup = JSON.parse(text) as { routines: Array<{ name: string }>; events: unknown[] };
  expect(backup.routines.map(({ name }) => name)).toContain('Tuesday strength');
  expect(backup.events.length).toBeGreaterThan(0);

  page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('link', { name: 'Routines' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('link', { name: 'Data & backup' }).click();
  await page.locator('#json-import').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(text) });
  await expect(page.getByText(/Restore complete: 1 routine and 0 events added/)).toBeVisible();

  await page.getByRole('link', { name: 'Routines' }).click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Routine name').fill('Local newer edit');
  await page.getByRole('button', { name: 'Save routine' }).click();
  await page.getByRole('link', { name: 'Data & backup' }).click();
  await page.locator('#json-import').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(text) });
  await expect(page.getByText(/0 routines and 0 events added; 1 existing routine kept/)).toBeVisible();
  await page.getByRole('link', { name: 'Routines' }).click();
  await expect(page.getByRole('heading', { name: 'Local newer edit' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tuesday strength' })).toHaveCount(0);
});

test('@claim:csv-collision-safe CSV import keeps both records when an event ID collides', async ({ page }) => {
  await page.goto('/demo/more');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const original = await downloadText(await downloadPromise);
  const lines = original.trimEnd().split('\n');
  const changed = lines.map((line) => {
    if (!line.startsWith('demo-set-bench-1,')) return line;
    const fields = line.split(',');
    fields[9] = '57.5';
    return fields.join(',');
  }).join('\n') + '\n';
  await page.locator('#csv-import').setInputFiles({ name: 'collision.csv', mimeType: 'text/csv', buffer: Buffer.from(changed) });
  await expect(page.getByText(/1 added, 2 already present, 1 ID collision safely renamed/)).toBeVisible();
  await page.getByRole('link', { name: 'Ledger' }).click();
  await expect(page.getByText('Set 1 · 55 kg × 8', { exact: true })).toBeVisible();
  await expect(page.getByText('Set 1 · 57.5 kg × 8', { exact: true })).toBeVisible();
});

test('@claim:atomic-workout-write Active workout state and boundary events commit together', async ({ page }) => {
  await page.goto('/demo/workout');
  await page.getByRole('button', { name: /Tuesday strength/ }).click();
  const started = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('durable-set-log:demo');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const transaction = db.transaction(['meta', 'events']);
    const metaRequest = transaction.objectStore('meta').get('activeWorkout');
    const eventsRequest = transaction.objectStore('events').getAll();
    const [meta, events] = await Promise.all([
      new Promise<any>((resolve) => { metaRequest.onsuccess = () => resolve(metaRequest.result); }),
      new Promise<any[]>((resolve) => { eventsRequest.onsuccess = () => resolve(eventsRequest.result); }),
    ]);
    db.close();
    return { active: meta?.value, starts: events.filter((event) => event.type === 'workout.started' && event.sessionId === meta?.value?.sessionId).length };
  });
  expect(started.active?.routineName).toBe('Tuesday strength');
  expect(started.starts).toBe(1);

  page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Finish workout' }).click();
  const finished = await page.evaluate(async (sessionId) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('durable-set-log:demo');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const transaction = db.transaction(['meta', 'events']);
    const metaRequest = transaction.objectStore('meta').get('activeWorkout');
    const eventsRequest = transaction.objectStore('events').getAll();
    const [meta, events] = await Promise.all([
      new Promise<any>((resolve) => { metaRequest.onsuccess = () => resolve(metaRequest.result); }),
      new Promise<any[]>((resolve) => { eventsRequest.onsuccess = () => resolve(eventsRequest.result); }),
    ]);
    db.close();
    return { active: meta?.value, finishes: events.filter((event) => event.type === 'workout.finished' && event.sessionId === sessionId).length };
  }, started.active.sessionId);
  expect(finished.active).toBeUndefined();
  expect(finished.finishes).toBe(1);
});

test('@claim:free-routine-limit Free keeps two routines while ledger and CSV export remain available', async ({ page }) => {
  await page.goto('/demo/routines');
  await addRoutine(page, 'Free fixture routine');
  await expect(page.getByText('Free keeps two routines. The one-time unlock removes this limit; your ledger and exports always stay free.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'New routine' })).toBeDisabled();
  await page.getByRole('link', { name: 'Ledger' }).click();
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeEnabled();
});

test('@claim:paid-summary-unlock A valid license unlocks unlimited routines and the on-device training summary', async ({ page }) => {
  const verifyUrl = 'https://api.sociobot.in/api/v1/products/durable-set-log/verify?license=paid-fixture';
  await page.route(verifyUrl, (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) }));
  const verification = page.waitForResponse(verifyUrl);
  await page.goto('/demo/more?license=paid-fixture');
  await verification;
  await expect(page.getByText('Unlimited routines and training summary unlocked on this device.')).toBeVisible();
  await expect(page.getByText('Workouts logged', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Routines' }).click();
  await addRoutine(page, 'Unlocked fixture routine one');
  await addRoutine(page, 'Unlocked fixture routine two');
  await expect(page.getByRole('heading', { name: 'Unlocked fixture routine two' })).toBeVisible();
  await expect(page.getByText('Free keeps two routines. The one-time unlock removes this limit; your ledger and exports always stay free.')).toHaveCount(0);
});

test('@claim:purchase-price-checkout The US$14 one-time purchase action opens the Sociobot checkout endpoint', async ({ page }) => {
  const checkoutUrl = 'https://api.sociobot.in/api/v1/products/durable-set-log/checkout';
  await page.goto('/demo/more');
  await expect(page.getByText('Pay US$14 once', { exact: false })).toBeVisible();
  const buy = page.getByRole('link', { name: 'Buy once · $14' });
  await expect(buy).toHaveAttribute('href', checkoutUrl);
  let openedCheckout = false;
  await page.route(checkoutUrl, async (route) => {
    openedCheckout = true;
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<title>Hosted checkout</title>' });
  });
  await buy.click({ noWaitAfter: true });
  await expect.poll(() => openedCheckout).toBe(true);
});

test('@claim:sociobot-payment-handling Sociobot handles checkout and license checks', async ({ page }) => {
  const checkoutUrl = 'https://api.sociobot.in/api/v1/products/durable-set-log/checkout';
  const verifyUrl = 'https://api.sociobot.in/api/v1/products/durable-set-log/verify?license=payment-handler-fixture';
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.route(verifyUrl, (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) }));
  await page.goto('/demo/more');
  await expect(page.getByRole('link', { name: 'Buy once · $14' })).toHaveAttribute('href', checkoutUrl);
  const verification = page.waitForResponse(verifyUrl);
  await page.goto('/demo/more?license=payment-handler-fixture');
  await verification;
  await expect(page.getByText('Unlimited routines and training summary unlocked on this device.')).toBeVisible();
  expect(requests).toContain(verifyUrl);
});

test('@claim:no-embedded-payment-provider The product hands payment to Sociobot instead of embedding it', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo/more');
  const paymentSection = page.getByRole('heading', { name: 'Unlimited routines' }).locator('..').locator('..');
  await expect(paymentSection.locator('iframe')).toHaveCount(0);
  await expect(paymentSection.locator('input[autocomplete*="cc-"], input[name*="card" i], input[name*="payment" i]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Buy once · $14' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/durable-set-log/checkout');
  expect(requests.every((value) => new URL(value).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('@claim:license-revocation Invalid and revoked license responses remove paid access', async ({ page }) => {
  const reasons = ['refunded', 'revoked', 'expired', 'invalid', 'wrong_product'];
  await page.route('https://api.sociobot.in/api/v1/products/durable-set-log/verify?license=*', async (route) => {
    const token = new URL(route.request().url()).searchParams.get('license') ?? '';
    const reason = token.replace('-fixture', '');
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: false, reason }) });
  });
  for (const reason of reasons) {
    const verifyUrl = `https://api.sociobot.in/api/v1/products/durable-set-log/verify?license=${reason}-fixture`;
    const verification = page.waitForResponse(verifyUrl);
    await page.goto(`/demo/more?license=${reason}-fixture`);
    await verification;
    await expect(page.getByText(`License no longer active (${reason}).`)).toBeVisible();
    await expect(page.getByText('Unlimited routines and training summary unlocked on this device.')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Buy once · $14' })).toBeVisible();
  }
});
