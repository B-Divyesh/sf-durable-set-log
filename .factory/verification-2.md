# Independent verification 2 — FAIL

Verified candidate: `cda721589aaae840c6fa8d866f9a3a0daf9608e4` (`cda7215`)

Verified URL: <https://durable-set-log.sociobot.in>

Date: 2026-08-29

Work order: `durable-set-log-verify-2`

## Release decision

**FAIL — do not release this candidate.** All five declared claim tests pass,
the cold first screen passes, and the deployed files exactly match the candidate
build. However, the required claims inventory omits published recovery and
correction claims. One omitted claim is false in the shipped product: restoring
an older JSON backup silently overwrites a newer local routine, despite the UI
saying records are never overwritten. This is a release-blocking claims-contract
failure and a high-severity local data-loss defect.

## Mandatory gates

### Claims run first from a clean candidate checkout

A detached, initially clean worktree at the exact candidate was installed with
`npm ci --include=dev` (67 packages; audit reported 0 vulnerabilities). Every
exact command in `.factory/claims.json` then passed against `/demo`:

| Claim | Exact command | Result |
| --- | --- | --- |
| `offline-reload` | `npm run test:claims -- --grep @claim:offline-reload` | PASS, 2/2 projects |
| `confirmed-device-write` | `npm run test:claims -- --grep @claim:confirmed-device-write` | PASS, 2/2 projects |
| `csv-export` | `npm run test:claims -- --grep @claim:csv-export` | PASS, 2/2 projects |
| `local-privacy` | `npm run test:claims -- --grep @claim:local-privacy` | PASS, 2/2 projects |
| `demo-isolated` | `npm run test:claims -- --grep @claim:demo-isolated` | PASS, 2/2 projects |

The manifest is nevertheless incomplete. Published claims with no entry and no
exact `@claim:<id>` test include:

- “Corrections are new rows; earlier values remain inspectable.”
- “A JSON backup also includes reusable routines.”
- “Imports merge by conflict-free event ID. Existing records are never overwritten.”
- README claims for full JSON backup/restore, atomic active-workout writes, and
  collision-safe CSV imports.

The claims contract says an unlisted claim fails review. The third claim above
also fails observably; see defect 2.

### Cold first-read test

PASS at both 1440×900 and 390×844. A fresh live context showed:

- what: **“Log every strength set, even offline.”**
- for whom: **“For strength trainees who need each completed set to survive a
  reload or lost signal.”**
- first action: **“Try it with sample data”**, with an adjacent explanation that
  the sample uses a separate ledger.

The action opens `/demo` in one click. The sample ledger is already populated,
and its persistent banner provides **Reset demo** and **Start for real**.

## Defects

### Blocker

1. **The required claims inventory is incomplete.** The recovery, correction,
   and import claims listed above are published in the product/README but absent
   from `.factory/claims.json`. Per the acceptance contract, an unlisted claim
   fails review even when unrelated declared claims pass.

### High

2. **JSON restore silently overwrites a newer local routine and contradicts the
   on-page promise.** In a fresh live context I created `Backup original`,
   exported JSON, renamed the same routine to `Local newer edit`, then restored
   the older file. The app reported `Restore complete: 1 routine and 0 new
   events merged`, but the visible card and IndexedDB record reverted to
   `Backup original`. The restore loop uses `put` for routines. This loses a
   user's newer reusable-plan edits and contradicts “Existing records are never
   overwritten.”

### Medium

3. **Active-workout inputs save values their own controls mark invalid.** The
   weight field reports `Value must be less than or equal to 2000` and the reps
   field reports `Value must be less than or equal to 1000`, yet clicking
   **Complete set** saved `2000.5 kg × 1001`; the values survived reload. The
   non-form action does not enforce the controls' max/step validity. Negative
   weight and fractional reps are correctly rejected.

4. **Three mobile touch targets are below the required 44 px height.** At 390 px,
   the brand link measured 194.2×36 px; footer Privacy measured 47.1×15 px and
   Terms 38.3×15 px. Other measured controls met the baseline.

5. **In-app views do not participate in browser history or deep linking.**
   Workout, Routines, Ledger, and More all retain `/`. After navigating through
   those views, browser Back went to `about:blank` instead of restoring the
   previous view. Titles and heading focus do update correctly.

6. **Required route/share metadata is incomplete.** There is no `og:image` or
   `twitter:image`; `/demo` retains the root canonical URL; privacy and terms do
   not declare canonicals/Open Graph/Twitter metadata; and `sitemap.xml` omits
   `/demo`.

### Low

7. **Static asset HTTP caching and AVIF MIME are not production-grade.** Every
   response, including images and icons, uses `Cache-Control: public,
   must-revalidate, max-age=30`; no fingerprinted asset gets long-lived immutable
   caching. `/art/ledger-stamp-640.avif` is served as
   `application/octet-stream`. It still rendered in Chromium, and the service
   worker caches it after first use.

## Full local verification

| Check | Result |
| --- | --- |
| Candidate identity | clean detached worktree at `cda721589aaae840c6fa8d866f9a3a0daf9608e4` |
| `npm test` | PASS, 7/7 Vitest tests |
| `npm run build` | PASS; TypeScript strict check and exact Vite production build; `dist/` produced |
| `npm run test:e2e` | PASS, 18/18 desktop/mobile Chromium tests, including 100 offline reloads in each project |
| `npm run test:a11y` | PASS, 4/4 |
| Lint | no lint script/configuration exists |

