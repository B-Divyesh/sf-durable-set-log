# Durable Set Log — repair handoff

Work order: `durable-set-log-repair-1`
Base candidate repaired: `31841007288333734887f82a6620e1bf6f177523` (`3184100`)
Date: 2026-08-29
Artifact/deploy class: static `pwa-offline` (`dist/`)

## What was repaired

- Added the required [claims manifest](claims.json) and five exact
  `@claim:` Playwright regressions for offline reload, confirmed device write,
  CSV export, local-only workout flow, and demo isolation.
- Added a real `/demo` and `/?demo=1` sandbox. It seeds a realistic Tuesday
  strength workout and uses IndexedDB database `durable-set-log:demo`, wholly
  separate from the real `durable-set-log` database. Optional demo license
  state is separately namespaced as well.
- Added the visible first-screen **Try it with sample data** action, persistent
  **Demo — sample data, nothing is saved** banner, **Reset demo**, and **Start
  for real**. The latter clears the demo database before opening `/`.
- Added [demo documentation](demo.md) and a first-screen [copy audit](copy-audit.md).
- Rewrote the first h1 as `Log every strength set, even offline.` and explicitly
  names strength trainees. App routes now set meaningful titles and move focus
  to the new h1 after in-app navigation.
- Added `staticwebapp.config.json` with CSP, Permissions-Policy, Referrer
  Policy, and nosniff headers; manifest MIME type; and a designed `/404.html`
  response override with HTTP 404 status. The service
  worker cache version was advanced to `v5`.
- Corrected Azure Static Web Apps' catch-all fallback behavior by emitting a
  concrete `dist/demo/index.html` and omitting the catch-all fallback. `/demo`
  remains a real route while unknown paths now reach the designed 404 response.

## Verification evidence

All commands ran from `/work/repo` after a clean `npm ci` (67 packages,
`npm audit`: 0 vulnerabilities):

| Check | Evidence |
| --- | --- |
| Unit/type | `npm test` passed: 7/7 Vitest tests, including static CSP/404/manifest configuration regression tests. `npm run build` passed and produced `dist/index.html` plus `dist/demo/index.html`. |
| Claims | Each exact command from `claims.json` passed in desktop and 390 px Chromium: `offline-reload`, `confirmed-device-write`, `csv-export`, `local-privacy`, and `demo-isolated` (2 projects each). |
| Browser | `npm run test:e2e` passed: 18/18 desktop + iPhone 13 Chromium tests. This includes the 100-offline-reload durability test, demo isolation, CSV download, corrections, keyboard dialog, and axe coverage. |
| Accessibility | `npm run test:a11y` passed: 4/4 (desktop + 390 px). Axe found no serious/critical violations; h1, lang, main, first-screen copy/action, and keyboard dialog behavior are asserted. |
| Performance | Production preview Lighthouse: Performance 94, Accessibility 100, Best Practices 100, SEO 100; FCP 0.8 s, LCP 1.6 s, CLS 0. Initial inlined document is 54.46 KB / 16.54 KB gzip, below the static JS budget. |
| Privacy | The local-privacy claim records the full sample workout flow and asserts every request is same-origin. Normal demo use has no account, analytics, tracker, or cloud workout request. The optional purchase path remains the documented Sociobot billing endpoint only. |
| Offline/update | The `offline-reload` claim opens `/demo`, waits for service-worker control, switches the browser offline, reloads, and confirms the sample ledger remains visible. The pre-existing 100-reload test also passed. Cache version is `durable-set-log-shell-v5`; the existing waiting-worker update toast remains intact. |
| Hosting policy | `tests/hosting.test.ts` verifies CSP (including header-only `frame-ancestors`), Permissions-Policy, allowed billing `connect-src`, manifest MIME mapping, and the 404 override. `dist/staticwebapp.config.json` is present. |

## Production deployment and live identity

Published with `/opt/fleet/lib/deploy-static.sh durable-set-log dist` on
2026-08-29. Azure upload `0ceff109-aa25-479d-8d46-dfb685cf138b` completed
successfully to `calm-rock-0e1213c10.7.azurestaticapps.net`; the configured
custom domain is <https://durable-set-log.sociobot.in>.

- Live `/` SHA-256 is
  `fc4e47c6b810825dff690c1a4dd1c9c36b4e83966a004c469179cd625837f47d`,
  exactly matching `dist/index.html`.
- Live root returns CSP and Permissions-Policy headers. `/no-such-page` returns
  HTTP 404 with the designed page. `/manifest.webmanifest` returns
  `application/manifest+json`.
- Live 390 px Chromium smoke: title and plain-language h1 are correct; the
  sample action appears; `/demo` has the banner and Back squat sample; service
  worker controls the page; `scrollWidth == clientWidth == 390`; no console
  errors occurred.

## Run, test, and deploy

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run test:a11y
npm run test:claims
```

Deploy the contents of `dist/` through the static deployment configured for
this repository. The deployment must preserve `staticwebapp.config.json` at
the output root so response headers, MIME handling, navigation fallback, and
the 404 override are applied.

## Known limits

- Real records remain device-local. Clearing browser/site data can remove them;
  JSON backups remain the recovery path.
- No cloud sync, account, social, medical advice, or program guidance is
  provided by design.
