# Durable Set Log — independent verification 3 handoff

Work order: `durable-set-log-verify-3`

Candidate: `e395ff84aa85c7b4f38c688cbe70f4616d5a9dc0`

Verified URL: <https://durable-set-log.sociobot.in>

Date: 2026-08-29

## Result

**FAIL — do not release this candidate.** Core logging, durability, recovery,
privacy, performance, and deployment identity pass, but two release gates fail:

- Published paid-tier promises are absent from `.factory/claims.json` and have
  no exact tagged tests.
- Direct loads of `/demo/workout`, `/demo/routines`, and `/demo/more` request a
  nonexistent `/demo/art/...` preload and emit a 404 console error. Their
  relative manifest and apple-touch icon URLs also resolve to nonexistent
  `/demo/...` resources.

See [`.factory/verification-3.md`](verification-3.md) for exact evidence and all
severity-ranked findings.

## Verification summary

- `npm ci`: PASS, 148 packages, 0 vulnerabilities.
- All nine exact claim commands: PASS in desktop and mobile, 18 executions.
- `npm test`: PASS, 9/9.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; `dist/` produced.
- `npm run test:e2e`: PASS, 39 passed / 1 intentional desktop skip.
- `npm run test:a11y`: PASS, 8/8 configured serious/critical checks.
- Isolated SW update regression: PASS, 2/2 projects.
- Live offline reload: PASS, 10/10; local durability suite: 100/100 in each
  browser project.
- Live Lighthouse mobile: 95 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO; LCP 1.4 s, CLS 0.
- Live `/`, `/demo`, `/sw.js`, and manifest bytes hash-match the candidate
  build exactly.
- License API allowance: 30 successful requests; request 31 returned 429 with
  `Retry-After: 3`.

## Other defects

- Medium: axe reports `heading-order` on Routines, Ledger, More, and equivalent
  demo views because headings jump from `h1` to `h3`.
- Medium: several in-content/legal links are 21 px high at 390 px, below the
  supplied 44 px touch baseline.
- Medium: the required landing-page How it works, limits/privacy, and exact
  paid-tier sections are missing.
- Low: metaphor labels remain and the landing copy audit omits visible copy.

## How to reproduce

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run test:claims
npm run test:e2e
npm run test:a11y
/opt/fleet/lib/verify-url.sh https://durable-set-log.sociobot.in/demo/routines /tmp/durable-set-log-verify
```

The last command fails with the live console 404. In a browser on
`/demo/routines`, inspect the resolved `link[rel=manifest]`; it points to
`/demo/manifest.webmanifest`, which returns 404.

## Handoff notes

No product code, deployment, infrastructure, DNS, or billing configuration was
changed. Only this verification report and handoff were written. Pre-existing
unrelated `graphify-out` modifications were not touched or included.
