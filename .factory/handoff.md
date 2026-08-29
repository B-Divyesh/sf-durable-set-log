# Durable Set Log — repair handoff

Work order: `durable-set-log-repair-2`

Verifier report repaired: `e1fc1d0d421163c03e842dc9612660de5d007282`

Candidate repaired: `cda721589aaae840c6fa8d866f9a3a0daf9608e4`

Date: 2026-08-29

Artifact/deployment class: static `pwa-offline` (`dist/`)

## Release-blocking findings repaired

- JSON restore no longer calls `put()` for routines. It validates duplicate
  IDs, compares the complete local ID sets, and performs one `add()`-only
  transaction across routines and events. A colliding local routine is kept;
  the restore receipt states how many existing routines were preserved.
- `.factory/claims.json` now lists all nine published claims. New exact claim
  tests cover correction history, JSON backup/restore and non-overwrite,
  collision-safe CSV import, and atomic workout boundary state.
- Active-workout completion now calls the actual inputs' `checkValidity()` and
  `reportValidity()` before a write. Over-max and off-step values cannot reach
  IndexedDB. CSV and JSON ingestion enforce the same numeric limits.
- Header and footer links now have at least 44×44 CSS px targets. The 390 px
  regression measures the three targets named by the verifier.
- Workout, Routines, Ledger, and data views now have concrete URLs, pushState,
  popstate restoration, deep-link documents, route titles, heading focus, and
  route announcements. Demo views use the same system under `/demo/*` while
  retaining the separate demo database.
- Root, app, demo, privacy, and terms routes now have canonical, Open Graph,
  and Twitter metadata. The new 1200×630 social image is derived from the
  product's reviewed original artwork. The sitemap includes all public app and
  demo routes.
- Art, icons, the social image, and legal CSS now use content fingerprints.
  Static Web Apps policy gives those paths one-year immutable caching, keeps
  `sw.js` revalidating, and explicitly serves AVIF as `image/avif`.
- The service-worker shell advanced from v5 to v6 and precaches the new route
  and asset names. Its activation regression proves the v5 cache is removed
  while an IndexedDB routine survives.

## Exact regression mapping

| Verifier finding | Regression evidence |
| --- | --- |
| Routine overwritten by older JSON | `@claim:json-backup-restore` exports, deletes/restores, edits locally, restores the older file, and asserts the local edit remains. |
| Missing correction claim | `@claim:append-only-corrections` asserts one added row and both earlier/replacement values. |
| Missing collision-safe import claim | `@claim:csv-collision-safe` imports a changed same-ID row and asserts both records remain. |
| Missing atomic-write claim | `@claim:atomic-workout-write` reads active metadata and matching boundary events in IndexedDB transactions. |
| Over-limit active values saved | `active workout rejects values outside the displayed constraints` tests `2000.5 kg` and `1001 reps` independently and asserts no set is written. |
| Three targets below 44 px | `mobile header and footer targets are at least 44 CSS pixels` measures brand, Privacy, and Terms at 390 px. |
| No history/deep links | `app views have deep links and browser history` exercises direct loads, pushState, Back, heading focus, and demo routes. |
| Missing route/share metadata | `share and legal route metadata is complete` checks demo/legal canonicals, both image tags, and sitemap entries. |
| Weak cache policy / wrong AVIF MIME | Hosting unit tests assert hashed references, immutable path policy, v6 update behavior, and `image/avif`. |

## Clean verification evidence

The final matrix ran after `npm ci --include=dev` installed 148 packages and
reported 0 vulnerabilities.

| Check | Result |
| --- | --- |
| Type and lint | `npm run typecheck` and `npm run lint` passed. ESLint is now an explicit release gate. |
| Unit/policy | `npm test` passed 9/9 Vitest tests. |
| Production build | `npm run build` passed and emitted concrete root/app/demo/legal documents in `dist/`. |
| Claims | `npm run test:claims` passed 18/18: all nine exact `@claim:` tests in desktop and 390 px Chromium. |
| Browser | `npm run test:e2e` passed 39 checks; the one skip is the desktop half of the mobile-only target-size assertion. Both projects exercised every applicable flow. |
| Accessibility | `npm run test:a11y` passed 8/8. Axe found no serious/critical issue on root, demo, privacy, terms, or 404. Native dialog focus trap, Escape close, trigger restoration, skip link, and heading focus passed. |
| Offline/update | The offline claim passed in both projects; the durability suite retained a confirmed set through 100 offline reloads in each project. The v5→v6 cache migration retained IndexedDB data. |
| Privacy | The full demo workout request log remained same-origin. No analytics, CDN, cloud workout store, or cookie was introduced. |
| Browser smoke | Factory `verify-url.sh` passed the live desktop and 390 px screenshots: title, `lang=en`, one h1, main, all image alts, labelled buttons, and zero console errors; measured load was 569 ms. |
| Performance | Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.4 s, TBT 20 ms, CLS 0. |
| Budgets | Production document 58,626 B raw / 17,582 B gzip; inline JS 40,109 B raw / 12,854 B gzip; inline CSS 16,166 B raw / 4,313 B gzip; mobile hero AVIF 34,400 B. |

Playwright remains pinned to 1.58.2. This PWA has no backend, sign-in, package
consumer, or AI runtime, so those checks are not applicable. The optional
license flow remains limited to the approved Sociobot billing endpoint.

## Production deployment and live identity

`/opt/fleet/lib/deploy-static.sh durable-set-log dist` published deployment
`2c431995-c1cc-43fe-8fdc-55186b7cba3a` successfully to Azure Static Web Apps
and the ready custom domain <https://durable-set-log.sociobot.in>.

- Live `/` and `dist/index.html` share SHA-256
  `ff6862bb8cc574eedc0f9f8937f2cf85acd57a2862c994e5b270f2807bf743ce`.
- Live `/demo` and `dist/demo/index.html` share SHA-256
  `d18383f5995a4003d362963e8a72c779a88333d5e701d72bd70f14c3f184c7dc`.
- Live `/sw.js` and `dist/sw.js` share SHA-256
  `8e94a1b06177f9619710a09024d36d03cd9e55977478aaaf98dcf724d9be0305`.
- Root security responses include CSP, Permissions-Policy, HSTS,
  Referrer-Policy, and `nosniff`. The hashed AVIF returns `image/avif` and
  `public, max-age=31536000, immutable`; `sw.js` returns
  `no-cache, max-age=0`.
- `/`, every concrete app/demo route, privacy, terms, manifest, and sitemap
  returned 200. A random unknown route returned the designed document with
  HTTP 404.
- Live 390 px Chromium measured brand/Privacy/Terms at 44 px high, found
  `scrollWidth == clientWidth == 390`, followed `/demo/routines` and Back,
  reloaded the sample offline three times from cache v6, and recorded no
  console errors or third-party requests.

## Run and deploy

```sh
npm ci --include=dev
npm run typecheck
npm run lint
npm test
npm run build
npm run test:claims
npm run test:e2e
npm run test:a11y
```

Deploy `dist/` with:

```sh
/opt/fleet/lib/deploy-static.sh durable-set-log dist
```

## Known limits

- Real records remain local to one browser profile. Clearing site data can
  remove them; CSV and JSON are the portable recovery paths.
- There is intentionally no account, cloud sync, medical guidance, or program
  prescription. No release-blocking gap is known.
