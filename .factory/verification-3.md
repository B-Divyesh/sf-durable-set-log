# Independent verification 3 — FAIL

Verified candidate: `e395ff84aa85c7b4f38c688cbe70f4616d5a9dc0` (`e395ff8`)

Verified URL: <https://durable-set-log.sociobot.in>

Date: 2026-08-29

Work order: `durable-set-log-verify-3`

## Release decision

**FAIL — do not release this candidate.** The core workout ledger is useful,
the nine declared claim tests pass, the live deployment matches the candidate,
and offline durability works. The candidate still fails two explicit release
gates:

1. Published paid-tier promises are missing from `.factory/claims.json` and
   have no exact `@claim:` tests. The claims contract makes any unlisted claim
   release-blocking.
2. Fresh loads of every nested demo route emit a 404 console error. Their
   relative manifest, apple-touch icon, and image-preload URLs resolve below
   `/demo/` and do not exist. The product definition requires no console errors
   on load, and the broken manifest URL compromises installability from those
   real routes.

## Mandatory gates

### Claims ran first

The supplied workspace was at the exact candidate SHA but had no installed
packages and contained pre-existing unrelated `graphify-out` changes. The first
literal invocation of every claim command could not start because `tsc` was not
installed (`rc=127`). After the prerequisite `npm ci`, which installed 148
locked packages and reported zero vulnerabilities, every exact command passed:

| Claim | Exact command | Result |
| --- | --- | --- |
| `offline-reload` | `npm run test:claims -- --grep @claim:offline-reload` | PASS, 2/2 projects |
| `confirmed-device-write` | `npm run test:claims -- --grep @claim:confirmed-device-write` | PASS, 2/2 projects |
| `csv-export` | `npm run test:claims -- --grep @claim:csv-export` | PASS, 2/2 projects |
| `local-privacy` | `npm run test:claims -- --grep @claim:local-privacy` | PASS, 2/2 projects |
| `demo-isolated` | `npm run test:claims -- --grep @claim:demo-isolated` | PASS, 2/2 projects |
| `append-only-corrections` | `npm run test:claims -- --grep @claim:append-only-corrections` | PASS, 2/2 projects |
| `json-backup-restore` | `npm run test:claims -- --grep @claim:json-backup-restore` | PASS, 2/2 projects |
| `csv-collision-safe` | `npm run test:claims -- --grep @claim:csv-collision-safe` | PASS, 2/2 projects |
| `atomic-workout-write` | `npm run test:claims -- --grep @claim:atomic-workout-write` | PASS, 2/2 projects |

The evidence is the observable behavior asserted in `tests/claims.spec.ts` and
the 18 successful Playwright project executions. No failure trace was produced.

### Claims cross-check

The manifest has one and only one tagged test for each of its nine IDs. It is
not complete. These user-facing promises have no claims entry or tagged test:

- “Free keeps two routines. The one-time unlock removes this limit; your ledger
  and exports always stay free.”
- “Pay US$14 once for unlimited routines and an on-device training summary.”
- The README repeats that a US$14 one-time license unlocks unlimited routines
  and the on-device summary.
- Terms promise that refunded, revoked, expired, invalid, or wrong-product
  licenses no longer unlock paid features.

These are observable product and purchase claims, not legal boilerplate. Manual
checks of the checkout redirect and invalid-license recovery do not replace the
required inventory and exact sandbox tests.

### Cold first-read test

PASS in a new live Chromium context at 1440×1000 and by visual inspection at
390×844:

- What: **“Log every strength set, even offline.”**
- For whom: **“For strength trainees who need each completed set to survive a
  reload or lost signal.”**
- First click: **“Try it with sample data.”**

The action is visible immediately, opens `/demo` in one click, and shows three
realistic sample set rows plus a persistent banner with **Reset demo** and
**Start for real**. The root cold load made three same-origin requests and had
no console or page error.

## Defects

### Blocker

1. **The claims inventory omits paid-tier promises.** The page, README, and
   Terms make concrete claims about the two-routine free limit, the US$14
   one-time purchase, unlimited routines, the training summary, and license
   revocation. `.factory/claims.json` has no corresponding ID, and `rg` finds
   no `@claim:` tag for any paid behavior. The acceptance contract explicitly
   says an unlisted claim fails review.

