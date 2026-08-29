# Adversarial first-read review 2 — Durable Set Log

**Date:** 2026-08-29  
**URL checked:** <https://durable-set-log.sociobot.in>  
**Verdict:** **FAIL**

There are four remaining findings. None is a failed declared claim test, a demo
leak, or a broken route. The requested verdict is nevertheless FAIL because it
requires zero findings.

## Cold first read

Fresh browser contexts with no existing storage opened `/` at 390 × 844 and
1440 × 900. Before scrolling:

- **What it does:** It records every completed strength-training set and keeps
  it through a reload or lost signal.
- **For whom:** Strength trainees using a phone during a workout.
- **First click:** **Try it with sample data**. The adjacent text says it opens
  a separate ledger that is not saved with real data.

All three answers are available from the first screen. The mobile viewport has
no horizontal overflow (`390px` scroll width) and no console errors on this
cold visit. The warm paper, stamped controls, and original risograph hand-and-
ledger art are distinct from a generic SaaS template.

## Findings

### Medium

#### F-2-1 — Two README payment assertions are unlisted claims

**Location:** README, Product tiers: “Sociobot handles checkout and license
checks. The app does not embed a payment provider.”

The manifest has `purchase-price-checkout`, which proves that the US$14 action
opens the Sociobot checkout endpoint, and license-unlock/revocation entries.
It has no entry for either quoted sentence. A reader may rely on both facts
when deciding whether to buy. The claim contract requires a matching listed
claim, not an inference from neighbouring tests.

**Fix:** add exact manifest claims and tagged sandbox tests for the checkout
handler/license-verification origin and for the absence of an embedded payment
provider, or replace the two sentences with the already-listed, exact checkout
claim: “The US$14 purchase opens Sociobot checkout.”

### Low

#### F-2-2 — The designed 404 route has no canonical URL

**Location:** live `/404.html` and an unknown URL such as `/not-a-real-route`;
checked-in `public/404.html` `<head>`.

The page has title, description, OG/Twitter metadata, favicon, `noindex`, one
h1, recovery actions, and a real HTTP 404. It has no
`<link rel="canonical">`, unlike the other public routes. This misses the
required per-route metadata pattern and leaves multiple error URLs without an
authoritative URL.

**Fix:** add `<link rel="canonical" href="https://durable-set-log.sociobot.in/404.html">`
to the static 404 document (with `noindex` retained), and add a regression test
for it.

#### F-2-3 — The 404 headline uses a metaphor instead of naming the result

**Location:** live `/404.html` and unknown-route response h1: “That page is
not in this log.”

This requires a visitor to decode the product metaphor during an error. The
plain-words requirement says headings must state what the section is and must
not use mood/metaphor copy. It is less direct than the standard error a visitor
needs to recognize.

**Fix:** change the h1 to “Page not found.” Keep the useful next sentence and
the two recovery actions.

#### F-2-4 — The landing backup instruction names file formats without saying
what they are for

**Location:** landing “How it works” step 3: “Save CSV or JSON before you
clear browser data.”

“CSV” and “JSON” are file-format acronyms. A first-time trainee is told to
save something but not which choice preserves a complete backup. This repeats
the jargon the earlier review removed from README copy.

**Fix:** “Export a spreadsheet or complete backup before clearing browser
data.” Keep the precise CSV/JSON labels next to the actual export controls,
where a user needs to choose a file type.

## Copy audit

Counts use whitespace-separated words. Navigation labels are treated as labels,
not sentences. Landing headings/fragments are included because they must still
make sense in a screen-reader heading list. All landing items are at or below
22 words; F-2-4 is the only plain-words flag.

