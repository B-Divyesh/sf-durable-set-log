import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('static hosting release safeguards', () => {
  const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8')) as {
    globalHeaders: Record<string, string>;
    routes: Array<{ route: string; headers: Record<string, string> }>;
    responseOverrides: Record<string, { rewrite: string; statusCode: number }>;
    navigationFallback?: unknown;
    mimeTypes: Record<string, string>;
  };

  it('ships CSP and Permissions-Policy response headers', () => {
    expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(config.globalHeaders['Content-Security-Policy']).toContain('https://api.sociobot.in');
    expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
  });

  it('serves the designed 404 document with a 404 status', () => {
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
    const notFound = readFileSync('public/404.html', 'utf8');
    expect(notFound).toContain('Page not found.');
    expect(notFound).toContain('<link rel="canonical" href="https://durable-set-log.sociobot.in/404.html">');
    expect(config.navigationFallback).toBeUndefined();
  });

  it('keeps the demo as a concrete document and declares its manifest MIME type', () => {
    const index = readFileSync('index.html', 'utf8');
    const manifest = readFileSync('public/manifest.webmanifest', 'utf8');
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
    expect(config.mimeTypes['.avif']).toBe('image/avif');
    expect(config.routes.find(({ route }) => route === '/art/*')?.headers['Cache-Control']).toContain('immutable');
    expect(config.routes.find(({ route }) => route === '/icons/*')?.headers['Cache-Control']).toContain('immutable');
    expect(readFileSync('public/sitemap.xml', 'utf8')).toContain('/demo');
    expect(index).toMatch(/durable-set-log-share\.[a-f0-9]{8}\.jpg/);
    expect(index).toMatch(/ledger-stamp-640\.[a-f0-9]{8}\.avif/);
    expect(manifest).toMatch(/icon-192\.[a-f0-9]{8}\.png/);
  });

  it('ships a versioned service worker with a safe update path', () => {
    const worker = readFileSync('public/sw.js', 'utf8');
    expect(worker).toContain("durable-set-log-shell-v8");
    expect(worker).toContain('SKIP_WAITING');
    expect(worker).toContain('self.clients.claim()');
    expect(worker).toContain("key !== CACHE");
  });
});
