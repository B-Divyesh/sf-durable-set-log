# Adversarial first-read review 1 — Durable Set Log

**Date:** 2026-08-29  
**URL checked:** <https://durable-set-log.sociobot.in>  
**Verdict:** **FAIL**

There are no blocking demo, claim-test, durability, privacy-request, routing,
or visual-identity failures. The review still fails because the requested
standard is zero findings. The remaining findings are plain-language/claims
inventory defects in public copy and an inconsistent site skeleton on legal and
404 routes.

## Cold first read

Fresh 390 × 844 and 1440 × 900 browser contexts opened `/` with no existing
storage.

- **What it does:** It logs completed strength-training sets and keeps them
  through a reload or a lost signal.
- **For whom:** Strength trainees logging a workout on a phone.
- **First click:** **Try it with sample data**. The adjacent sentence says it
  opens a separate ledger and is never saved with real data.

This is clear before scrolling. The cold first-read gate passes. The mobile
first screen uses a product-specific risograph ledger/hand-stamp illustration
and stamped-paper controls; it is not a generic SaaS template.

## Findings

### Medium

#### F-1-1 — Legal and 404 routes do not use the required shared site skeleton

**Location:** live `/privacy/`, `/terms/`, and `/does-not-exist`; checked-in
`public/privacy/index.html`, `public/terms/index.html`, and `public/404.html`.

The app routes have the Durable Set Log wordmark, navigation, product footer,
Privacy/Terms links, factory attribution, and version. The legal pages instead
use only `← Return to Durable Set Log` and a two-link footer. The 404 has no
header or footer. This breaks the required consistent header/footer on every
route and makes a visitor arriving through a legal/search link lose the normal
wayfinding.

**Fix:** use the app’s compact shared header (wordmark home link plus Demo,
Routines, Ledger, Privacy navigation) and its footer (product one-liner,
Privacy, Terms, Built by Param Factory, version) on Privacy, Terms, and 404.
Keep the 404’s recovery links inside that skeleton.

### Low

#### F-1-2 — “No account or cloud sync” is a published claim without an exact claim entry

**Location:** landing “Privacy and limits” and README line 6: “There is no
account or cloud sync.”

`local-privacy` proves same-origin requests in the normal flow, but it does not
name or test the absence of an account or sync facility. The review instruction
requires every claim-like public sentence to have a matching manifest entry.

**Fix:** add a `no-account-or-sync` claims entry and isolated `/demo` test that
asserts no sign-in/account UI exists and no sync request is made, or replace the
sentence with the already-tested exact local-privacy claim.

#### F-1-3 — The medical disclaimer is an unlisted public claim

**Location:** landing “This app records training. It does not provide medical
guidance.” and README line 71.

The brief requires the disclaimer, so it should remain. It is nevertheless a
visitor-facing claim and has no `claims.json` entry or tagged check.

**Fix:** retain the disclaimer and add `not-medical-guidance` with a content
test that asserts the disclaimer is present on landing, Terms, and README; or
define an explicit documented exception for legal disclaimers in the claims
contract and apply it consistently.

#### F-1-4 — The landing eyebrow uses unexplained implementation jargon

**Location:** first screen: “APPEND-ONLY · OFFLINE-FIRST”.

Neither phrase tells a cold strength trainee what changes for them; both are
engineering terms. This conflicts with the plain-words requirement even though
the surrounding headline is clear.

**Fix:** replace it with “SAVED ON THIS DEVICE” or delete it. The nearby proof
strip already communicates the practical benefit.

#### F-1-5 — The landing proof fact names an internal operation, not a user result

**Location:** first screen proof strip: “Confirms after device write”.

“Device write” is not normal workout language. A visitor needs to know whether
the set is safe to move on from.

**Fix:** “Saves each set before confirming it.” Update the associated claim
text/test wording so the public claim and proof remain exact.

#### F-1-6 — README opening sentence exceeds the 22-word cap and starts with jargon

**Location:** README lines 3–4: “Durable Set Log is a tiny, offline-first
workout ledger for strength trainees who cannot afford to lose a confirmed set
to a reload or poor signal.” (26 words)

“Offline-first” and “ledger” delay the job-to-be-done.

**Fix:** “Log strength sets on your phone, even without signal. Confirmed sets
remain after reloads.”

#### F-1-7 — README feature list uses unexplained record-format jargon

**Location:** README lines 4–6: “It has reusable routines, a one-tap set
action, append-only correction history, CSV import/export, and full JSON
backups.” (17 words)

“Append-only”, “CSV”, and “JSON” are unexplained in the introductory reader
copy.

**Fix:** “Create repeatable routines, save sets with one tap, correct entries
without deleting them, and import or export backups.”

#### F-1-8 — README durability section exposes storage implementation terms

