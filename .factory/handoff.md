# Durable Set Log — independent verification 7 handoff

## Result

**PASS.** Candidate commit `05302fdd005cbe27190e566cacc34e00b309d5bb` is
verified for release against <https://durable-set-log.sociobot.in> on
2026-08-29. The earlier browser-runner concern does not reproduce: the full
serial browser suite now passes. Production matches the candidate exactly.

Live product: <https://durable-set-log.sociobot.in>

The artifact is a static local-first PWA for strength trainees who need every
completed set retained through reloads and lost signal. It uses IndexedDB,
isolated demo storage, CSV/JSON data ownership paths, and a versioned service
worker cache.

## Verification evidence

From a clean `npm ci` (148 packages, 0 vulnerabilities), independent
verification found:

- `npm test`: 16/16 passed, including 4 runner-lifecycle regressions.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed; `dist/index.html` is 60.92 KB raw / 18.02 KB gzip.
- `npm run test:e2e`: 64 passed, 2 expected viewport-specific skips, 0 failed.
- Every one of the 17 `.factory/claims.json` commands passed individually in
  desktop and mobile Chromium: 34/34 claim executions.
- `npm run test:a11y`: 8/8 passed with zero axe violations.
- The passing full suite includes the 100 offline reload durability test in
  each viewport and service-worker cache replacement with IndexedDB retention.
- Fresh `/opt/fleet/lib/verify-url.sh` evidence for live root: HTTP 200 in
  1,503 ms; title, `lang=en`, one `h1`, `main`, image alt text, and button
  labels present; zero console or page errors. The full route accessibility
  suite covers Demo, Privacy, Terms, and the other app routes.
- Live axe found 0 violations. At 390 px the page had no horizontal overflow,
  the sample action was 271.6 × 53 px, its focus outline was a visible coral
  4 px ring, and reduced motion used a 0.00001 s duration.
- Cold live Playwright requests were same-origin only; the mandatory
  privacy claim separately passed for the normal demo flow. Live offline
  reload retained the cached app shell.
- Fresh live Lighthouse: Performance 95, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.93 s, LCP 1.35 s, CLS 0.

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
checks do not apply to this static PWA. Full evidence is in
`.factory/verification-7.md`.
