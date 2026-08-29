import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('reviewed public copy', () => {
  const readme = readFileSync('README.md', 'utf8').replace(/\s+/g, ' ');

  it('uses the required plain README wording and removes reported jargon', () => {
    for (const sentence of [
      'Log strength sets on your phone, even without signal.',
      'Confirmed sets remain after reloads.',
      'Create repeatable routines, save sets with one tap, correct entries without deleting them, and import or export backups.',
      'Your workout records are saved in this browser.',
      'The app confirms a set only after it saves it.',
      'Correcting a set keeps the earlier value visible.',
      'Starting or finishing a workout saves its status and history together.',
      'Importing a file keeps your existing records when entries conflict.',
      'After your first visit, the app can open without a signal.',
      'Browser storage can still be cleared, so export a backup you need to keep.',
      'Sociobot handles checkout and license checks.',
      'The deployment configuration sets security headers, caching, and the 404 page.',
      '`npm test` checks data handling and hosting rules.',
      '`npm run test:claims` checks each published promise with the sample workout.',
      'The app loads no ads, tracking tools, third-party fonts, or cloud workout storage while you log.',
      'Durable Set Log records training. It does not provide medical guidance.',
    ]) expect(readme).toContain(sentence);

    for (const removed of [
      'offline-first workout ledger', 'append-only correction history', 'Workout data is written to IndexedDB',
      'immutable event', 'committed atomically', 'crypto.randomUUID()', 'service worker precaches',
      'api.sociobot.in/api/v1', 'correction folding', 'analytics SDK',
    ]) expect(readme).not.toContain(removed);
  });

  it('gives every declared claim one tagged browser test', () => {
    const claims = JSON.parse(readFileSync('.factory/claims.json', 'utf8')) as Array<{ id: string }>;
    const tests = readFileSync('tests/claims.spec.ts', 'utf8');
    expect(new Set(claims.map(({ id }) => id)).size).toBe(claims.length);
    for (const { id } of claims) {
      const occurrences = tests.match(new RegExp(`@claim:${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g')) ?? [];
      expect(occurrences, id).toHaveLength(1);
    }
  });

  it('keeps the catalog description verb-first and within 120 characters', () => {
    const description = readFileSync('.factory/catalog-description.txt', 'utf8').trim();
    expect(description.length).toBeLessThanOrEqual(120);
    expect(description).toMatch(/^Log\b/);
  });
});