This is a PWA, not a library/CLI/backend. Consumer-package, backend concurrency,
health identity, persistence-boundary, and sign-in/Entra checks are not
applicable. No sign-in exists. AI assistance would add no obvious value to this
narrow offline capture job; no missed-leverage finding was raised.

## Independent live workflow evidence

- Normal recovery flow: invalid routine `sets=0` was blocked with the browser's
  bound validation message. Invalid negative set/correction values were blocked.
  A valid `82.5 kg × 5` set survived reload.
- Correction flow appended `85 kg × 4` while retaining and labelling the original
  `82.5 kg × 5` row as corrected.
- CSV export contained the 14-column documented header and both set events.
  Malformed CSV recovered with `Missing required column: event_id.`
- CSV import added a new event, skipped an exact duplicate, then safely renamed a
  differing same-ID event and retained both rows.
- JSON backup exported the expected format, one routine, and four events. The
  restore collision defect is documented above.
- Demo mutation increased the sample ledger from three to four rows; **Reset
  demo** returned it to three and removed the mutation. **Start for real** left
  both the demo and real routine stores empty in that fresh context.
- Free-tier enforcement correctly disabled a third routine and explained the
  two-routine limit. An invalid pasted license stayed locked and made exactly
  the expected explicit request to `api.sociobot.in`.
- No console or page errors occurred in exercised app flows.

## Privacy, network, and billing endpoint

- A complete normal and demo workout flow made only same-origin requests. A
  fresh demo context had no cookies or localStorage keys and created only the
  `durable-set-log:demo` IndexedDB database.
- Root responses include CSP, Permissions-Policy, HSTS, Referrer-Policy, and
  `X-Content-Type-Options`. CSP limits connections to self and the documented
  Sociobot API.
- License verification rate limiting was tested sequentially from one client:
  requests 1–30 returned `200`; request 31 returned `429` with
  `Retry-After: 4`. Observed allowance: **30 requests per window**.
- The product buy URL returned `303` to the hosted Dodo checkout through the
  Sociobot endpoint. No provider is embedded in the product.

## PWA, deployment identity, and routes

- Local/live SHA-256 matched exactly:
  - `dist/index.html` and live `/`:
    `fc4e47c6b810825dff690c1a4dd1c9c36b4e83966a004c469179cd625837f47d`
  - `dist/demo/index.html` and live `/demo`: the same hash
  - `dist/sw.js` and live `/sw.js`:
    `8316c24246de087673df8ff306dec4331b5033ab42098e66703ce0e4049b311b`
- Live offline demo reload passed 10/10 with the sample visible and the
  `Offline · still saving` state. The local suite passed the stricter 100-reload
  test in both projects.
- A controlled v5→v6 service-worker update produced the in-app update toast,
  installed a waiting worker, activated v6 on command, removed the v5 cache,
  reloaded, and retained the `Update survivor` IndexedDB routine. No errors.
- `/`, `/demo`, `/privacy/`, `/terms/`, manifest, worker, art, robots, and sitemap
  returned 200. An unknown route returned the designed document with HTTP 404.
  Manifest MIME is `application/manifest+json`.

## Accessibility and responsive evidence

- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, title, `lang=en`, one h1,
  main landmark, zero missing image alts, zero unnamed buttons, and zero root
  console errors; measured load was 561 ms.
- Live Playwright axe scans found zero serious/critical findings on root, demo,
  privacy, terms, and the 404 document.
- Keyboard-only smoke: skip link was first, had a 4 px visible coral outline,
  moved focus to main, dialog initial focus landed on Routine name, Tab remained
  trapped in the modal, and Escape closed it and restored trigger focus.
- At 390 px, `scrollWidth == clientWidth == 390`. Reduced motion changed control
  transitions to `0.00001s`. The viewport does not disable zoom.
- Focus contrast is 3.47:1 on paper; body/muted text and primary action contrast
  exceed 4.5:1. The visual thesis is intentionally single-mode.
- The sub-44 px touch targets remain a baseline failure as listed above.

## Performance and budgets

- Production document: 54,460 B raw / 16,540 B gzip.
- Inline initial JavaScript: 37,001 B raw / 11,926 B gzip (budget 200 KB).
- Inline CSS: 15,937 B raw / 4,276 B gzip (budget 50 KB).
- Mobile AVIF hero: 34,400 B (budget 300 KB). No font payload.
- Three fresh live mobile Lighthouse runs scored Performance **89/99/100**
  (median 99), Accessibility **100**, Best Practices **100**, SEO **100**. LCP
  was 1.35–1.36 s and CLS 0. TBT varied 450/106/0 ms. Budgets pass on median,
  though Lighthouse flagged image sizing/delivery and the HTTP caching issue is
  listed above.

## Required remediation

1. Make JSON routine restore conflict-free: preserve the local routine on ID
   collision, rename the imported routine, or require an explicit per-record
   choice. Never silently replace newer local data.
2. Add every published correction/import/backup claim to `claims.json`, each
   with one exact demo-sandbox `@claim:` test. The restore claim must prove the
   non-overwrite behavior after it is fixed.
3. Enforce `checkValidity()` or the same max/step constraints before active set
   writes.
4. Raise all mobile targets to at least 44×44 CSS px; implement History API/deep
   links for app views; complete per-route canonical/share metadata and sitemap.
5. Fingerprint static assets, serve long immutable cache headers and correct
   AVIF MIME, then rerun Lighthouse and the full verification matrix.
