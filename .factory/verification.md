# Independent verification — FAIL

Verified candidate: `31841007288333734887f82a6620e1bf6f177523` (`3184100`)<br>
Verified URL: <https://durable-set-log.sociobot.in/><br>
Date: 2026-08-28<br>
Verifier work order: `durable-set-log-verify-1`

## Release decision

**FAIL — do not release this candidate.** The mandatory claims gate cannot run
because `.factory/claims.json` is absent. The mandatory first-screen demo is
also absent, and the apparent `?demo=1` entry point is not an isolated demo.
These are release-blocking requirements independent of the otherwise healthy
local PWA implementation.

## Mandatory gate results

| Gate | Result | Evidence |
| --- | --- | --- |
| Claims manifest and every listed claim test | **FAIL** | From the clean checkout, `test -f .factory/claims.json` was false (`MISSING .factory/claims.json`). There were therefore no listed commands to run and no observable proof for on-page durability, offline, CSV, or privacy claims. The claims contract makes this release-blocking. |
| First-read, cold live page | **FAIL** | At 390 px, the first viewport says “Your sets should outlast a reload.” and “Tap complete … written straight to this device.” It describes a device ledger, but does not name the intended strength trainee. The only primary action is `Make your first routine`; there is no `Try it with sample data` action. |
| One-click sandboxed demo | **FAIL** | Live `/?demo=1` has no sample action and no `Demo — sample data, nothing is saved` banner (`0` matching controls). In a fresh browser context, a routine created at `/?demo=1` was visible after navigating to `/` (`visibleInRealMode: 1`), proving that query is the real IndexedDB namespace, not an isolated sandbox. `.factory/demo.md` is also absent. |

The missing claims manifest also means all visitor-facing reliability/privacy
claims are unlisted. Examples include “Written before confirmation”,
“Reload-safe IndexedDB”, “CSV stays yours”, “offline-first”, and the README's
offline/CSV/no-cloud assertions. None has the required one-to-one sandbox test.

## Defects

### Blocker

1. `.factory/claims.json` is missing. Required claim tests were impossible to
   run from the demo entry point. This independently fails release acceptance.
2. No visible one-click “Try it with sample data” path exists on the cold first
   screen. No realistic sample, persistent demo banner, Reset demo, or Start
   for real action exists.
3. `?demo=1` is not demo mode and writes into real-mode IndexedDB. A visitor
   could reasonably expect the documented/required demo URL to be safe, but it
   is not isolated.

### High

4. There is no `.factory/demo.md`; demo URL, sample, reset behavior, and
   storage namespace are undocumented.
5. Claim-like copy is published without a claims manifest/test mapping. This
   includes the core durability and privacy propositions.

### Medium

6. The live root response lacks `Content-Security-Policy` and
   `Permissions-Policy`. It returns `Referrer-Policy` and
   `X-Content-Type-Options`, but the required CSP is absent.
7. `/no-such-page` returns `200` and the app shell, not a designed 404 route.
   `staticwebapp.config.json` is absent. The required static-site 404 behavior
   is therefore not present.
8. The one page `<h1>` is the product name rather than the plain-language job,
   and the cold screen does not explicitly say it is for strength trainees.

## Checks that passed

### Clean local checkout and build

| Command/check | Result |
| --- | --- |
| `npm ci` | passed; 65 packages installed; `npm audit` reported 0 vulnerabilities |
| `npm test` | passed: 4/4 Vitest CSV tests |
| `npm run build` | passed; TypeScript check passed and `dist/` produced |
| `npm run test:e2e` | passed: 4/4 mobile Chromium tests, including the project’s 100 offline reload durability test |
| Output budget | `dist/index.html` is 49,445 B / 15.26 KB gzip; initial JS is within the 200 KB static budget |

`verify-url.sh` was not present in the checkout, so that named worker utility
could not be run. Equivalent live title/lang/main/alt/console checks were run
with Playwright.

### Live artifact identity and practical workflow

- `sha256sum dist/index.html` and live `/` both equal
  `07dce78a5a5f500d3656ddc7f593ea554d79707f81b58a9b22036ad97014a12a`.
  Local and live `sw.js` both equal
  `bc1db4a0effac034615773098dadfe128c1574305d6bd6f26213e38b2103fb11`.
- On the live site in a clean desktop context: created a routine, rejected
  invalid `sets=0` and `weight=-1` with native validation, completed a 75.5 kg
  x 5 set, exported a CSV with the expected header and one record, appended an
  80 kg correction while preserving the original row, rejected malformed CSV
  with `Missing required column: event_id.`, and exported a JSON backup. No
  console or page errors occurred.
- A live service worker controlled the page. After its first online load, the
  confirmed set survived 10 live offline reloads without console errors. The
  repository e2e test passed its stricter 100-reload scenario. The current
  deployment had no waiting worker; the update path was code-reviewed but a
  full old-to-new live update cycle cannot be observed without serving a newer
  worker version.
- A fresh normal demo-free flow made only same-origin requests (`/` and the
  self-hosted hero image), with no cookies. No account/sign-in flow exists.
- A burst of 80 invalid-license requests to
  `https://api.sociobot.in/api/v1/products/durable-set-log/verify` produced 29
  `200` responses followed by 51 `429` responses. Observed `Retry-After`
  values were `0`, `1`, and `2` seconds; rate limiting began within this burst
  (at approximately request 30 under 40-way concurrency).

### Accessibility, responsive, and response checks

- Live desktop and 390 px/reduced-motion axe scans: 0 serious/critical issues.
  The page has one `h1`, `lang=en`, a main landmark, meaningful hero alt text,
  and no console/page errors in exercised flows.
- Keyboard smoke test passed: skip link is first focus target; dialog initially
  focuses Routine name; Escape closes it and returns focus to its trigger.
  Designed 4 px `:focus-visible` outline is present. At 390 px,
  `scrollWidth == clientWidth == 390`; reduced motion changes transition
  duration to `0.00001s`.
- Live root headers: HSTS, `Referrer-Policy: strict-origin-when-cross-origin`,
  and `X-Content-Type-Options: nosniff` are present. Root and SW use
  `Cache-Control: public, must-revalidate, max-age=30`. Privacy, terms,
  manifest, robots, sitemap, offline page, and icons returned 200. The
  manifest response is `application/octet-stream`, not a web-manifest MIME
  type.

## Required remediation before re-verification

1. Add `.factory/claims.json` and claim-tagged clean-state tests for every
   published reliability, offline, CSV, and privacy claim; run each command.
2. Add a real `/demo` or `?demo=1` that seeds realistic training data in a
   separate IndexedDB namespace. Put `Try it with sample data` on the first
   screen and show the persistent demo banner with reset/start-real controls.
   Add `.factory/demo.md`.
3. Update first-screen/H1 copy to say what it does, name strength trainees, and
   direct the first click in plain words.
4. Add a CSP compatible with the inlined app, response security policy, and a
   real 404/static hosting configuration. Re-run all gates and independent
   verification after deployment.
