# Durable Set Log — repair handoff

Work order: `durable-set-log-repair-3`
Verifier base: `1d210f4b116d705f6836748934ddf6f12af6a547`
Repaired product commit: `0351152d589806fa28afa76d5ebdaedaea9fe7af`
Deployed URL: <https://durable-set-log.sociobot.in>
Deployment: Azure Static Web Apps, production, deployment ID
`27fcf123-f3e7-4e21-a5ea-a694e62bc026`

## Result

**PASS — every finding in independent verification 3 is repaired.** The
artifact remains a Vite TypeScript local-first PWA with IndexedDB, demo storage
isolation, a service worker, and static `dist/` deployment.

## Repairs

- The concrete-route build plugin now restores root-absolute icon, manifest,
  and preload URLs after `vite-plugin-singlefile` rewrites them. `/demo/workout`,
  `/demo/routines`, and `/demo/more` therefore load the same PWA metadata and
  no longer request nonexistent nested resources.
- Added one exact claim and isolated `/demo` regression for each paid promise:
  free two-routine limit with free CSV, valid unlimited-routine/summary unlock,
  US$14 checkout action, and every invalid license reason. The manifest now has
  13 claims, each with exactly one `@claim:` test.
- Replaced `h1 → h3` jumps with semantic `h2` section/item headings. Axe
  regressions now fail at every severity rather than filtering out moderate
  findings.
- Raised More-page inline links and legal contact links to 44px targets and
  added 390px assertions.
- Added the required landing-page How it works, Privacy and limits, and
  US$14 one-time unlock sections. Replaced the reported metaphor headings and
  regenerated the complete landing copy audit.
- Bumped the PWA shell cache from `v6` to `v7` so already-installed clients
  receive the repair through the existing update flow.

## Local verification

Ran from a clean dependency install on 2026-08-29:

| Check | Evidence |
| --- | --- |
| Clean install | `npm ci` — 148 packages, 0 vulnerabilities |
| Types and lint | `npm run typecheck` PASS; `npm run lint` PASS |
| Unit/policy tests | `npm test` PASS — 9 tests |
| Production build | `npm run build` PASS; `dist/index.html` exists; 60,908 B raw / 17,925 B gzip |
| Declared claims | `npm run test:claims` PASS — 26 Playwright executions (13 exact claims × desktop and 390px mobile) |
| Complete browser suite | `npm run test:e2e` PASS — 52 passed, 2 intended desktop-only skips |
| Accessibility | `npm run test:a11y` PASS — 8 Playwright axe scans, all severities; keyboard skip-link and modal focus tests pass |
| Service-worker update | `npx playwright test tests/pwa-update.spec.ts` PASS — 2 projects; v5 cache removed, v7 active, IndexedDB retained |
| Offline/privacy | Existing claim suite covers first-visit offline reload, device-write confirmation, separate demo storage, and no third-party normal-flow requests |
| Nested-route smoke | `/opt/fleet/lib/verify-url.sh` against local `/demo/routines` returned `errors: []`, one `h1`, `lang=en`, one main landmark, and no missing image alt text |

`npx @axe-core/cli` was also attempted. Its Selenium ChromeDriver is version
152 while the worker deliberately ships Playwright Chromium 145, so the CLI
cannot create a browser session in this image. The repository's installed
`@axe-core/playwright` integration uses that shipped browser and ran the same
axe engine successfully without severity filtering.

## Production verification

- Ran `/opt/fleet/lib/deploy-static.sh durable-set-log dist`; the production
  upload succeeded and the managed custom domain returned HTTP 200.
- `/opt/fleet/lib/verify-url.sh` reports `errors: []` for both `/` and
  `/demo/routines`. The nested demo page has the expected title, `lang=en`,
  one `h1`, main landmark, labelled controls, and no missing image alt text.
- The live nested demo routes, root manifest, Apple icon, preloaded AVIF, and
  service worker each return HTTP 200.
- Live response headers include HSTS, CSP with `frame-ancestors 'none'`,
  Permissions-Policy, Referrer-Policy, and `X-Content-Type-Options: nosniff`.
- Candidate/live SHA-256 identity matched exactly:

| Artifact | SHA-256 |
| --- | --- |
| `dist/index.html` and live `/` | `4a89855b69154260ce979a7b80ff85878db58cf9c90f7dbd398c5f3a827f5c32` |
| `dist/demo/routines/index.html` and live route | `d84db0b28bfbf1d3d06a9e4348294f9dd4d9a27600dcded15f8d5c3a0c1831e9` |
| `dist/sw.js` and live `/sw.js` | `b3cdaa3f2e930e5b0d52598e1fae5ada5a66fb3b4f0afa462d5ccf8e29126751` |
| `dist/manifest.webmanifest` and live manifest | `480147748b7f199a47edb4e8fc60f72c6aa47d6502c1aa5e318b7f6dd769e5a9` |

- Fresh live Lighthouse: Performance **98**, Accessibility **100**, Best
  Practices **100**, SEO **100**; FCP 0.9 s, LCP 1.4 s, CLS 0, total transfer
  142 KiB.

## Known gaps and next steps

No known product or release gaps remain. This is a static PWA, so package
consumer installation, backend health/concurrency checks, and Entra identity
checks do not apply. The only test-runner limitation is the mismatched external
axe CLI driver described above; its equivalent repository integration passed.

For future changes, run `npm ci && npm test && npm run build`, then
`npm run test:claims`, `npm run test:e2e`, and `npm run test:a11y` before
deploying `dist/` through the factory static work order.
