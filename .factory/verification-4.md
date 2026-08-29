# Independent verification 4 — Durable Set Log

**Result: PASS**

Verified on 2026-08-29 against candidate commit
`3e0773235e7b64aa05c14988728d4077769a680f` and the live production URL
<https://durable-set-log.sociobot.in>. The deployed root document, service
worker, and web manifest are byte-identical to a fresh local production build.

## First read (cold live visit)

The first screen says: “Log every strength set, even offline.” It says this is
for “strength trainees” whose completed sets must survive reloads or lost
signal. The first primary action is **Try it with sample data**, and its nearby
copy says that it opens a separate ledger that is never saved with real data.
This passes the plain-words and one-click demo gate.

## Required claims — run first from the demo entry point

`.factory/claims.json` is present and declares 13 claims. After `npm ci`, I
ran every declared command exactly as written. Every command built the product
and passed in both configured browser projects (26 claim executions total):

| Claim ID | Result |
| --- | --- |
| `offline-reload` | PASS |
| `confirmed-device-write` | PASS |
| `csv-export` | PASS |
| `local-privacy` | PASS |
| `demo-isolated` | PASS |
| `append-only-corrections` | PASS |
| `json-backup-restore` | PASS |
| `csv-collision-safe` | PASS |
| `atomic-workout-write` | PASS |
| `free-routine-limit` | PASS |
| `paid-summary-unlock` | PASS (routed verification fixture) |
| `purchase-price-checkout` | PASS (routed checkout fixture) |
| `license-revocation` | PASS (all invalid-license fixtures) |

The landing page and README claims were cross-checked against this manifest;
the reliability, export/import, local-data, demo-isolation, and paid-license
promises have observable claim coverage. No unlisted public claim was found.

## Local quality gates

| Check | Fresh evidence |
| --- | --- |
| Install | `npm ci` — 148 packages added, 0 vulnerabilities |
| Unit tests | `npm test` — 9/9 passed |
| Type/lint | `npm run typecheck` PASS; `npm run lint` PASS |
| Production build | `npm run build` PASS; `dist/index.html` 60,908 B raw / 18.03 kB gzip |
| Browser suite | `npm run test:e2e` PASS (the complete 54-test configured run completed before the chained accessibility run) |
| Accessibility suite | `npm run test:a11y` PASS — 8 Playwright/axe scans and keyboard/dialog tests |
| PWA update | `npx playwright test tests/pwa-update.spec.ts` — 2/2 passed |

The repository does not include `@axe-core/cli`; its installed
`@axe-core/playwright` 4.10.2 integration ran instead. The fresh live-page
axe scan also found **no serious or critical violations**.

## Independent live product exercise

- Opened `/demo` from a new browser context. The persistent “Demo — sample
  data, nothing is saved” banner and realistic Tuesday strength sample were
  present.
- Checked boundary recovery: `2000.5 kg` and `1001` reps failed native
  validation, returned focus to the invalid weight field, and wrote no set.
- Completed a valid `85 kg × 5` Back squat set. Its saved value remained after
  reload and after a service-worker-controlled offline reload.
- In a separate real-data browser profile, created a `QA deadlift` routine,
  saved `120 kg × 3`, reloaded it successfully, corrected it to `122.5 kg ×
  3`, and verified both rows remained visible. CSV export contained the full
  documented header and the Deadlift record. Importing an invalid CSV returned
  the actionable error `Missing required column: event_id.`.
- Desktop keyboard: Tab focused the skip link. No console errors, page errors,
  or failed resources occurred during the live normal/demo/offline exercise.
- At 390 px, the page had no horizontal overflow and every visible interactive
  target measured at least 44 CSS px in both dimensions. The mobile demo was
  usable and its controls remained visible.
- With `prefers-reduced-motion: reduce`, nonzero animation and transition
  durations were reduced to `0.00001s`.

## Privacy, PWA, headers, and delivery

- The live normal demo flow made 15 requests, all to
  `https://durable-set-log.sociobot.in`; there were no third-party requests,
  analytics, or runtime CDN/font requests.
- Service worker was active with cache `durable-set-log-shell-v7`. The fresh
  offline reload retained the sample and saved set. The update regression test
  confirms activation removes an old shell while retaining IndexedDB data.
- `verify-url.sh` passed for `/` and `/demo/routines`: HTTP 200, title,
  `lang=en`, exactly one `h1`, a `main` landmark, no image lacking alt text,
  no unlabelled buttons, and no console errors.
- Live security headers include HSTS, CSP with `frame-ancestors 'none'`,
  `X-Content-Type-Options: nosniff`, Referrer-Policy, and Permissions-Policy.
  `/sw.js` is `no-cache, max-age=0`; hashed art is immutable for one year;
  `/does-not-exist` is a real HTTP 404.
- The desktop initial transfer measured 143,252 B and mobile 53,508 B. The
  first-load JavaScript/CSS is in the 18.03 kB-gzip document, below the static
  PWA JavaScript and CSS budgets.
- SHA-256 identity check:

| Artifact | SHA-256 |
| --- | --- |
| local `dist/index.html` / live `/` | `4a89855b69154260ce979a7b80ff85878db58cf9c90f7dbd398c5f3a827f5c32` |
| local `dist/sw.js` / live `/sw.js` | `b3cdaa3f2e930e5b0d52598e1fae5ada5a66fb3b4f0afa462d5ccf8e29126751` |
| local manifest / live manifest | `480147748b7f199a47edb4e8fc60f72c6aa47d6502c1aa5e318b7f6dd769e5a9` |

## Purchase endpoint request allowance

The app is static; its only product-related server call is the documented
Sociobot license verification endpoint. Fresh sequential requests from one
client using a deliberately invalid token returned 200 for requests 1–30.
Requests 31–35 returned `429 Retry-After: 3`; request 36 returned
`429 Retry-After: 2`. Observed allowance: **30 requests per window**.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

No release-blocking finding remains. This is a static local-first PWA; a
library/CLI consumer install, backend concurrency/health check, and Entra
sign-in check do not apply.