| Landing copy unit | Words | Check |
| --- | ---: | --- |
| Saved on this device | 4 | Pass |
| Log every strength set, even offline. | 6 | Pass |
| For strength trainees who need each completed set to survive a reload or lost signal. | 14 | Pass |
| Try it with sample data | 5 | Pass |
| Make your first routine | 4 | Pass |
| The sample opens a separate ledger and is never saved with your data. | 13 | Pass |
| A completed set saved in a local ledger. | 8 | Pass |
| Saves each set before confirming it | 7 | Pass; `confirmed-device-write` |
| Works offline after first visit | 5 | Pass; `offline-reload` |
| Export CSV any time | 4 | Pass; `csv-export` |
| How it works | 3 | Pass |
| Make a routine. | 3 | Pass |
| Add the exercises and defaults you repeat. | 7 | Pass |
| Complete each set. | 3 | Pass |
| The app confirms only after it saves the set. | 9 | Pass; `confirmed-device-write` |
| Export your history. | 3 | Pass |
| Save CSV or JSON before you clear browser data. | 10 | **F-2-4** |
| Privacy and limits | 3 | Pass |
| Workout records stay in this browser unless you export them. | 10 | Pass; `local-privacy` |
| There is no account or cloud sync. | 7 | Pass; `no-account-or-sync` |
| This app records training. | 4 | Pass |
| It does not provide medical guidance. | 7 | Pass; `not-medical-guidance` |
| One-time unlock | 2 | Pass |
| Free includes two routines, set logging, corrections, and exports. | 9 | Pass; listed behaviour claims |
| Pay US$14 once for unlimited routines and an on-device training summary. | 12 | Pass; `paid-summary-unlock` |
| See the US$14 license | 4 | Pass |
| Durable Set Log keeps strength sets on this device. | 9 | Pass; `local-privacy` |

README headings are direct and contextual: **How records stay safe**, **Product
tiers**, **Run locally**, **Deployment notes**, **Contributor verification**,
**Data and privacy**, **Factory records**, and **License**. The sentences and
informative copy units are below. F-2-1 is the only claim-inventory flag.

| README sentence/copy unit | Words | Check |
| --- | ---: | --- |
| Log strength sets on your phone, even without signal. | 9 | Pass |
| Confirmed sets remain after reloads. | 5 | Pass; `offline-reload` |
| Create repeatable routines, save sets with one tap, correct entries without deleting them, and import or export backups. | 17 | Pass; listed routine/correction/backup claims |
| There is no account or cloud sync. | 7 | Pass; `no-account-or-sync` |
| Live product: URL | 3 | Pass; label/link |
| Try the isolated sample at URL. | 6 | Pass |
| The sample uses separate browser storage. | 6 | Pass; `demo-isolated` |
| It never mixes with your real records. | 7 | Pass; `demo-isolated` |
| Your workout records are saved in this browser. | 8 | Pass; `local-privacy` |
| The app confirms a set only after it saves it. | 10 | Pass; `confirmed-device-write` |
| Correcting a set keeps the earlier value visible. | 8 | Pass; `append-only-corrections` |
| Starting or finishing a workout saves its status and history together. | 11 | Pass; `atomic-workout-write` |
| Importing a file keeps your existing records when entries conflict. | 10 | Pass; `csv-collision-safe` / `json-backup-restore` |
| After your first visit, the app can open without a signal. | 11 | Pass; `offline-reload` |
| Browser storage can still be cleared, so export a backup you need to keep. | 14 | Pass; useful limitation |
| Free includes two routines, set logging, corrections, and exports. | 9 | Pass; `free-routine-limit` |
| Pay US$14 once for unlimited routines and an on-device training summary. | 12 | Pass; `paid-summary-unlock` |
| Sociobot handles checkout and license checks. | 6 | **F-2-1** |
| The app does not embed a payment provider. | 8 | **F-2-1** |
| Use a current Node.js release and npm. | 7 | Pass; contributor instruction |
| The build command is `npm run build`. | 7 | Pass; contributor instruction |
| Static files appear in `dist/`, with `dist/index.html` at its root. | 9 | Pass; contributor instruction |
| Playwright 1.58.2 is pinned. | 4 | Pass; contributor instruction |
| Use the factory browser directory or run `npx playwright install chromium` when needed. | 12 | Pass; contributor instruction |
| Deploy `dist/` through the factory static-site work order. | 8 | Pass; contributor instruction |
| The deployment configuration sets security headers, caching, and the 404 page. | 11 | Pass; contributor instruction |
| `npm test` checks data handling and hosting rules. | 8 | Pass; contributor instruction |
| `npm run test:e2e` checks the workout flow, keyboard use, mobile controls, recovery, and offline reloads. | 15 | Pass; contributor instruction |
| `npm run test:claims` checks each published promise with the sample workout. | 10 | Pass; contributor instruction |
| The claim list is in `.factory/claims.json`. | 6 | Pass; contributor instruction |
| The app loads no ads, tracking tools, third-party fonts, or cloud workout storage while you log. | 16 | Pass; `local-privacy` |
| Read the Privacy notice and Terms. | 6 | Pass; action/link |
| Durable Set Log records training. | 5 | Pass |
| It does not provide medical guidance. | 7 | Pass; `not-medical-guidance` |
| MIT. | 1 | Pass; license label |
| See LICENSE. | 2 | Pass; action/link |

