import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const routeDocuments = [
  { path: 'routines', title: 'Routines — Durable Set Log', description: 'Create and edit reusable strength routines stored in this browser.' },
  { path: 'ledger', title: 'Set ledger — Durable Set Log', description: 'Inspect completed strength sets and append corrections without erasing history.' },
  { path: 'more', title: 'More — Durable Set Log', description: 'Back up, restore, import, export, and inspect local Durable Set Log data.' },
  { path: 'demo', title: 'Demo — Durable Set Log', description: 'Try a separate sample strength ledger without changing your real data.' },
  { path: 'demo/workout', title: 'Demo workout — Durable Set Log', description: 'Try a sample workout in a separate browser ledger.' },
  { path: 'demo/routines', title: 'Demo routines — Durable Set Log', description: 'Create and edit sample routines in a separate browser ledger.' },
  { path: 'demo/more', title: 'Demo data tools — Durable Set Log', description: 'Try backup, restore, import, and export with separate sample data.' },
];

/** Concrete route documents preserve deep links while unknown URLs retain a true 404 status. */
const concreteRoutes = {
  name: 'durable-set-log-demo-entry',
  closeBundle() {
    const output = resolve(process.cwd(), 'dist');
    const rootDocument = readFileSync(resolve(output, 'index.html'), 'utf8');
    for (const route of routeDocuments) {
      const canonical = `https://durable-set-log.sociobot.in/${route.path}`;
      const document = rootDocument
        .replace(/<title>[^<]+<\/title>/, `<title>${route.title}</title>`)
        .replace(/(<link rel="canonical" href=")[^"]+/, `$1${canonical}`)
        .replace(/(<meta property="og:title" content=")[^"]+/, `$1${route.title}`)
        .replace(/(<meta property="og:description" content=")[^"]+/, `$1${route.description}`)
        .replace(/(<meta property="og:url" content=")[^"]+/, `$1${canonical}`)
        .replace(/(<meta name="description" content=")[^"]+/, `$1${route.description}`)
        .replace(/(<meta name="twitter:title" content=")[^"]+/, `$1${route.title}`)
        .replace(/(<meta name="twitter:description" content=")[^"]+/, `$1${route.description}`);
      const directory = resolve(output, route.path);
      mkdirSync(directory, { recursive: true });
      writeFileSync(resolve(directory, 'index.html'), document);
    }
  },
};

export default defineConfig({
  plugins: [viteSingleFile({ removeViteModuleLoader: true }), concreteRoutes],
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsInlineLimit: 2048,
  },
  server: { host: '127.0.0.1' },
});
