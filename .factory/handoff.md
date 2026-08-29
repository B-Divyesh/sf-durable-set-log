# Durable Set Log — verification 5 handoff

## Current release decision

**PASS — candidate `dd92c45fcdf586d364509008212a0fc0f18f7bc3` is accepted for
<https://durable-set-log.sociobot.in>.**

Independent verification 5 was completed on 2026-08-29 from a clean `npm ci`
install. All 15 required claim commands passed individually; lint, typecheck,
12/12 unit tests, the configured browser suite, 8/8 accessibility tests, and
the exact production build passed. The live deployment is byte-identical to
the candidate's built app shell, service worker, manifest, and tested hero
asset. A real demo set survived offline reloads; service-worker update retained
IndexedDB data; the privacy request log stayed same-origin; and live axe had no
serious or critical findings.

The observed Sociobot verification allowance is 30 requests per window:
request 31 answered `429 Retry-After: 4`. The product has no separate backend
or sign-in flow. There are no known defects by severity (Critical: none; High:
none; Medium: none; Low: none). Full evidence is in
[`verification-5.md`](verification-5.md).

## Previous builder handoff

## Result

**PASS — all 15 findings in adversarial review 1 are repaired.** The product
remains a Vite + TypeScript local-first PWA using IndexedDB, an isolated demo
database, a versioned service worker, and static `dist/` deployment. Its
training-card risograph visual system is preserved across app, legal, offline,
and 404 routes.

Live product: <https://durable-set-log.sociobot.in>

Implementation commit: `695032b`

Deployment ID: `d773a550-fa54-4592-b3ee-869e063e26b9`

Work order: `durable-set-log-polish-1`

## What changed

- Replaced first-screen implementation jargon with “Saved on this device” and
  “Saves each set before confirming it.” Related workflow copy now describes
  the user result instead of a device write.
- Expanded `.factory/claims.json` to 15 one-to-one claims. Added real tagged
  browser tests for no account/cloud sync and the medical disclaimer.
- Kept `/demo` and `?demo=1` as one-click sample paths. Live rechecks confirmed
  the `durable-set-log:demo` database, persistent banner, reset, exit, and zero
  leakage into real data.
- Rebuilt Privacy, Terms, 404, and offline pages around the shared branded
  skeleton. Added skip-link focus, complete navigation/footer, 44 px targets,
  route metadata, and a real styled HTTP 404 response.
- Rewrote every README sentence named by F-1-6 through F-1-15. Added an
  automated copy regression and refreshed the complete copy audit.
- Added the 93-character verb-first catalog line in
  `.factory/catalog-description.txt`.
- Bumped the product to v1.0.4 and the PWA shell to v8.

The finding-by-finding mapping is in `.factory/polish-1.md`.

## Clean-clone verification

Verified commit `695032b` from a new local clone with a clean `npm ci` install
(148 packages, 0 vulnerabilities):

| Check | Exact result |
| --- | --- |
| Type and lint | `npm run typecheck` PASS; `npm run lint` PASS |
| Unit/policy tests | `npm test` PASS: 9/9 at the verified implementation commit; current final tree adds 3 passing copy regressions for 12/12 |
| Production build | `npm run build` PASS; `dist/index.html` 60,893 bytes raw and 17,906 bytes gzip |
| Every declared claim | All 15 manifest commands run individually; 30/30 Playwright executions passed across desktop and 390 px mobile |
| Complete browser suite | `npm run test:e2e` PASS: 60 passed, 2 intentional desktop halves of mobile-only checks skipped |
| Accessibility | `npm run test:a11y` PASS: 8/8; full axe scans returned zero violations |
| Service-worker update | `npx playwright test tests/pwa-update.spec.ts` PASS: 2/2; old shell removed, v8 active, IndexedDB retained |
| Privacy | `@claim:local-privacy` and `@claim:no-account-or-sync` passed in both projects; normal demo requests were same-origin only |
| Offline | `@claim:offline-reload` passed in both projects; sample ledger survived a browser-offline reload |

`npm test` was rerun after the final copy regression was added: 12/12 passed.
Typecheck and lint also passed on the final tree.

## Performance and accessibility

Lighthouse 12.8.2 mobile results:

| Target | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Local production build | 100 | 100 | 100 | 100 | 1.8 s | 0 | 10 ms |
| Live custom domain | 100 | 100 | 100 | 100 | 1.4 s | 0 | 10 ms |

The initial single-file HTML, CSS, and JavaScript payload is 60.9 KB raw and
17.9 KB gzip. Legal CSS is 3.6 KB raw and 1.3 KB gzip. The mobile hero AVIF is
34.4 KB. All are below the product budgets.

The live Playwright axe pass found zero violations on `/`, `/?demo=1`,
`/privacy/`, `/terms/`, and `/404.html`. Live verifier runs found one h1, one
main landmark, `lang=en`, complete titles, no missing image alt text, no
unlabelled buttons, and no console errors.

## Deployment and live cold check

Deployed `dist/` through `/opt/fleet/lib/deploy-static.sh durable-set-log dist`.
Azure Static Web Apps completed deployment
`d773a550-fa54-4592-b3ee-869e063e26b9`; the custom domain returned HTTPS 200.

Fresh 390 × 844 contexts then confirmed:

- `/` returns 200 with the revised first-screen copy, no horizontal overflow,
  and a one-click `/demo` action.
- `/?demo=1` opens three realistic rows in `durable-set-log:demo`; Reset demo
  works; Start for real clears the sample workspace; the created demo routine
  was absent in real mode.
- A controlled offline reload kept the demo banner and Back squat row visible.
- Browser Back restored `/routines`, focused its h1, and restored its title.
- Privacy has the shared navigation/footer, no mobile overflow, and a working
  keyboard skip link that focuses main.
- `/definitely-not-a-route` returns HTTP 404 with the designed page, shared
  skeleton, `noindex`, recovery links, and no mobile overflow.
- Every internal link found on Privacy returned 200.
- Live response headers include CSP with response-header `frame-ancestors`,
  HSTS, Permissions-Policy, Referrer-Policy, and `nosniff`.

Built/live SHA-256 values match for `index.html`, `sw.js`, the manifest,
Privacy, Terms, 404, and legal CSS. Detailed results and screenshots are under
`.factory/evidence/polish-1/`.

## Run and verify

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run test:claims
npm run test:e2e
npm run test:a11y
```

## Known gaps and next steps

No known product, review, accessibility, privacy, offline, routing, mobile, or
deployment gaps remain. No further repair is required for this round.
