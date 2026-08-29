# Durable Set Log — adversarial review 2 handoff

## Result

**FAIL.** This review changed no product code. It wrote
`.factory/review-2.md` and found four remaining release findings:

1. Two README payment statements are unlisted claims (F-2-1).
2. The 404 document lacks a canonical URL (F-2-2).
3. Its h1 uses a product metaphor instead of “Page not found” (F-2-3).
4. Landing backup copy exposes CSV/JSON file-format jargon without explaining
   the choice (F-2-4).

## Verification performed

- Fresh 390px and desktop live visits confirmed the product, audience, and
  primary sample action are clear before scrolling; no cold-console error or
  horizontal overflow occurred.
- Live demo opened in one click with three realistic saved sample sets. Reset
  removed a created demo routine and reseeded the sample; Start for real left
  it out of real mode.
- A fresh temporary clone ran `npm ci` and each of the 15 commands declared in
  `.factory/claims.json`; all passed in desktop and mobile (30 executions).
  `npm run test:claims` also passed 30/30 in the checked-out worktree.
- Current worktree checks passed: `npm test` (12/12), `npm run build`, and
  `npm run lint`.
- Live route/link, metadata, header, privacy-request, offline/demo, history,
  404, and earlier-finding checks are detailed in `review-2.md`.

## Known gaps / next steps

Implement F-2-1 through F-2-4 and repeat the entire independent review. The
existing unrelated `graphify-out` modifications were preserved and are not part
of this review commit.