## Demo, claims, privacy, and sandbox checks

- **Demo:** Clicking the first-screen sample action opened `/demo` in one
  click. Its first view already showed a Tuesday-strength ledger with three
  saved entries (Back squat and Bench press), loads, reps, and correction
  controls. The persistent banner reads “Demo — sample data, nothing is
  saved.” A created `Review demo routine` disappeared after **Reset demo**;
  the ledger reseeded to three rows. **Start for real** returned to `/` with no
  banner and no demo routine.
- **Isolation/privacy:** the live normal/demo exercise requested only
  `durable-set-log.sociobot.in` documents and self-hosted art. No analytics,
  CDN, font, or other third-party request appeared. The `demo-isolated` test
  separately proves a demo-created routine is absent in real mode.
- **Claims:** I cloned the current `main` checkout into a new temporary
  directory, ran `npm ci`, and executed every command listed in
  `.factory/claims.json` individually. All 15 commands passed in both
  configured browser projects (30 executions): `offline-reload`,
  `confirmed-device-write`, `csv-export`, `local-privacy`,
  `no-account-or-sync`, `not-medical-guidance`, `demo-isolated`,
  `append-only-corrections`, `json-backup-restore`, `csv-collision-safe`,
  `atomic-workout-write`, `free-routine-limit`, `paid-summary-unlock`,
  `purchase-price-checkout`, and `license-revocation`. The full current
  `npm run test:claims` run also completed 30/30. There is no failing listed
  claim test.
- **Missed leverage:** the brief calls for reusable routines, one-tap logging,
  recovery, and import/export. Those exist. An AI feature would be decorative
  for this offline, one-handed capture job; no AI or sync omission is raised.

## Structure and route checks

- `/`, `/demo`, `/demo/routines`, `/routines`, `/ledger`, `/more`,
  `/privacy/`, and `/terms/` returned 200. An unknown route returned the
  designed HTTP 404. All internal navigation links crawled from those pages
  returned 200; the optional purchase link returned the documented 303 to
  Sociobot-hosted checkout.
- App, demo, and legal routes have language, one h1, a main landmark, a title,
  description, canonical, OG/Twitter social image, favicon, shared branded
  navigation/footer, and usable skip links. The exception is F-2-2: the static
  404 has no canonical. Its title pattern is otherwise correct.
- Demo navigation to Routines changed the URL to `/demo/routines`, focused the
  Routines h1, and set title `Demo routines — Durable Set Log`; Back restored
  `/demo`, its title, and focus to Set ledger.
- `robots.txt`, sitemap, manifest, response-header CSP, `frame-ancestors`,
  referrer policy, `nosniff`, original favicon/art, and a real 404 are present.
  The current risograph-ledger visual system follows the recorded product
  thesis and is not generic.

## Earlier finding recheck

Every earlier report was read. The following earlier findings are confirmed
fixed in both current code and the live site; none is reopened.

