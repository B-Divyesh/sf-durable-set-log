# Independent verification 6 — Durable Set Log

**Result: FAIL — do not release this candidate until the full browser suite is
reliably green.**

Verified on 2026-08-29 against candidate commit
`7f1c839810b84b259a5803869e2b6e10b0499bbd` and live production
<https://durable-set-log.sociobot.in>.

## Release decision

The deployed product itself is healthy in the independent live exercises below
and exactly matches the candidate build. However, the required local quality
gate `npm run test:e2e` exited with status 1 on two consecutive clean runs.
Each run reached 63 passed, 2 skipped, and 1 failed after the Playwright
Chromium headless-shell process crashed with `SIGSEGV` (`SEGV_MAPERR`). This is
release-blocking under the factory definition of done: the full available test
suite must pass locally. The failing test varied between the two attempts,
which makes the evidence consistent with a test/browser-runner instability
rather than an observed product behavior, but does not make the command pass.

## Mandatory first-read and demo gate

Cold live `/` answers all three questions in plain words. It says it logs every
strength set even offline, names strength trainees whose completed sets must
survive reload or lost signal, and exposes **Try it with sample data** as the
first primary action. The neighboring note explains that the sample opens a
separate ledger and is not saved with real data.

One click opened `/demo` with the persistent **Demo — sample data, nothing is
saved** banner, Reset demo, Start for real, and a realistic Tuesday strength
sample (Back squat, Bench press, chest-supported row, and recorded ledger
events). This passes the first-read and isolated-demo gates.

## Claims gate — run first

`.factory/claims.json` exists and declares 17 claims. After `npm ci` from this
checkout (148 packages, audit: 0 vulnerabilities), I ran every listed command
exactly as written, individually, through the demo entry point. Every command
passed in both configured Chromium projects: 34 passing claim executions.

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
| `sociobot-payment-handling` | PASS (routed verification fixture) |
| `no-embedded-payment-provider` | PASS |
| `license-revocation` | PASS (invalid/revoked/expired/wrong-product fixtures) |

I cross-checked the visible landing-page and README promises with this
manifest. No unlisted visitor-facing claim was found.

## Local quality gates

| Check | Result |
| --- | --- |
| `npm test` | PASS — 12/12 |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — `dist/` produced |
| `npm run test:a11y` | PASS — 8/8; axe found no violations |
| `npx playwright test tests/pwa-update.spec.ts tests/durability.spec.ts` | PASS — 6/6; includes 100 offline reloads and SW update/data retention in both projects |
| `npm run test:e2e` (attempt 1) | **FAIL** — 63 passed, 2 skipped, 1 failed; Chromium `SIGSEGV` while setting up `@claim:license-revocation` |
| `npm run test:e2e` (attempt 2) | **FAIL** — 63 passed, 2 skipped, 1 failed; Chromium `SIGSEGV` while setting up `@claim:no-embedded-payment-provider` |

The two affected claim tests passed when run through their mandatory individual
commands. The full-run failure reports a Chromium executable crash, not an
assertion failure, page error, or console error. Nevertheless, the package
script is not reliable and therefore does not meet the release gate.

The production build is 60.92 kB raw / 18.02 kB gzip for the inlined app shell.
The mobile AVIF hero is 34.4 kB and legal CSS is 3.6 kB raw, within the stated
static-PWA budgets.

## Independent live product exercise

- Completed a demo Back squat set, then reloaded under service-worker-controlled
  offline mode. The saved `85 kg × 5` record remained visible. The focused
  local reliability suite additionally passed all 100 deliberate offline
  reloads in each configured browser project.
- Boundary/recovery test on live `/demo/workout`: `2000.5 kg` and `1001` reps
  left “No set written yet,” focused the invalid weight field, and failed native
  validity. Correcting to `2000 kg × 1` saved successfully.
- Keyboard-only smoke test on live: Tab first focuses the skip link with a
  designed coral `4px` outline and `3px` offset; Enter opens the routine dialog
  with focus in Routine name; Escape closes it.
- At 390 px, the live page had no horizontal overflow and no visible controls
  smaller than 44 CSS px. The one-handed bottom navigation and sample workout
  are usable. Reduced-motion media matched and exposed no running animations;
  body transition duration was `0.00001s`.
- Live axe scans on desktop and 390 px had zero serious or critical findings.
  Live console/page-error logs and failed-resource logs were empty during the
  normal demo flow.

`/opt/fleet/lib/verify-url.sh` passed against live `/`: HTTP 200 in 624 ms,
title present, `lang=en`, exactly one `h1`, a main landmark, no missing image
alt text, no unlabelled buttons, and no console/page errors.

## Privacy, PWA, headers, and delivery

- A fresh live normal demo flow made requests only to
  `https://durable-set-log.sociobot.in`; no analytics, tracking, third-party
  font/script, account, or cloud-sync request was observed. The product has no
  sign-in flow, so Entra validation does not apply.
- The live service worker controlled the page, uses versioned shell cache
  `durable-set-log-shell-v8`, and the focused update test proved removal of an
  old shell while retaining IndexedDB data.
- Root responses include HSTS, response-header CSP with
  `frame-ancestors 'none'`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `X-Content-Type-Options: nosniff`, and the stated Permissions-Policy.
  `/sw.js` is `no-cache, max-age=0`; hashed art is immutable for one year; an
  unknown route returns the designed HTTP 404.
- The direct Sociobot verification endpoint is rate-limited. From one client,
  30 sequential invalid-license requests returned 200; requests 31–36 returned
  `429` with `Retry-After` (first observed value: 3 seconds). Observed
  allowance: **30 requests per window**.

## Candidate/deployment identity

The freshly built `dist/index.html` and live `/` have identical SHA-256:

`d6ee2ff94e09be3e6e376d277b0f3fc201c3e58d8b7d0f852d198663d3ad3fb0`

I additionally downloaded and hashed every served product artifact: all 28
build artifacts matched exactly (0 mismatches). The live site is therefore the
requested candidate, not a stale or deployment-only variant.

## Defects by severity

### Release-blocking

1. **Full browser quality gate is flaky/failing.** `npm run test:e2e` crashed
   the Playwright Chromium process and exited 1 in two consecutive attempts.
   Make the full command stable in the factory browser environment, then rerun
   it cleanly to a zero exit status. Do not treat individual claim success as a
   substitute for the required full-suite quality gate.

### High, medium, low

None found in the deployed product or the independently exercised workflows.

## Not applicable

This is a static local-first PWA, not a library, CLI, or backend. It has no
application server, persistence service, health endpoint, concurrency surface,
or sign-in provider to test.
