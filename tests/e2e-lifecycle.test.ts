import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import config from '../playwright.config';

describe('constrained-worker browser lifecycle', () => {
  it('pins Chromium tooling and runs the full gate in CI with one worker', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>;
      devDependencies: Record<string, string>;
    };

    expect(packageJson.devDependencies['@playwright/test']).toBe('1.58.2');
    expect(packageJson.devDependencies['playwright-core']).toBe('1.58.2');
    expect(packageJson.scripts['test:e2e']).toBe('CI=1 playwright test --workers=1');
    expect(config.workers).toBe(1);
    expect(config.fullyParallel).toBe(false);
  });

  it('starts a fresh strict-port preview and gives Playwright an explicit shutdown policy', () => {
    expect(config.webServer).toMatchObject({
      command: 'npm run preview -- --strictPort',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: false,
      gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
    });
  });

  it('uses bundled Chromium new headless mode instead of the crashing headless shell', () => {
    expect(config.projects).toHaveLength(2);
    for (const project of config.projects ?? []) {
      expect(project.use?.browserName).toBe('chromium');
      expect(project.use?.channel).toBe('chromium');
    }
  });

  it('requires offline and update checks to use the explicit fresh-context guard', () => {
    const helper = readFileSync('tests/helpers/fresh-context.ts', 'utf8');
    expect(helper).toContain('await context.setOffline(false)');
    expect(helper).toContain("throw new Error('Fresh browser context was not released after the test.')");

    for (const file of ['tests/claims.spec.ts', 'tests/durability.spec.ts', 'tests/pwa-update.spec.ts']) {
      const source = readFileSync(file, 'utf8');
      expect(source, file).toContain('withFreshContext(browser, testInfo');
    }
  });
});
