# Perfection-loop polish 1 — finding closure

Date: 2026-08-29

Base review: `76438dfd5097adfe6b16555dc44fd3b5cb1f0ab8`

Implementation commit: `695032b`

Deployment: <https://durable-set-log.sociobot.in> (`d773a550-fa54-4592-b3ee-869e063e26b9`)

Every finding in `.factory/review-1.md` is closed. Earlier reviews were
rechecked through their existing regression tests; none reopened.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Privacy, Terms, 404, and offline fallback now share the risograph wordmark, Demo/Routines/Ledger/Privacy navigation, skip link, complete footer, and v1.0.4 build label. The 404 also has social metadata and `noindex`. | Test: `legal, offline, and 404 pages use the shared site skeleton`; `legal skip links move keyboard focus to main content`; axe routes. Screenshots: `.factory/evidence/polish-1/live-cold-privacy.png`, `live-cold-404.png`. Live: `/privacy/` and `/terms/` return 200; `/definitely-not-a-route` returns the designed page with HTTP 404. |
| F-1-2 | Added `no-account-or-sync` to the claims manifest and one isolated tagged test. It checks every demo view for account/sync controls and account/auth/sync requests. | Test: `@claim:no-account-or-sync` passed desktop and mobile from the clean clone. Screenshot: `live-cold-home.png`. Live: `/` and `/more` show the exact claim; the cold request log stayed same-origin. |
| F-1-3 | Added `not-medical-guidance` and one tagged test covering landing, Terms, and README. | Test: `@claim:not-medical-guidance` passed desktop and mobile. Screenshot: `live-cold-home.png`. Live: `/` and `/terms/` contain the disclaimer. |
| F-1-4 | Replaced “APPEND-ONLY · OFFLINE-FIRST” with “Saved on this device.” | Test: `empty state has no accessibility violations`; live copy check. Screenshot: `live-cold-home.png`. Live `/` reports the exact eyebrow in `live-cold-check.json`. |
| F-1-5 | Replaced “Confirms after device write” with “Saves each set before confirming it” and removed “device write” from related user copy. Updated the exact claim wording. | Test: `@claim:confirmed-device-write` passed desktop and mobile. Screenshot: `live-cold-home.png`. Live `/` contains the revised proof fact. |
| F-1-6 | Rewrote the README opening as two short job-focused sentences. | Test: `reviewed public copy › uses the required plain README wording`; `.factory/copy-audit.md`. Screenshot: not applicable to repository documentation. Live `/` uses the matching plain headline. |
| F-1-7 | Replaced the introductory record-format jargon with concrete routine, one-tap, correction, import, and export wording. | Test: `reviewed public copy › uses the required plain README wording`; copy audit. Screenshot: not applicable to repository documentation. Live `/` and `/more` retain the working actions. |
| F-1-8 | Rewrote all five durability explanations in plain language while keeping the implementation unchanged. | Test: `reviewed public copy › uses the required plain README wording`; the durability, collision, and atomic claim tests all passed. Screenshot: `live-cold-demo.png`. Live `/?demo=1` showed three durable sample rows. |
| F-1-9 | Replaced service-worker jargon and the overlong storage sentence with two short outcome-focused sentences. | Test: README copy test and `@claim:offline-reload`. Screenshot: `live-cold-demo.png`. Live demo reloaded offline with its banner and Back squat row present. |
| F-1-10 | Replaced API endpoint copy with “Sociobot handles checkout and license checks. The app does not embed a payment provider.” | Test: README copy test and `@claim:purchase-price-checkout`. Screenshot: `live-cold-home.png`. Live `/more` retains the approved Sociobot checkout action. |
| F-1-11 | Moved the configuration sentence under “Deployment notes” and rewrote it in plain words. | Test: README copy test and `static hosting release safeguards`. Screenshot: not applicable to repository documentation. Live headers and true 404 were checked with `curl`. |
| F-1-12 | Reduced the test descriptions to two short reader-facing sentences without internal tool jargon. | Test: README copy test; clean-clone `npm test` and `npm run test:e2e`. Screenshot: not applicable to repository documentation. Live application checks passed after deployment. |
| F-1-13 | Moved claim verification under “Contributor verification” and described it as checking published promises with the sample workout. | Test: README copy test and `gives every declared claim one tagged browser test`. Screenshot: `live-cold-demo.png`. Live `/?demo=1` is the verified sample path. |
| F-1-14 | Replaced “CDN” and “SDK” with ads, tracking tools, third-party fonts, and cloud workout storage. | Test: README copy test and `@claim:local-privacy`. Screenshot: `live-cold-home.png`. Live cold request log was same-origin only. |
| F-1-15 | Replaced the run-on internal file inventory with a four-item “Factory records” list. | Test: README copy test and `.factory/copy-audit.md`. Screenshot: not applicable to repository documentation. Live product copy has no factory-file inventory. |

## Shared evidence

- Clean clone: 15 claim commands passed individually in desktop and mobile
  projects (30 executions); 12 unit/policy/copy tests; typecheck; lint; build;
  60 full browser tests with 2 intentional mobile-only skips; 8 accessibility
  tests; and 2 service-worker update tests.
- Live cold-check details: `.factory/evidence/polish-1/live-cold-check.json`.
- Live axe results: `.factory/evidence/polish-1/live-axe.json` has zero
  violations on `/`, `/?demo=1`, `/privacy/`, `/terms/`, and `/404.html`.
- Live Lighthouse results: `.factory/evidence/polish-1/performance-summary.json`.
- Copy and catalog proof: `.factory/evidence/polish-1/copy-check.json` reports
  zero landing violations and a 93-character verb-first catalog description.
