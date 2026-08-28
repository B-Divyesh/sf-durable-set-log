# Durable Set Log — build handoff

Work order: `durable-set-log-build-1`<br>
Completed: 2026-08-28<br>
Deploy type: static, `npm run build` → `dist/`

## What shipped

- Installable vanilla TypeScript PWA with a hand-written, versioned service
  worker. The complete shell (including stable JS/CSS entry names, responsive
  artwork, icons, manifest, and offline fallback) is precached with cache reload
  semantics; an in-app toast activates waiting updates.
- Reusable routines with multiple exercises, default sets/load/reps, editing,
  confirmed deletion, a two-routine free tier, and an unlimited paid tier.
- A persisted active workout with large, thumb-friendly controls. Starting and
  finishing a session atomically commit the event and active-session marker.
- Append-only IndexedDB set events. The UI confirms only after `IDBObjectStore.add`
  succeeds. Corrections add a later event and mark—not hide—the original.
- CSV export/import for the set ledger, including quoted fields, validation,
  duplicate detection, and safe renaming of foreign ID collisions. JSON backup
  and validated merge restore include both routines and the full event stream.
- One-time US$14 Sociobot unlock: hosted buy link, returned-license capture,
  daily cached verification, optimistic offline access from a valid cache, and
  pasted-token purchase restore. Core capture, corrections, exports, and safety
  are never gated.
- Original risograph hero, responsive AVIF/WebP derivatives, original app icons,
  provenance sidecars, a product-specific design thesis, privacy/terms pages,
  robots/sitemap, README, and MIT license.

## Verification performed

All commands ran from `/work/repo` against the final implementation:

| Check | Result |
| --- | --- |
| `npm test` | 4/4 unit tests passed |
| `npm run build` | passed; `dist/index.html` present |
| `npm run test:e2e` | 4/4 Chromium mobile tests passed |
| Offline durability | the same confirmed 82.5 kg × 5 set reappeared after each of 100 consecutive offline reloads |
| Accessibility | axe found 0 serious/critical violations; one `<h1>`, `lang`, main landmark, keyboard dialog flow, designed focus states |
| Console | no console errors during create/start/save/reload/offline loop |
| Dependency audit | `npm audit`: 0 vulnerabilities |

Final Lighthouse 12.8.2 mobile-class run on the production build:

| Category/metric | Result |
| --- | --- |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| First Contentful Paint | 0.9 s |
| Largest Contentful Paint | 1.9 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0 |
| Time to Interactive | 1.9 s |

Bundle/image budgets: 34.27 KB uncompressed JS (11.28 KB gzip), 14.86 KB
uncompressed CSS (4.04 KB gzip), 34 KB 640px AVIF / 62 KB WebP, and 88 KB
960px AVIF / 152 KB WebP. There are no downloaded fonts or runtime CDNs.

## Deploy and operate

1. Run `npm ci`.
2. Run `npm run build`.
3. Publish the contents of `dist/` at the site root. Preserve clean directory
   URLs so `/privacy/` and `/terms/` resolve to their included `index.html`.
4. The factory must register the `durable-set-log` billing product and its
   return URL before purchase verification can succeed. No numeric product ID
   or payment-provider credential belongs in this repository.

## Known limits / next steps

- Records are deliberately device-local. Clearing browser/site data or severe
  storage eviction can remove them; users are told to make JSON backups.
- Weight entry is kilograms in v1. A future release can add per-set kg/lb units
  with an explicit migration rather than reinterpret existing values.
- There is no cloud account, cross-device sync, social feed, program guidance,
  or health-platform integration; these are intentional brief non-goals.
- Browser storage eviction cannot be forced reliably in CI. The tested failure
  boundary is offline operation plus 100 reloads after a confirmed write.
