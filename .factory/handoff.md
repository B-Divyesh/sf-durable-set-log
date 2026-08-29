# Durable Set Log — repair 4 handoff

## Result

**PASS.** Release blocker from verifier report commit
`044747b46a333c585803d44ce346b139a867eb94` is repaired in implementation
commit `fb19e3a521170087dcb97551e7d0115f89562fa0`, pushed to `main`, and deployed
as Azure Static Web Apps deployment `b4943264-c461-4f70-86b6-e79680e21949`.

Live product: <https://durable-set-log.sociobot.in>

The artifact remains a static local-first PWA. Product behavior, researched
scope, visual identity, storage, service worker, and payment integration were
not changed.

## Reproduction and root cause

Two initial clean attempts with the candidate runner passed, confirming the
intermittent nature reported by the verifier. A subsequent full stress run
reproduced the exact blocker after 63 passes and 2 skips:

- Mobile `@claim:license-revocation` failed while opening a new context.
- The reused `chromium_headless_shell-1208` process exited on signal 11.
- Chromium reported `SEGV_MAPERR 0000000001b0`.
- The failing assertion varied from the verifier's other run, so this was a
  browser-process lifecycle failure rather than a product behavior failure.

The pinned Playwright 1.58.2 installation includes both the legacy headless
shell and full bundled Chromium. Long runs were using the crashing legacy
shell.

## Repair

- `npm run test:e2e` now sets `CI=1` and explicitly passes `--workers=1`.
- Both projects use Playwright's bundled full Chromium channel and its new
  headless mode instead of `chrome-headless-shell`.
- Offline reload, 100-reload durability, and service-worker update tests now
  create dedicated contexts. Their `finally` path restores online state,
  closes the page and context, and checks that Chromium released the context.
- The preview server uses a strict port, never reuses an existing server, and
  has an explicit 5-second `SIGTERM` shutdown policy.
- `tests/e2e-lifecycle.test.ts` prevents regressions to the pinned browser,
  CI/worker policy, old headless shell, reused server, or implicit PWA context
  teardown.

## Verification evidence

From a clean `npm ci` (148 packages, 0 vulnerabilities):

- `npm test`: 16/16 passed, including 4 runner-lifecycle regressions.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed; `dist/index.html` is 60.92 KB raw / 18.02 KB gzip.
- `npm run test:e2e`: 64 passed, 2 expected viewport-specific skips, 0 failed.
- Stability check: four consecutive post-fix full-suite runs passed. The
  preview port was closed after each run.
- Every one of the 17 `.factory/claims.json` commands passed individually in
  desktop and mobile Chromium: 34/34 claim executions.
- `npm run test:claims`: 34/34 passed in the final clean sequence.
- `npm run test:a11y`: 8/8 passed with zero axe violations.
- `npx playwright test tests/pwa-update.spec.ts tests/durability.spec.ts`: 6/6
  passed, including 100 offline reloads in each viewport and service-worker
  cache replacement with IndexedDB retention.
- Factory URL checks passed locally and live for root, Demo, Privacy, and
  Terms: correct title/lang/single h1/main, no missing alt text or unlabelled
  buttons, and no console or page errors. Screenshots and reports are under
  `.factory/evidence/repair-4/`.
- Live axe checks on five routes at 1440 px and 390 px found 0 violations.
  Keyboard skip-link, Enter/Escape dialog behavior, and focus restoration
  passed. The 390 px page had no horizontal overflow.
- The live demo workout made 4 requests, all same-origin. Live offline reload
  retained the sample ledger. Reduced-motion mode had 0 running animations.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.4 s; CLS 0; transferred weight 146 KiB.

## Deployment and identity

- All 28 publicly served artifacts matched the fresh `dist/` files byte for
  byte.
- Live and local `index.html` SHA-256:
  `d6ee2ff94e09be3e6e376d277b0f3fc201c3e58d8b7d0f852d198663d3ad3fb0`.
- An unknown route returns HTTP 404 with the designed page.
- Root responses include HSTS, response-header CSP with
  `frame-ancestors 'none'`, strict-origin referrer policy, `nosniff`, and the
  restrictive Permissions-Policy. `/sw.js` is `no-cache, max-age=0`; hashed
  art is immutable for one year.

## Run locally

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:a11y
npm run test:claims
```

## Known gaps

None. Package/consumer, backend concurrency, health endpoint, and sign-in
checks do not apply to this static PWA.
