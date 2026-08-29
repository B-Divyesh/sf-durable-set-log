# Independent verification 5 — Durable Set Log

**Result: PASS**

Verified 2026-08-29 against candidate commit
`dd92c45fcdf586d364509008212a0fc0f18f7bc3` and live production
<https://durable-set-log.sociobot.in>.

## First read and demo gate

Cold live `/` plainly says it logs every strength set, even offline; it names
strength trainees whose completed sets must survive reloads or lost signal;
and its primary action is **Try it with sample data**. The adjacent sentence
states that the sample is separate and never saved with real data. Clicking it
once opened `/demo` with the persistent demo banner and the realistic Tuesday
strength ledger (Back squat and Bench press, three saved events). This passes
the plain-words and one-click isolated-demo gate.

## Mandatory claims gate — run first

`.factory/claims.json` was present. From the clean candidate checkout I ran
`npm ci` (148 packages, 0 vulnerabilities), then ran every listed command
individually through the product's demo entry point. All passed in both
configured Playwright projects; the final Playwright run record was
`{"status":"passed","failedTests":[]}`.

| Claim | Result |
| --- | --- |
| `offline-reload` | PASS |
| `confirmed-device-write` | PASS |
| `csv-export` | PASS |
| `local-privacy` | PASS |
| `no-account-or-sync` | PASS |
| `not-medical-guidance` | PASS |
| `demo-isolated` | PASS |
| `append-only-corrections` | PASS |
| `json-backup-restore` | PASS |
| `csv-collision-safe` | PASS |
| `atomic-workout-write` | PASS |
| `free-routine-limit` | PASS |
| `paid-summary-unlock` | PASS (routed Sociobot fixture) |
| `purchase-price-checkout` | PASS (routed checkout fixture) |
| `license-revocation` | PASS (invalid/revoked/expired/wrong-product fixtures) |

The landing page and README claims were cross-checked against this manifest.
No unlisted public claim was found.

## Clean local quality gates

| Check | Fresh result |
| --- | --- |
| Lint and type check | `npm run lint` PASS; `npm run typecheck` PASS |
| Unit/policy tests | `npm test` PASS — 12/12 |
| Browser suite | `npm run test:e2e` PASS — configured 62-test run completed with no failed tests |
| Accessibility suite | `npm run test:a11y` PASS — 8/8 in 33.6 s |
| Production build | `npm run build` PASS; `dist/index.html` 60.90 kB raw, 18.01 kB gzip |

The installed `@axe-core/playwright` integration is used by the repository;
the live axe scan also returned no violations, including zero serious or
critical findings.

## Independent live exercise

- In a fresh `/demo/workout` context, completed Back squat `100 kg × 5`.
  The confirmation appeared only after saving; the value survived one online
  reload and three service-worker-controlled offline reloads.
- Boundary recovery works: `2000.5 kg` and `1001` reps are invalid, leave no
  set written, and focus the offending field. Replacing them with `100` and
  `5` saved the set successfully.
- Live service-worker update simulation removed
  `durable-set-log-shell-v5`, activated `durable-set-log-shell-v8`, and kept a
  newly saved `Live update survivor` IndexedDB routine.
- Desktop keyboard use: Tab reaches the skip link with a visible coral
  `4px` focus outline; Enter opens the routine dialog with focus in its name
  field; Escape closes it and restores the trigger. Reduced motion computes
  to `0.00001s` duration and `scroll-behavior: auto`.
- At 390 px, the seeded demo had `scrollWidth === innerWidth === 390`, no
  console errors, and a usable bottom navigation and export action.
- `/opt/fleet/lib/verify-url.sh` passed live `/`: HTTP 200, title, `lang=en`,
  one `h1`, `main`, no images without alt text, no unlabelled buttons, and no
  console/page errors (702 ms observed load in that check).

## Privacy, delivery, and headers

- The full live normal demo flow made 43 observed requests, all to
  `https://durable-set-log.sociobot.in`; no analytics, CDN, account, sync, or
  other third-party request occurred.
- Live headers include HSTS, response-header CSP with
  `frame-ancestors 'none'`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `X-Content-Type-Options: nosniff`, and Permissions-Policy. `/sw.js` is
  `no-cache, max-age=0`; hashed AVIF art is immutable for one year; an unknown
  route is the designed HTTP 404.
- Live `/`, `/demo`, `/routines`, `/ledger`, `/more`, `/privacy/`, `/terms/`,
  manifest, offline page, and 404 page returned the expected successful
  responses (the intentional unknown route returned 404).
- The checkout endpoint returned HTTP 303 to hosted Dodo checkout. The
  static app has no product backend or sign-in flow. Its only product server
  call is Sociobot license verification: 30 sequential invalid-token requests
  returned 200; requests 31–36 returned `429` with `Retry-After: 4`.
  Observed allowance: **30 requests per window**.

## Candidate/deployment identity and budget

Fresh production build and live response SHA-256 values matched exactly:

| Artifact | SHA-256 |
| --- | --- |
| `dist/index.html` and live `/` | `6542a7d132cdacf732735fbbfbc1b48219a4ee7157cd94c5f4a81c2854ab79510a` |
| `dist/sw.js` and live `/sw.js` | `7484b39e4a7408f066ff4101f158af6dfd3338f1e7a0779bf389fea1a78880c0` |
| manifest | `1073b2648635043f16fceeb1fcd1767f3f7ef384cb8033b0a458aafa2db53de3` |
| mobile hero AVIF | `d21a9309720791360ad1c09a5cbaa3ace4067403b1dfeeb855f67d108c796abe` |

Initial HTML, including the inlined modern JS and CSS, is 18.01 kB gzip;
legal CSS is 3.6 kB raw and the mobile hero AVIF is 34.4 kB. These are within
the static PWA JS, CSS, and image budgets.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

No release-blocking finding remains. Library/CLI consumer testing, backend
concurrency/health checks, and Entra sign-in verification do not apply to this
static local-first PWA.