2. **Nested demo routes load broken relative head resources and log an error.**
   Fresh loads of `/demo/workout`, `/demo/routines`, and `/demo/more` request
   `/demo/art/ledger-stamp-640.d21a9309.avif`, which returns HTTP 404 and emits
   `Failed to load resource: the server responded with a status of 404`.
   `/opt/fleet/lib/verify-url.sh` passes `/` but fails `/demo/routines` for this
   console error. On `/demo/routines`, the document also resolves:

   - manifest → `/demo/manifest.webmanifest` (404)
   - apple-touch icon → `/demo/icons/apple-touch-180.3ad419c3.png` (404)
   - image preload → `/demo/art/ledger-stamp-640.d21a9309.avif` (404)

   The generated nested documents contain Vite-rewritten `./...` links copied
   from `dist/index.html`; they need root-absolute URLs or a correct base.
   The app body still renders because JavaScript and CSS are inline, but the
   required zero-console-error gate and nested-route PWA metadata fail.

### Medium

3. **Heading levels skip from `h1` to `h3`.** Full live axe scans report the
   moderate `heading-order` rule on `/routines`, `/ledger`, `/more`,
   `/demo/routines`, and `/demo/more`. The checked-in accessibility tests filter
   out everything below serious impact, so they do not catch this baseline
   requirement.

4. **Several mobile links are only 21 px high.** At a 390 px viewport, the
   in-content Privacy and Terms links on More measure 65.2×21 and 53.0×21 CSS
   px. The privacy and terms contact email links measure 182.0×21 and 185.0×21.
   This misses the supplied 44 px touch-target baseline. Primary actions,
   navigation, the brand, and app footer legal links meet the target.

5. **The mandatory landing skeleton is incomplete.** The root has the header,
   first screen, product action, and footer, but no “How it works” sequence, no
   plain non-goals/privacy section, and no paid-tier section with price. Those
   facts exist only after navigating to Data & backup, contrary to the supplied
   site-structure contract.

### Low

6. **Plain-words cleanup is incomplete.** “Keep the whole rack” and “Fresh ink
   is ready” are metaphor headings where the contract requires direct labels.
   `.factory/copy-audit.md` also says it contains every landing sentence but
   omits the visible “Stamped in, not synced away” caption and footer sentence.

## Full local verification

| Check | Result |
| --- | --- |
| Candidate | Exact SHA `e395ff84aa85c7b4f38c688cbe70f4616d5a9dc0`; unrelated pre-existing `graphify-out` changes left untouched |
| Install | `npm ci` PASS; 148 packages; 0 vulnerabilities |
| Unit/policy | `npm test` PASS, 9/9 Vitest tests |
| Types | `npm run typecheck` PASS |
| Lint | `npm run lint` PASS |
| Production build | `npm run build` PASS; `dist/` produced |
| Complete browser suite | `npm run test:e2e` PASS, 39 passed / 1 intentional desktop skip |
| Accessibility script | `npm run test:a11y` PASS, 8/8 configured checks |
| SW update regression | `npx playwright test tests/pwa-update.spec.ts` PASS, 2/2 projects |

The one skipped e2e case is the intended desktop half of a mobile-only target
measurement, not an unexecuted product flow.

## Independent end-to-end evidence

The live demo was exercised from a fresh browser context:

- Values `2000.5 kg` and `1001 reps` were rejected and wrote no set. A valid
  `82.5 kg × 5` set confirmed only after the device write and survived reload.
- Correcting a set to `85 kg × 4` added a row while retaining and labelling the
  earlier row.
- CSV export had the documented 14-column header and one row per set event.
  A same-ID changed row imported as a separately renamed event. A malformed CSV
  recovered with `Missing required column: event_id.`
- JSON export contained the expected format, one routine, and eight events.
  Invalid JSON recovered with a specific error. Restoring the older backup
  after renaming the routine preserved the newer local name and reported one
  existing routine kept.
- Reset demo restored exactly three sample rows. Start for real cleared the
  demo and opened a real ledger with no sample routine.
- The exercised normal/demo flow made only same-origin requests. It set no
  cookies and no localStorage keys. Its IndexedDB databases were
  `durable-set-log` and the separate `durable-set-log:demo` namespace.
- Pasting an invalid license made exactly one explicit request to the approved
  Sociobot verification endpoint and recovered with “That license could not be
  verified.” The checkout endpoint returned 303 to hosted Dodo checkout; no
  payment provider is embedded in the app.
- Internal link crawling returned 200 for every app, demo, legal, and recovery
  link. The buy link returned its expected 303; `mailto:` links were excluded.

## Privacy, headers, and request allowance

- Normal and demo workout flows sent workout data nowhere. No analytics,
  third-party font, CDN, or tracker request appeared. The only external runtime
  request occurred after the explicit invalid-license action and went to
  `api.sociobot.in`.
