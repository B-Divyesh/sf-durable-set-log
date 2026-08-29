import type {
  Browser,
  BrowserContext,
  BrowserContextOptions,
  Page,
  TestInfo,
} from '@playwright/test';

type FreshContext = {
  context: BrowserContext;
  page: Page;
};

function contextOptions(testInfo: TestInfo): BrowserContextOptions {
  const use = testInfo.project.use;
  return {
    baseURL: use.baseURL,
    colorScheme: use.colorScheme,
    deviceScaleFactor: use.deviceScaleFactor,
    hasTouch: use.hasTouch,
    isMobile: use.isMobile,
    locale: use.locale,
    userAgent: use.userAgent,
    viewport: use.viewport,
  };
}

/**
 * Service-worker and offline checks get a context that no other test can use.
 * Network state and browser resources are restored even when an assertion fails.
 */
export async function withFreshContext<T>(
  browser: Browser,
  testInfo: TestInfo,
  run: (fixtures: FreshContext) => Promise<T>,
): Promise<T> {
  const context = await browser.newContext(contextOptions(testInfo));
  const page = await context.newPage();
  let result: T | undefined;
  let runError: unknown;

  try {
    result = await run({ context, page });
  } catch (error) {
    runError = error;
  } finally {
    await context.setOffline(false).catch(() => undefined);
    await page.close({ runBeforeUnload: false }).catch(() => undefined);
    await context.close().catch(() => undefined);
  }

  if (browser.contexts().includes(context)) {
    throw new Error('Fresh browser context was not released after the test.');
  }
  if (runError !== undefined) {
    throw runError;
  }
  return result as T;
}
