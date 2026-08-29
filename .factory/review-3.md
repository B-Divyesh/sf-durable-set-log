# Adversarial first-read review 3 — Durable Set Log

**Date:** 2026-08-29  
**URL:** <https://durable-set-log.sociobot.in>  
**Candidate:** `210660273bd146c4302f85f150caf6ac85aed0e6`  
**Verdict:** **PASS**

No finding remains. This review repeated all requested checks with fresh live
browser contexts and a fresh clone.

## Cold first read

Fresh 390 × 844 and 1440 × 900 contexts opened `/` without storage. Before
scrolling, the product is clear:

- **Does:** records completed strength-training sets and retains them through a
  reload or lost signal.
- **For:** strength trainees logging a workout on a phone.
- **First action:** **Try it with sample data**; its adjacent text says it
  opens a separate ledger that is never saved with the visitor's data.

The exact h1 is “Log every strength set, even offline.” The audience sentence
is “For strength trainees who need each completed set to survive a reload or
lost signal.” The first-read gate passes. The mobile document width was 390 px,
with no horizontal overflow or console/page error. The original risograph
hand-and-ledger art, warm paper palette, stamped controls, and ink-offset
shadows follow `.factory/design.md` and are distinct from a generic SaaS
template.

## Copy audit

Counts are whitespace-separated. Navigation labels are not sentences; headings
and action labels are included because they are meaningful in a screen-reader
outline. Every unit below is at or under 22 words. No banned marketing word,
jargon flag, uninformative metaphor, inconsistent term, or non-result-naming
button was found.

### Landing page

| Copy unit | Words | Check |
| --- | ---: | --- |
| Saved on this device | 4 | Pass |
| Log every strength set, even offline. | 6 | Pass |
| For strength trainees who need each completed set to survive a reload or lost signal. | 14 | Pass |
| Try it with sample data | 5 | Pass; action |
| Make your first routine | 4 | Pass; action |
| The sample opens a separate ledger and is never saved with your data. | 13 | `demo-isolated` |
| A completed set saved in a local ledger. | 8 | Alt text; pass |
| Saves each set before confirming it | 7 | `confirmed-device-write` |
| Works offline after first visit | 5 | `offline-reload` |
| Export CSV any time | 4 | `csv-export` |
| How it works | 3 | Pass |
| Make a routine. | 3 | Pass |
| Add the exercises and defaults you repeat. | 7 | Pass |
| Complete each set. | 3 | Pass |
| The app confirms only after it saves the set. | 9 | `confirmed-device-write` |
| Export your history. | 3 | Pass |
| Export a spreadsheet or complete backup before clearing browser data. | 10 | Pass |
| Privacy and limits | 3 | Pass |
| Workout records stay in this browser unless you export them. | 10 | `local-privacy` |
| There is no account or cloud sync. | 7 | `no-account-or-sync` |
| This app records training. | 4 | Pass |
| It does not provide medical guidance. | 7 | `not-medical-guidance` |
| One-time unlock | 2 | Pass |
| Free includes two routines, set logging, corrections, and exports. | 9 | `free-routine-limit` |
| Pay US$14 once for unlimited routines and an on-device training summary. | 12 | `paid-summary-unlock` |
| See the US$14 license | 4 | Pass; action |
| Durable Set Log keeps strength sets on this device. | 9 | `local-privacy` |

### README

| Sentence or copy unit | Words | Check |
| --- | ---: | --- |
| Log strength sets on your phone, even without signal. | 9 | Pass |
| Confirmed sets remain after reloads. | 5 | `offline-reload` |
| Create repeatable routines, save sets with one tap, correct entries without deleting them, and import or export backups. | 17 | Covered functionality |
| There is no account or cloud sync. | 7 | `no-account-or-sync` |
| Live product: URL | 3 | Label/link |
| Try the isolated sample at URL. | 6 | Action/link |
| The sample uses separate browser storage. | 6 | `demo-isolated` |
| It never mixes with your real records. | 7 | `demo-isolated` |
| Your workout records are saved in this browser. | 8 | `local-privacy` |
| The app confirms a set only after it saves it. | 10 | `confirmed-device-write` |
| Correcting a set keeps the earlier value visible. | 8 | `append-only-corrections` |
| Starting or finishing a workout saves its status and history together. | 11 | `atomic-workout-write` |
| Importing a file keeps your existing records when entries conflict. | 10 | Recovery/import claims |
| After your first visit, the app can open without a signal. | 11 | `offline-reload` |
| Browser storage can still be cleared, so export a backup you need to keep. | 14 | Useful limitation |
| Free includes two routines, set logging, corrections, and exports. | 9 | `free-routine-limit` |
| Pay US$14 once for unlimited routines and an on-device training summary. | 12 | `paid-summary-unlock` |
| Sociobot handles checkout and license checks. | 6 | `sociobot-payment-handling` |
| The app does not embed a payment provider. | 8 | `no-embedded-payment-provider` |
| Use a current Node.js release and npm. | 7 | Contributor instruction |
| The build command is `npm run build`. | 7 | Contributor instruction |
| Static files appear in `dist/`, with `dist/index.html` at its root. | 9 | Contributor instruction |
| Playwright 1.58.2 is pinned. | 4 | Contributor instruction |
| Use the factory browser directory or run `npx playwright install chromium` when needed. | 12 | Contributor instruction |
| Deploy `dist/` through the factory static-site work order. | 8 | Contributor instruction |
| The deployment configuration sets security headers, caching, and the 404 page. | 11 | Contributor instruction |
| `npm test` checks data handling and hosting rules. | 8 | Contributor instruction |
| `npm run test:e2e` checks the workout flow, keyboard use, mobile controls, recovery, and offline reloads. | 15 | Contributor instruction |
| `npm run test:claims` checks each published promise with the sample workout. | 10 | Contributor instruction |
| The claim list is in `.factory/claims.json`. | 6 | Contributor instruction |
| The app loads no ads, tracking tools, third-party fonts, or cloud workout storage while you log. | 16 | `local-privacy` |
| Read the Privacy notice and Terms. | 6 | Action/link |
| Durable Set Log records training. | 5 | Pass |
| It does not provide medical guidance. | 7 | `not-medical-guidance` |
| MIT. | 1 | License label |
| See LICENSE. | 2 | Action/link |

