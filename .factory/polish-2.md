# Perfection-loop polish 2 — cumulative finding closure

Date: 2026-08-29  
Repair commit: `6cbd04d9cda416bdafe01fd8198081483126cb89`  
Deployment: `2ef0c848-49ec-47e9-8184-1ea6ea275116` — <https://durable-set-log.sociobot.in>

All reports were read: `verification.md`, `verification-2.md` through
`verification-5.md`, `review-1.md`, `review-2.md`, and `polish-1.md`.
Every historic fix was rechecked in the current build. The four remaining
review-2 findings are repaired in this commit.

Live evidence: root screenshots are in `evidence/polish-2/live-root/`; query-demo
screenshots are in `evidence/polish-2/live-demo/`; and 404 screenshots are in
`evidence/polish-2/live-404/`. Each directory has `verify.json` from
`verify-url.sh`. `live-axe.json` has no violations on root, query demo, Privacy,
Terms, or 404. The live URLs in this table were cold-opened after deployment.

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| V1-1 | Added claims inventory and one tagged sandbox test per promise. | All 17 clean-clone claim commands; claim inventory test. |
| V1-2 | Added the first-screen sample action and realistic Tuesday workout. | `@claim:demo-isolated`; `live-root/screenshot-mobile.png`; live `/`. |
| V1-3 | Isolated `?demo=1` in `durable-set-log:demo`. | `@claim:demo-isolated`; `live-demo/screenshot-desktop.png`. |
| V1-4 | Documented demo URL, sample, reset, exit, and namespace. | `.factory/demo.md`; `@claim:demo-isolated`. |
| V1-5 | Listed and tested reliability, export, privacy, disclaimer, and demo claims. | All claim commands; `.factory/claims.json`. |
| V1-6 | Added CSP, Permissions-Policy, and response-header frame protection. | Hosting test; live `/` headers. |
| V1-7 | Added a designed Static Web Apps 404 response. | Hosting test; live `/not-a-real-route` is 404. |
| V1-8 | Rewrote h1, audience sentence, and first action in plain words. | Copy audit; `live-root/screenshot-mobile.png`. |
| V2-1 | Added correction, backup/restore, collision, and atomic-write claims. | Corresponding four `@claim:` tests. |
| V2-2 | Restore keeps newer local routines instead of overwriting them. | `@claim:json-backup-restore`. |
| V2-3 | Completion enforces displayed weight/repetition validity before writes. | Input-constraints browser test. |
| V2-4 | Raised brand/footer/legal controls to 44px on mobile. | Mobile target tests; `live-root/screenshot-mobile.png`. |
| V2-5 | Added deep paths, History API navigation, route titles, and h1 focus. | History browser test; live `/demo/routines`. |
| V2-6 | Added per-route metadata, canonicals, social image, and demo sitemap entry. | Metadata browser test; live `/demo`. |
| V2-7 | Added immutable fingerprinted caching and correct AVIF/webmanifest MIME. | Hosting test; live asset headers. |
| V3-1 | Added free-limit, unlock, checkout-price, and revocation claims. | Four paid `@claim:` tests. |
| V3-2 | Made nested-demo PWA resources root-absolute. | Nested-demo resource browser test; live `/demo/routines`. |
| V3-3 | Corrected h1→h2 heading hierarchy. | `npm run test:a11y`; `live-axe.json`. |
| V3-4 | Raised More/legal contact links to 44px touch targets. | Mobile in-content/legal target test. |
| V3-5 | Added How it works, privacy/limits, and exact-price paid landing sections. | Landing-section browser test; live `/`. |
| V3-6 | Removed metaphor headings and completed the copy audit. | Copy audit and copy test. |
| F-1-1 | Applied shared header, nav, skip link, and footer to support documents. | Shared-skeleton test; `live-404/screenshot-desktop.png`. |
| F-1-2 | Added and tested `no-account-or-sync`. | `@claim:no-account-or-sync`; live `/more`. |
| F-1-3 | Added and tested `not-medical-guidance`. | `@claim:not-medical-guidance`; live `/terms/`. |
| F-1-4 | Replaced engineering jargon with “Saved on this device.” | Copy audit; `live-root/screenshot-desktop.png`. |
| F-1-5 | Replaced device-write language with the saved-before-confirming result. | `@claim:confirmed-device-write`; live `/`. |
| F-1-6 | Rewrote the README opening in job-focused sentences. | `reviewed public copy`; `README.md`. |
| F-1-7 | Rewrote README feature copy with routine/set/correction/backup terms. | `reviewed public copy`; `README.md`. |
| F-1-8 | Rewrote README durability explanations in outcome language. | Copy test and durability claims. |
| F-1-9 | Rewrote README offline/back-up explanation in outcome language. | Copy test; `@claim:offline-reload`. |
| F-1-10 | Replaced endpoint prose with buyer-facing payment prose. | Copy test; superseded payment tests below. |
| F-1-11 | Moved deployment detail under Deployment notes. | Copy and hosting tests. |
| F-1-12 | Rewrote test descriptions for contributors. | Copy test; clean-clone suite. |
| F-1-13 | Moved claim-process detail under Contributor verification. | Copy test; all claim commands. |
| F-1-14 | Replaced CDN/SDK jargon with ads/tracking/storage language. | Copy test; `@claim:local-privacy`. |
| F-1-15 | Replaced the README factory-file run-on with a four-item list. | Copy test; `README.md`. |
| F-2-1 | Added exact `sociobot-payment-handling` and `no-embedded-payment-provider` claims with one test each. | Both clean-clone tagged commands; live `/demo/more` has Sociobot checkout, 0 frames, 0 card inputs, no console errors. |
| F-2-2 | Added the fixed `/404.html` canonical URL. | 404 regression; live `/not-a-real-route`. |
| F-2-3 | Replaced the metaphor h1 with “Page not found.” | 404 regression; `live-404/screenshot-mobile.png`. |
| F-2-4 | Replaced landing file-format jargon with outcome language. | Landing regression; `live-root/screenshot-desktop.png`; live `/`. |

## Verification summary

- Clean clone at `6cbd04d`: `npm ci`, then every one of the 17 `claims.json`
  commands individually. Each ran in desktop and mobile Chromium and passed
  (34 executions).
- Current checkout: `npm test` (12), `npm run lint`, `npm run build`,
  `npm run test:e2e` (66), `npm run test:a11y` (8), and `npm run test:claims`
  (34) passed.
- Live: `verify-url.sh` passed on `/`, `/?demo=1`, and `/404.html`; an unknown
  route returned HTTP 404 with the canonical and direct h1. Live Axe had zero
  violations across root, query demo, Privacy, Terms, and 404.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 1.4s and CLS 0. Evidence:
  `evidence/polish-2/lighthouse-mobile.json`.
