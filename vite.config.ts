import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

/** `/demo` is a concrete document so unknown URLs can retain a true 404 status. */
const demoEntry = {
  name: 'durable-set-log-demo-entry',
  closeBundle() {
    const output = resolve(process.cwd(), 'dist');
    mkdirSync(resolve(output, 'demo'), { recursive: true });
    copyFileSync(resolve(output, 'index.html'), resolve(output, 'demo/index.html'));
  },
};

export default defineConfig({
  plugins: [viteSingleFile({ removeViteModuleLoader: true }), demoEntry],
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsInlineLimit: 2048,
  },
  server: { host: '127.0.0.1' },
});