**Location:** README lines 16–20.

The following sentences are technically precise but do not meet the attached
plain-words rule for README copy:

- “Workout data is written to IndexedDB.” (6 words)
  **Rewrite:** “Your workout records are saved in this browser.”
- “A set confirmation appears only after its immutable event has been added
  successfully.” (13 words)
  **Rewrite:** “The app confirms a set only after it saves it.”
- “Editing a set appends a correction event instead of changing the original.”
  (12 words)
  **Rewrite:** “Correcting a set keeps the earlier value visible.”
- “Active workout metadata and start/end events are committed atomically.”
  (9 words)
  **Rewrite:** “Starting or finishing a workout saves its status and history
  together.”
- “IDs use `crypto.randomUUID()`; CSV imports merge by ID and safely rename
  conflicting foreign events instead of overwriting data.” (18 words)
  **Rewrite:** “Importing a file keeps your existing records when entries
  conflict.”

#### F-1-9 — README offline explanation uses service-worker jargon and one overlong sentence

**Location:** README lines 22–24.

“The service worker precaches the complete app shell and serves it offline.”
(12 words) names internals rather than the result. “Local browser storage can
still be removed by a person, browser, or operating system, so the app includes
portable CSV and JSON backup paths.” (24 words) exceeds the cap and uses
unexplained file-format language.

**Fix:** “After your first visit, the app can open without a signal. Browser
storage can still be cleared, so export a backup you need to keep.”

#### F-1-10 — README payment sentence is endpoint documentation in reader copy

**Location:** README lines 30–31: “Checkout and verification use only
`https://api.sociobot.in/api/v1/...`; no payment provider is embedded.” (11
words)

A buyer needs to know who handles payment, not an API path.

**Fix:** “Sociobot handles checkout and license checks. The app does not embed a
payment provider.” Put endpoint details in a developer-only section if needed.

#### F-1-11 — README deployment/configuration sentence is unexplained jargon

**Location:** README lines 53–55: “The checked-in
`public/staticwebapp.config.json` supplies the production security headers,
cache rules, MIME types, and 404 response.” (15 words)

This is useful implementation detail, but not plain README product copy.

**Fix:** move it under a clearly labelled “Deployment notes” section and write:
“The deployment configuration sets security headers, caching, and the 404
page.”

#### F-1-12 — README test description uses unexplained terms

**Location:** README lines 57–61: “`npm test` covers CSV safety, input limits,
correction folding, and static hosting policy.” (13 words); “`npm run
test:e2e` covers keyboard/dialog accessibility, an axe serious/critical scan,
append-only corrections, route history, metadata, mobile target sizes,
conflict-free restore, and 100 consecutive offline reloads of a confirmed
set.” (29 words)

The second sentence exceeds the cap, and both use jargon such as “correction
folding”, “axe”, “metadata”, and “conflict-free”.

**Fix:** “`npm test` checks data handling and hosting rules. `npm run test:e2e`
checks the workout flow, keyboard use, mobile controls, recovery, and offline
reloads.”

#### F-1-13 — README claim-test description uses internal process language

**Location:** README lines 62–64: “`npm run test:claims` runs each published
reliability, recovery, privacy, CSV, and demo claim from the isolated `/demo`
entry point.” (19 words); “The mapping is in
`.factory/claims.json`.” (5 words)

“Entry point” and the repository path are implementation language in a
reader-facing paragraph.

**Fix:** move both sentences under “Contributor verification”, then write:
“`npm run test:claims` checks each published promise with the sample workout.”

#### F-1-14 — README privacy inventory relies on unexplained acronyms

**Location:** README lines 68–69: “No runtime CDN, third-party font, analytics
SDK, ad tracker, or cloud workout store is used.” (15 words)

“CDN” and “SDK” are not plain language.

**Fix:** “The app loads no ads, tracking tools, third-party fonts, or cloud
workout storage while you log.” Keep the precise technical inventory in the
Privacy page.

#### F-1-15 — README repository-document sentence exceeds the cap and is not useful to a product reader

**Location:** README lines 73–77: “The researched opportunity is in
`.factory/brief.json`, the product-specific visual system and generated-asset
provenance are in `.factory/design.md`, the sample sandbox is documented in
`.factory/demo.md`, and verification notes are in `.factory/handoff.md`.” (29
words)

This is a run-on inventory of internal factory files.

**Fix:** replace it with a four-item “Factory records” list, or remove it from
the reader-facing README and link it from contributor documentation.

## Copy audit

The landing inventory below includes all visible sentences/copy units that
carry information on a fresh real-data landing page. Word counts use
whitespace-separated words. Navigation labels are omitted because they are
labels, not sentences.