| Earlier finding | Current confirmation |
| --- | --- |
| Verification 1, defect 1: missing claim inventory | `.factory/claims.json` now has 15 entries, and every listed command was run successfully from a fresh clone. |
| Verification 1, defect 2: no sample action | Root now shows **Try it with sample data** before scrolling, and it opens `/demo` in one click. |
| Verification 1, defect 3: non-isolated query demo | `?demo=1` uses demo mode; the separate `demo-isolated` claim and this live reset/exit exercise confirm no real-ledger leakage. |
| Verification 1, defect 4: no demo documentation | `.factory/demo.md` documents the URL, sample, reset/exit, and separate browser-storage namespace. |
| Verification 1, defect 5: unlisted core claims | Reliability, export, privacy, medical-disclaimer, and demo-isolation entries are now listed and pass. |
| Verification 1, defect 6: missing CSP/Permissions-Policy | Live response has CSP including response-header `frame-ancestors 'none'` and a Permissions-Policy. |
| Verification 1, defect 7: app-shell 200 for an unknown route | `/not-a-real-route` is designed and HTTP 404. |
| Verification 1, defect 8: product-name h1 and unclear audience/action | Root h1 is “Log every strength set, even offline,” names strength trainees, and shows Try it with sample data. |
| Verification 2, defect 1: omitted recovery/correction/import claims | The manifest now includes correction, backup/restore, collision, and atomic-write claims; their commands passed. |
| Verification 2, defect 2: restore overwrote newer routine | `json-backup-restore` passes its older-backup/local-newer-edit scenario. |
| Verification 2, defect 3: invalid active-workout values saved | Current claim/browser coverage rejects `2000.5 kg` and `1001` reps before a write. |
| Verification 2, defect 4: sub-44px mobile controls | Current 390px checks in the configured suite pass; cold root had no overflow. |
| Verification 2, defect 5: no history/deep links | Live `/demo/routines` deep-loaded, changed history, and Back restored route/title/focus. |
| Verification 2, defect 6: incomplete metadata/sitemap | Current app/legal routes have per-route metadata and sitemap lists demo routes. |
| Verification 2, defect 7: cache/MIME defects | Live manifest is `application/manifest+json`; fingerprinted art/icons use immutable caching. |
| Verification 3, defect 1: omitted paid promises | Free limit, paid unlock, checkout price, and revocation have manifest entries and passing tagged tests. |
| Verification 3, defect 2: nested-demo resource 404s | Fresh live `/demo/routines` resolved root-absolute resources; no failed resource was observed in the direct cold check. |
| Verification 3, defect 3: heading-level skips | Current accessibility suite passes and app markup uses h1 followed by h2 content headings. |
| Verification 3, defect 4: short mobile links | Current mobile accessibility/touch-target tests pass. |
| Verification 3, defect 5: missing landing sections | Root includes How it works, Privacy and limits, and a US$14 tier. |
| Verification 3, defect 6: metaphor headings and incomplete inventory | The previous landing metaphors are gone; this round newly identifies only F-2-3 and F-2-4. |
| F-1-1 | Privacy, Terms, offline, and 404 use the branded skeleton, skip link, navigation, recovery path, and complete footer. |
| F-1-2 | `no-account-or-sync` is listed and passed. |
| F-1-3 | `not-medical-guidance` is listed and passed. |
| F-1-4 | The eyebrow now says “Saved on this device.” |
| F-1-5 | The proof fact now says “Saves each set before confirming it.” |
| F-1-6 | README opening is two short job-focused sentences. |
| F-1-7 | README introductory feature copy uses routine/set/correction/backups wording. |
| F-1-8 | README durability explanation describes outcomes, with corresponding tests. |
| F-1-9 | README offline copy is short and outcome-focused. |
| F-1-10 | The former endpoint sentence was removed; its replacement is now reviewed under F-2-1. |
| F-1-11 | Deployment detail is under Deployment notes. |
| F-1-12 | Test descriptions are short contributor instructions. |
| F-1-13 | Claim-test detail is under Contributor verification. |
| F-1-14 | README says ads/tracking tools rather than CDN/SDK acronyms. |
| F-1-15 | Factory records are a readable four-item list. |

## What would make this perfect

Close F-2-1 through F-2-4: make the payment statements exact, tested claims or
remove them; add the 404 canonical; use “Page not found” as its h1; and replace
the landing file-format jargon with outcome language. Then rerun this full
cold-read, copy, demo, claim, isolation, history, routing, and link checklist.
