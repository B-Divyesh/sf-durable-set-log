# Durable Set Log

Durable Set Log is a tiny, offline-first workout ledger for strength trainees
who cannot afford to lose a confirmed set to a reload or poor signal. It has
reusable routines, a one-tap set action, append-only correction history,
CSV import/export, and full JSON backups. There is no account or cloud sync.

Live product: <https://durable-set-log.sociobot.in>

Try the isolated sample at <https://durable-set-log.sociobot.in/demo>. The
sample is stored in a separate browser database and is never mixed with a real
ledger.

## How durability works

Workout data is written to IndexedDB. A set confirmation appears only after its
immutable event has been added successfully. Editing a set appends a correction
event instead of changing the original. Active workout metadata and start/end
events are committed atomically. IDs use `crypto.randomUUID()`; CSV imports merge
by ID and safely rename conflicting foreign events instead of overwriting data.

The service worker precaches the complete app shell and serves it offline. Local
browser storage can still be removed by a person, browser, or operating system,
so the app includes portable CSV and JSON backup paths.

## Product tiers

Core logging, correction history, two routines, accessibility, and all data
exports are free. A US$14 one-time Sociobot license unlocks unlimited routines
and an on-device training summary. Checkout and verification use only
`https://api.sociobot.in/api/v1/...`; no payment provider is embedded.

## Develop and verify

Requires a current Node.js release and npm.

```sh
npm ci
npm run dev
npm test
npm run build
npm run test:e2e
npm run test:claims
```

The exact deploy build command is `npm run build`. Static output lands in
`dist/`, with `dist/index.html` at its root. Playwright is pinned to 1.58.2;
set `PLAYWRIGHT_BROWSERS_PATH` to the factory browser directory or run
`npx playwright install chromium` outside the worker image.

`npm test` covers CSV safety and correction folding. `npm run test:e2e` covers
keyboard/dialog accessibility, an axe serious/critical scan, append-only
corrections, and 100 consecutive offline reloads of a confirmed set.
`npm run test:claims` runs each published reliability, privacy, CSV, and demo
claim from the isolated `/demo` entry point. The mapping is in
[`.factory/claims.json`](.factory/claims.json).

## Data and privacy

No runtime CDN, third-party font, analytics SDK, ad tracker, or cloud workout
store is used. See [`public/privacy/index.html`](public/privacy/index.html) and
[`public/terms/index.html`](public/terms/index.html). Durable Set Log records
training; it is not medical guidance.

The researched opportunity is in [`.factory/brief.json`](.factory/brief.json),
the product-specific visual system and generated-asset provenance are in
[`.factory/design.md`](.factory/design.md), the sample sandbox is documented
in [`.factory/demo.md`](.factory/demo.md), and verification notes are in
[`.factory/handoff.md`](.factory/handoff.md).

## License

MIT. See [LICENSE](LICENSE).
