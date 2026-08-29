# Durable Set Log demo

Open [`/demo`](https://durable-set-log.sociobot.in/demo) or `/?demo=1` to try
the product without setup. The landing page also has a **Try it with sample
data** action.

The demo seeds a Tuesday strength workout: back squat, bench press, and
chest-supported row, with a completed sample ledger. It uses the separate
IndexedDB database `durable-set-log:demo`; real records use `durable-set-log`.
Optional demo license state is separately namespaced in localStorage too.

The banner remains visible in demo mode. **Reset demo** clears and reseeds only
the demo database. **Start for real** clears the demo database and opens `/`.
Nothing entered while the banner is present is read from or written to the real
ledger.
