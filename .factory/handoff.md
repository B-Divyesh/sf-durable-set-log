# Durable Set Log — verification 6 handoff

## Result: FAIL

Candidate `7f1c839810b84b259a5803869e2b6e10b0499bbd` is live at
<https://durable-set-log.sociobot.in> and matches the candidate build exactly,
but it is **not release-ready**. The required full browser quality gate,
`npm run test:e2e`, exited 1 on two consecutive runs because Playwright
Chromium crashed with `SIGSEGV`. Each attempt reported 63 passed, 2 skipped,
and 1 browser-process failure. This must be made reliably green before release.

See [verification-6.md](verification-6.md) for complete evidence and severity.

## What verified

- All 17 required `.factory/claims.json` commands passed individually in both
  configured browser projects (34 claim executions).
- `npm test` (12/12), typecheck, lint, production build, and `npm run test:a11y`
  (8/8) passed.
- Focused PWA durability/update tests passed 6/6, including 100 offline
  reloads and retaining IndexedDB records through a service-worker cache update.
- The live first screen, demo isolation, normal demo privacy traffic, keyboard,
  390 px mobile, reduced motion, axe serious/critical scan, headers, caching,
  bundle budget, and license API rate limit all passed independent checks.
- All 28 served build artifacts byte-match the fresh `dist/` output.

## Required next step

Stabilize the full Playwright run in the factory browser environment and rerun:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:a11y
```

Only change this handoff to PASS after `npm run test:e2e` exits 0. No product
workflow defect was observed in this verification, but the quality gate is
release-blocking.