| Landing copy | Words | Result |
| --- | ---: | --- |
| Log every strength set, even offline. | 6 | Pass |
| For strength trainees who need each completed set to survive a reload or lost signal. | 14 | Pass |
| Try it with sample data | 5 | Pass |
| Make your first routine | 4 | Pass |
| The sample opens a separate ledger and is never saved with your data. | 13 | Pass |
| A completed set saved in a local ledger. | 8 | Pass |
| Confirms after device write | 4 | F-1-5 |
| Works offline after first visit | 5 | Pass; declared claim |
| Export CSV any time | 4 | Pass; declared claim |
| How it works | 4 | Pass |
| Make a routine. | 3 | Pass |
| Add the exercises and defaults you repeat. | 7 | Pass |
| Complete each set. | 3 | Pass |
| The app confirms only after the device write succeeds. | 9 | Pass; declared claim |
| Export your history. | 3 | Pass |
| Save CSV or JSON before you clear browser data. | 10 | Pass; declared backup claims |
| Privacy and limits | 3 | Pass |
| Workout records stay in this browser unless you export them. | 10 | Pass; declared claim |
| There is no account or cloud sync. | 7 | F-1-2 |
| This app records training. | 4 | Pass |
| It does not provide medical guidance. | 7 | F-1-3 |
| One-time unlock | 2 | Pass |
| Free includes two routines, set logging, corrections, and exports. | 9 | Pass; declared claim |
| Pay US$14 once for unlimited routines and an on-device training summary. | 12 | Pass; declared claim |
| See the US$14 license | 4 | Pass |
| Durable Set Log keeps strength sets on this device. | 9 | Pass; declared claim |

Additional non-sentence landing label: “APPEND-ONLY · OFFLINE-FIRST” is
flagged by F-1-4. All landing sentences are within 22 words; the flags are
jargon or claim-inventory issues.

| README sentence/copy unit | Words | Result |
| --- | ---: | --- |
| Durable Set Log is a tiny, offline-first workout ledger for strength trainees who cannot afford to lose a confirmed set to a reload or poor signal. | 26 | F-1-6 |
| It has reusable routines, a one-tap set action, append-only correction history, CSV import/export, and full JSON backups. | 17 | F-1-7 |
| There is no account or cloud sync. | 7 | F-1-2 |
| Try the isolated sample at https://durable-set-log.sociobot.in/demo. | 6 | Pass |
| The sample is stored in a separate browser database and is never mixed with a real ledger. | 17 | Pass; declared claim |
| Workout data is written to IndexedDB. | 6 | F-1-8 |
| A set confirmation appears only after its immutable event has been added successfully. | 13 | F-1-8 |
| Editing a set appends a correction event instead of changing the original. | 12 | F-1-8 |
| Active workout metadata and start/end events are committed atomically. | 9 | F-1-8 |
| IDs use crypto.randomUUID(); CSV imports merge by ID and safely rename conflicting foreign events instead of overwriting data. | 18 | F-1-8 |
| The service worker precaches the complete app shell and serves it offline. | 12 | F-1-9 |
| Local browser storage can still be removed by a person, browser, or operating system, so the app includes portable CSV and JSON backup paths. | 24 | F-1-9 |
| Core logging, correction history, two routines, accessibility, and all data exports are free. | 13 | Pass; declared claim |
| A US$14 one-time Sociobot license unlocks unlimited routines and an on-device training summary. | 13 | Pass; declared claim |
| Checkout and verification use only https://api.sociobot.in/api/v1/...; no payment provider is embedded. | 11 | F-1-10 |
| Requires a current Node.js release and npm. | 7 | Pass; developer prerequisite |
| The exact deploy build command is npm run build. | 9 | Pass; developer instruction |
| Static output lands in dist/, with dist/index.html at its root. | 10 | Pass; developer instruction |
| Playwright is pinned to 1.58.2; set PLAYWRIGHT_BROWSERS_PATH to the factory browser directory or run npx playwright install chromium outside the worker image. | 22 | Pass; developer instruction |
| Deploy dist/ through the factory static-site work order. | 8 | Pass; developer instruction |
| The checked-in public/staticwebapp.config.json supplies the production security headers, cache rules, MIME types, and 404 response. | 15 | F-1-11 |
| npm test covers CSV safety, input limits, correction folding, and static hosting policy. | 13 | F-1-12 |
| npm run test:e2e covers keyboard/dialog accessibility, an axe serious/critical scan, append-only corrections, route history, metadata, mobile target sizes, conflict-free restore, and 100 consecutive offline reloads of a confirmed set. | 29 | F-1-12 |
| npm run test:claims runs each published reliability, recovery, privacy, CSV, and demo claim from the isolated /demo entry point. | 19 | F-1-13 |
| The mapping is in .factory/claims.json. | 5 | F-1-13 |
| No runtime CDN, third-party font, analytics SDK, ad tracker, or cloud workout store is used. | 15 | F-1-14 |
| See public/privacy/index.html and public/terms/index.html. | 4 | Pass |
| Durable Set Log records training; it is not medical guidance. | 10 | F-1-3 |
| The researched opportunity is in .factory/brief.json, the product-specific visual system and generated-asset provenance are in .factory/design.md, the sample sandbox is documented in .factory/demo.md, and verification notes are in .factory/handoff.md. | 29 | F-1-15 |
| MIT. | 1 | Pass |
| See LICENSE. | 2 | Pass |

