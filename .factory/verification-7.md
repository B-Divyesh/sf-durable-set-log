# Independent verification 7 — Durable Set Log

**Result: PASS.**

Verified on 2026-08-29 against candidate commit
`05302fdd005cbe27190e566cacc34e00b309d5bb` and production
<https://durable-set-log.sociobot.in>.

## Release decision

The candidate passes the release contract. The previous deployment-only
browser-runner concern does not reproduce: the serial full browser suite exits
successfully with the configured bundled Chromium. Production is this exact
candidate: all 28 publicly served build artifacts matched the fresh `dist/`
files byte for byte (the deployment-only `staticwebapp.config.json` is not a
served artifact). Root HTML SHA-256 on both sides is
`d6ee2ff94e09be3e6e376d277b0f3fc201c3e58d8b7d0f852d198663d3ad3fb0`.

No release-blocking, high, medium, or low defects were found.

## First-read and isolated demo gate

Cold live `/` plainly says: **“Log every strength set, even offline.”** It
names the intended person — strength trainees whose completed sets must survive
a reload or lost signal — and its first primary action is **“Try it with sample
data.”** The adjacent note explains that the sample opens a separate ledger
and is not saved with the visitor’s data. This passes the first-read test.

That one click opens `/demo`, with the persistent **“Demo — sample data,
nothing is saved”** banner, Reset demo and Start for real controls, and a
realistic Tuesday strength sample: Back squat, Bench press, chest-supported
row, and an existing set ledger. `.factory/demo.md` documents the separate
`durable-set-log:demo` IndexedDB namespace. The demo is therefore both one
click and isolated from real data.

## Claims gate — run first

`.factory/claims.json` is present and has 17 claims. From this checkout, after
`npm ci` (148 packages added; audit reports 0 vulnerabilities), I ran every
listed `test` command exactly as written, separately, via its `/demo` browser
sandbox. Every command passed in both configured Chromium projects (34 claim
executions total).

| Claim IDs | Result |
| --- | --- |
| `offline-reload`, `confirmed-device-write`, `csv-export` | PASS |
| `local-privacy`, `no-account-or-sync`, `not-medical-guidance` | PASS |
| `demo-isolated`, `append-only-corrections`, `json-backup-restore` | PASS |
| `csv-collision-safe`, `atomic-workout-write`, `free-routine-limit` | PASS |
| `paid-summary-unlock`, `purchase-price-checkout`, `sociobot-payment-handling` | PASS with routed Sociobot fixtures where applicable |
| `no-embedded-payment-provider`, `license-revocation` | PASS |

The landing page and README claim-like statements were cross-checked against
this inventory; no unlisted visitor promise was found.

## Local quality gates

| Check | Fresh result |
| --- | --- |
| `npm run lint` | PASS |
| `npm test` | PASS — 16/16 |
| `npm run typecheck` | PASS (also part of build) |
| `npm run build` | PASS — `dist/` produced |
| `npm run test:e2e` | PASS — 64 passed, 2 expected viewport-specific skips, 0 failed |
| `npm run test:a11y` | PASS — 8/8; axe found zero violations |

The exact production build has a 60,915 B app shell, 17,897 B gzip. Its mobile
AVIF hero is 34,400 B and legal CSS is 3,634 B: all are within the PWA budgets.
Fresh live Lighthouse (mobile) scored Performance **95**, Accessibility **100**,
Best Practices **100**, SEO **100**; FCP 0.93 s, LCP 1.35 s, CLS 0.

## Independent product exercise

The passing end-to-end suite and claim exercises cover the brief’s real job:
create a reusable routine, start a workout, complete a set only after the
IndexedDB write, reload, append a correction without removing the original,
export CSV, import/restore safely, and retain entries through offline reloads.
They cover invalid numerical values, malformed imports, collision-safe import,
limits, recovery feedback, and the 100 deliberate offline reload durability
test in both desktop and mobile projects.

Fresh live checks added the following independent evidence:

- A service-worker-controlled page had cache `durable-set-log-shell-v8`; after
  `context.setOffline(true)`, a reload passed and retained the landing app
  (`Log every strength set, even offline.`). The suite separately verifies
  service-worker activation removes an old shell while IndexedDB data remains.
- Cold production request logging in Playwright recorded only the product root
  and its same-origin hero image. The mandatory `local-privacy` demo-flow claim
  also passed, recording only same-origin requests. There were no console or
  page errors in the fresh desktop or 390 px live checks.
- The live desktop axe scan found zero violations, including zero serious or
  critical findings. At 390 px, the sample action measures 271.6 × 53 px,
  there is no horizontal overflow, and the layout remains readable and
  one-handed. Focus on the sample link is a designed coral `4px` outline;
  reduced motion reports a transition duration of `0.00001s`.
- The cold first screen has a correct title, `lang=en`, exactly one `h1`, a
  `main` landmark, descriptive image alt text, a skip link, visible focus, and
  no errors. The factory `verify-url.sh` independently returned HTTP 200 in
  1,503 ms with the same structural checks and zero console/page errors.

## Privacy, headers, caching, and API allowance

No account or sign-in flow exists, so Entra validation is not applicable.
The normal product remains local-first; no analytics, third-party font/script,
cloud workout storage, or embedded payment provider was observed. The only
payment handoff is the tested Sociobot checkout link.

Live response checks confirm HSTS, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, a response-header CSP with
`frame-ancestors 'none'`, and a restrictive Permissions-Policy. `/sw.js` has
`Cache-Control: no-cache, max-age=0`; hashed art is immutable for one year; an
unknown URL returns the designed HTTP 404 page.

The factory product-unlock endpoint’s allowance was freshly exercised from one
client with invalid verification tokens. Requests 1–30 received 200; request
31 and the next five received **429** with `Retry-After: 4`. Observed
allowance: **30 requests per rate-limit window**.

## Not applicable

This is a static local-first PWA, not a library, CLI, backend, or account
product. Consumer-package installation, server persistence/concurrency/health,
and sign-in-provider checks do not apply.