Terminology is consistent: **routine** (repeatable plan), **set** (completed
attempt), **ledger** (saved history), **demo** (isolated try-out), and
**workout records** (browser-resident data).

## Demo, sandbox, and privacy

The sample action opens `/demo` in one click. Its initial screen already shows
the Tuesday strength ledger with three realistic Back squat/Bench press entries,
loads, reps, timestamps, and correction controls. The persistent banner is
“Demo — sample data, nothing is saved”, with **Reset demo** and **Start for
real**. Reset restored the three-row sample; Start for real returned to `/`.

`.factory/demo.md` identifies the separate `durable-set-log:demo` IndexedDB
database and real `durable-set-log` database. The `demo-isolated` test creates a
demo routine and proves it is absent in real mode. Live request logs for normal
and demo workouts contained only the product origin and self-hosted art; no
analytics, third-party font, tracker, or CDN request occurred. After the
service worker took control of `/demo`, a live offline reload retained the
banner and Back squat sample row without an error.

## Claims and local verification

From a fresh clone after `npm ci`, I invoked every `claims.json` command
individually. The full claim suite also completed all 34 configured
desktop/mobile executions. All 17 passed:

`offline-reload`, `confirmed-device-write`, `csv-export`, `local-privacy`,
`no-account-or-sync`, `not-medical-guidance`, `demo-isolated`,
`append-only-corrections`, `json-backup-restore`, `csv-collision-safe`,
`atomic-workout-write`, `free-routine-limit`, `paid-summary-unlock`,
`purchase-price-checkout`, `sociobot-payment-handling`,
`no-embedded-payment-provider`, and `license-revocation`.

The fresh clone also passed `npm test` (16 tests), `npm run typecheck`,
`npm run lint`, `npm run build` (60.92 kB raw / 18.02 kB gzip), and
`npm run test:a11y` (8 tests). Every claim-like landing/README sentence maps to
an applicable manifest entry; no unlisted claim remains.

## Structure, routes, and links

Cold checks covered `/`, `/demo`, `/routines`, `/ledger`, `/more`,
`/demo/routines`, `/demo/more`, `/privacy/`, `/terms/`, and `/404.html`. Every
expected route returned 200 with `lang=en`, one h1, `main`, its own title,
description, canonical, OG/Twitter image metadata, favicon, shared skeleton,
and no console/page error. Unknown paths return a designed HTTP 404 with the
fixed `/404.html` canonical, the direct h1 “Page not found.”, and recovery
links.

All crawled internal links return 200; `mailto:` links are explicit, and the
purchase handoff returns the documented Sociobot 303. `/demo` →
`/demo/routines` changes address/title and focuses the Routines h1; Back
restores `/demo`, `Demo — Durable Set Log`, and Set ledger focus. The live
headers include CSP with response-header `frame-ancestors 'none'`,
Permissions-Policy, referrer policy, and `nosniff`; robots, sitemap, manifest,
hashed immutable art, and Static Web Apps 404 configuration are present.

## Earlier-finding recheck

I read every earlier `review-*`, `polish-*`, `verification*`, and handoff.
Each finding was rechecked live and in code. All are fixed, with no regression:

| Earlier IDs | Current confirmation |
| --- | --- |
| V1-1, V1-5 | 17-entry claims manifest and tagged tests pass. |
| V1-2, V1-3, V1-4 | One-click populated demo, isolated query demo, and complete demo documentation. |
| V1-6, V1-7 | Required response headers and designed HTTP 404. |
| V1-8 | Plain job h1, named audience, and clear first action. |
| V2-1, V2-2, V2-3 | Recovery claims, non-overwriting restore, and value validation pass. |
| V2-4, V2-5, V2-6, V2-7 | Mobile targets, deep/history routes, metadata/sitemap, and cache/MIME checks pass. |
| V3-1, V3-2 | Paid claims are tested; nested demo loads no broken resource. |
| V3-3, V3-4, V3-5, V3-6 | Sequential headings, mobile targets, complete landing skeleton, and direct copy audit. |
| V6-1 | Current full claim runs completed without a browser-runner crash. |
| F-1-1 | Legal, offline, and 404 pages use shared header, skip link, nav, and footer. |
| F-1-2, F-1-3 | Account/sync and medical statements are declared and tested. |
| F-1-4, F-1-5 | “Saved on this device” and user-result durability copy replaced implementation jargon. |
| F-1-6 through F-1-15 | README is plain, short, outcome-focused, and separates contributor details. |
| F-2-1 | Payment handling/no embedded provider are declared and tested. |
| F-2-2, F-2-3 | 404 has canonical and “Page not found.” h1. |
| F-2-4 | Landing says “spreadsheet or complete backup”, not unexplained file formats. |

## Missed leverage

The brief implies reusable routines, one-tap completion, correction-safe
history, local durability, CSV import/export, and recovery; all are present.
Cloud sync conflicts with the explicit local-first/no-account promise. AI would
be decorative rather than valuable for this one-handed capture job, and no
provider key is embedded. No leverage finding is raised.

## What would make this perfect

No product change is required this round. Keep running the same clean-state
claim, demo-isolation, offline, copy, routing, and accessibility checks whenever
copy, storage, checkout, service-worker, or route behavior changes.