## Demo, claims, privacy, and sandbox checks

- The first-screen **Try it with sample data** link opens `/demo` in one click.
  Its first screen already contains a realistic Tuesday-strength ledger with
  three completed entries: Back squat and Bench press, loads, reps, dates, and
  correction controls.
- The persistent banner reads “Demo — sample data, nothing is saved” and
  exposes working **Reset demo** and **Start for real** controls. Reset restored
  the three seeded entries. The declared `demo-isolated` test passed, confirming
  demo data uses the separate `durable-set-log:demo` namespace and does not
  appear in real mode.
- All 13 commands listed in `.factory/claims.json` were run individually from
  this clean dependency install. Every command passed in desktop and mobile
  Chromium (26 claim executions): `offline-reload`, `confirmed-device-write`,
  `csv-export`, `local-privacy`, `demo-isolated`,
  `append-only-corrections`, `json-backup-restore`, `csv-collision-safe`,
  `atomic-workout-write`, `free-routine-limit`, `paid-summary-unlock`,
  `purchase-price-checkout`, and `license-revocation`.
- Fresh-browser request logs for landing and normal demo use contained only
  `durable-set-log.sociobot.in` requests. There were no third-party font,
  analytics, or workout-data requests. The explicit license behavior is covered
  by its routed fixture tests.
- The brief implies reusable routines plus import/export; the product supplies
  CSV import/export and JSON backup/restore. No AI-assisted action is an
  obvious missing benefit for this narrow offline, one-handed capture job. No
  provider key is embedded.

## History check

All earlier findings were rechecked against the live deployment and code rather
than accepted from their marked status.

| Earlier finding | Current verification |
| --- | --- |
| Missing claims manifest/demo/isolation, first-screen unclear, missing CSP/404 (verification 1) | Fixed: manifest has 13 entries; one-click demo is isolated and bannered; live CSP is present; unknown route is HTTP 404. |
| Recovery/import claims missing; backup overwrote newer routine; invalid max values saved; touch targets, history, social metadata, cache/MIME defects (verification 2) | Fixed: matching claims pass; restore and validation claims pass; mobile/a11y suite passes; deep routes and metadata work; live manifest is `application/manifest+json` and fingerprinted art cache is immutable. |
| Paid claims missing; nested demo resource 404s; heading-order and 44px link defects; missing landing sections/metaphor headings (verification 3) | Fixed: paid claim tests pass; fresh `/demo/routines` had no failed requests or console errors; its title/canonical/OG metadata and one h1 are correct; full a11y suite passes; 390px control checks pass; landing sections are present. |

No previous finding is re-opened. F-1-1 through F-1-15 are new findings from
this full review.

## Structure and quality evidence

- Live `/`, `/demo`, `/routines`, `/ledger`, `/more`, `/demo/workout`,
  `/demo/routines`, `/demo/more`, `/privacy/`, `/terms/`, worker, manifest,
  robots, and sitemap all returned HTTP 200. `/does-not-exist` returned the
  designed page with HTTP 404.
- Fresh `/demo/routines` has `lang=en`, one `main`, one h1, unique title
  “Demo routines — Durable Set Log”, route canonical, description, and social
  image. Navigation to Ledger and browser Back restored route and focused the
  new h1. There were no failed requests or console errors.
- Root title, description, canonical, Open Graph/Twitter image, SVG favicon,
  apple touch icon, sitemap, robots, manifest, and response CSP are present.
  The title pattern passes on application and legal routes.
- `npm test` passed (9 tests); `npm run lint` and `npm run typecheck` passed;
  `npm run build` passed and produced `dist/` (60.91 kB raw, 18.03 kB gzip
  index); `npm run test:e2e` passed (52 passed, 2 intended skips); and
  `npm run test:a11y` passed (8 tests).

## What would make this perfect

Apply F-1-1 through F-1-15: make every route use the same recognizable site
skeleton, add exact coverage (or an explicit documented exception) for the two
unlisted landing claims, and make the README plain-language product and
contributor documentation. Then rerun this entire cold, demo, claims, route,
privacy, history, and accessibility checklist. With those findings absent, the
product is PASS-ready.
