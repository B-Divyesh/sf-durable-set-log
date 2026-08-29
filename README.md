# Durable Set Log

Log strength sets on your phone, even without signal. Confirmed sets remain
after reloads. Create repeatable routines, save sets with one tap, correct
entries without deleting them, and import or export backups. There is no
account or cloud sync.

Live product: <https://durable-set-log.sociobot.in>

Try the isolated sample at <https://durable-set-log.sociobot.in/demo>. The
sample uses separate browser storage. It never mixes with your real records.

## How records stay safe

Your workout records are saved in this browser. The app confirms a set only
after it saves it. Correcting a set keeps the earlier value visible. Starting
or finishing a workout saves its status and history together. Importing a file
keeps your existing records when entries conflict.

After your first visit, the app can open without a signal. Browser storage can
still be cleared, so export a backup you need to keep.

## Product tiers

Free includes two routines, set logging, corrections, and exports. Pay US$14
once for unlimited routines and an on-device training summary. Sociobot handles
checkout and license checks. The app does not embed a payment provider.

## Run locally

Use a current Node.js release and npm.

```sh
npm ci
npm run typecheck
npm run lint
npm run dev
npm test
npm run build
npm run test:e2e
npm run test:claims
```

The build command is `npm run build`. Static files appear in `dist/`, with
`dist/index.html` at its root. Playwright 1.58.2 is pinned. Use the factory
browser directory or run `npx playwright install chromium` when needed.

## Deployment notes

Deploy `dist/` through the factory static-site work order. The deployment
configuration sets security headers, caching, and the 404 page.

## Contributor verification

`npm test` checks data handling and hosting rules. `npm run test:e2e` checks the
workout flow, keyboard use, mobile controls, recovery, and offline reloads.
`npm run test:claims` checks each published promise with the sample workout.
The claim list is in [`.factory/claims.json`](.factory/claims.json).

## Data and privacy

The app loads no ads, tracking tools, third-party fonts, or cloud workout
storage while you log. Read the [Privacy notice](public/privacy/index.html) and
[Terms](public/terms/index.html). Durable Set Log records training. It does not
provide medical guidance.

## Factory records

- [Research brief](.factory/brief.json)
- [Visual system and asset sources](.factory/design.md)
- [Sample data guide](.factory/demo.md)
- [Build and release evidence](.factory/handoff.md)

## License

MIT. See [LICENSE](LICENSE).
