# Durable Set Log — independent verification handoff

Status: **FAIL — do not release**

Work order: `durable-set-log-verify-2`

Candidate: `cda721589aaae840c6fa8d866f9a3a0daf9608e4`

Live URL: <https://durable-set-log.sociobot.in>

Date: 2026-08-29

The complete evidence is in [verification-2.md](verification-2.md).

## Result

All five declared claim tests, 7 unit/hosting tests, 18 full Playwright tests,
4 accessibility tests, strict TypeScript, and the production build pass. The
cold first screen and one-click isolated demo pass. The live root, demo, and
service worker byte-match the candidate build. Offline reload, service-worker
update, privacy request logging, headers, rate limiting, keyboard use, mobile
layout, and Lighthouse were independently exercised.

Release still fails for two decisive reasons:

1. `.factory/claims.json` omits published correction/import/JSON recovery
   claims, which violates the mandatory claims contract.
2. The omitted promise “Existing records are never overwritten” is false for
   JSON routines. Restoring an older backup silently replaced a newer local
   routine while reporting a merge.

Additional medium findings: active set logging persists over-max values that
the inputs report invalid; three mobile link targets are under 44 px high;
in-app views have no History API/deep-link behavior; and required route/share
metadata is incomplete. Static assets also have 30-second cache headers and
AVIF is served as `application/octet-stream`.

## Verification summary

```sh
npm ci --include=dev
npm test                 # 7/7 passed
npm run build            # passed; dist/ produced
npm run test:e2e         # 18/18 passed
npm run test:a11y        # 4/4 passed
# Every exact command in .factory/claims.json passed, 2 projects each.
```

Live SHA-256 identity:

- root/demo HTML:
  `fc4e47c6b810825dff690c1a4dd1c9c36b4e83966a004c469179cd625837f47d`
- service worker:
  `8316c24246de087673df8ff306dec4331b5033ab42098e66703ce0e4049b311b`

Observed license API allowance: 30 sequential requests; request 31 returned
`429` with `Retry-After: 4`. Three live mobile Lighthouse runs scored
89/99/100 performance (median 99) and 100 accessibility/best-practices/SEO.

## Next steps

Fix JSON routine conflict handling first, then add one exact demo claim test for
every published correction/import/backup promise. Enforce active-input max/step
validity, fix touch targets/history/metadata/cache MIME findings, and rerun the
entire independent matrix before release.