- The root response includes HSTS, CSP, Permissions-Policy, Referrer-Policy,
  `X-Content-Type-Options`, and frame protection in the CSP response header.
- From one client, license verification requests 1–30 returned 200. Requests
  31–36 returned 429 with `Retry-After`; the first observed value was 3 seconds.
  Observed allowance: **30 requests per window**.
- The app has no account or sign-in. The Entra requirement is not applicable.

## PWA, offline, update, and deployment identity

- The checked-in durability test retained one confirmed set through 100 offline
  reloads in each browser project. An additional fresh live 390 px context
  reloaded `/demo` offline 10/10 times with all three sample rows visible and
  the “Offline · still saving” status.
- The live context was controlled by `/sw.js`, used
  `durable-set-log-shell-v6`, and created only the demo IndexedDB database.
- The isolated update regression replaced a seeded v5 cache with v6 in desktop
  and mobile while retaining the `Update survivor` routine in IndexedDB.
- Manifest fields and 192, 512, and 512-maskable icon dimensions are correct at
  the root. Nested demo manifest resolution fails as described in blocker 2.
- Unknown routes return the designed document with HTTP 404. Root, concrete
  app/demo routes, privacy, terms, manifest, worker, art, robots, and sitemap
  otherwise return their expected statuses.

Live/candidate SHA-256 identity matches exactly:

| Artifact | SHA-256 |
| --- | --- |
| `dist/index.html` and live `/` | `ff6862bb8cc574eedc0f9f8937f2cf85acd57a2862c994e5b270f2807bf743ce` |
| `dist/demo/index.html` and live `/demo` | `d18383f5995a4003d362963e8a72c779a88333d5e701d72bd70f14c3f184c7dc` |
| `dist/sw.js` and live `/sw.js` | `8e94a1b06177f9619710a09024d36d03cd9e55977478aaaf98dcf724d9be0305` |
| `dist/manifest.webmanifest` and live manifest | `480147748b7f199a47edb4e8fc60f72c6aa47d6502c1aa5e318b7f6dd769e5a9` |

## Accessibility and responsive evidence

- Live axe found zero serious or critical violations on root, demo, privacy,
  terms, and 404. Full-severity scans found the moderate heading defects above.
- Keyboard-only smoke passed: skip link is first, activates main focus, and has
  a visible 4 px solid coral outline. The native modal keeps focus away from
  outside interactive controls, Escape closes it, and focus returns to the
  trigger.
- At 390 px, `clientWidth == scrollWidth == 390`; no horizontal overflow was
  present. Root content remained readable and all primary controls were usable.
  The viewport permits zoom. Reduced-motion emulation reduced transitions to
  `0.00001s`.
- Root has `lang=en`, a descriptive title, one `h1`, one main landmark, useful
  image alt text, and named buttons. Focus/body/action contrast passes axe;
  the visual thesis intentionally documents one light paper mode.

## Performance and caching

- Fresh live mobile Lighthouse: Performance **95**, Accessibility **100**, Best
  Practices **100**, SEO **100**; FCP 1.0 s, LCP 1.4 s, TBT 250 ms, CLS 0,
  total transfer 145 KiB.
- Production document: 58,626 B raw / 17,582 B gzip.
- Inline initial JavaScript: 40,109 B raw / 12,854 B gzip (budget 200 KB).
- Inline CSS: 16,166 B raw / 4,313 B gzip (budget 50 KB).
- Mobile hero AVIF: 34,400 B (budget 300 KB). No font payload.
- Fingerprinted art returns `image/avif` and one-year immutable caching. The
  service worker returns `no-cache, max-age=0`; HTML revalidates after 30 s.

This is a static PWA, not a package, CLI, or backend. Consumer installation,
backend concurrency, persistence boundaries, and health/build endpoints are not
applicable. AI adds no obvious value to this narrow offline capture job.

## Required remediation

1. Add claims and exact demo-sandbox tests for the free limit, paid unlock,
   summary, price/checkout behavior, and invalid/revoked license behavior; or
   remove those promises.
2. Keep root-absolute manifest, icon, and preload URLs in every generated nested
   route. Add a deployed-route test that fails on any subresource 4xx or console
   error and asserts the resolved manifest URL returns 200.
3. Change section/empty-state headings to preserve `h1 → h2` order and run axe
   without discarding moderate heading findings.
4. Raise every mobile interactive target to 44 px, including in-content and
   legal contact links.
5. Add the required landing sections and replace metaphor labels with direct
   task language; regenerate the complete copy audit.
