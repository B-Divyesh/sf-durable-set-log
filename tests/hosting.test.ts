import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('static hosting release safeguards', () => {
  const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8')) as {
    globalHeaders: Record<string, string>;
    responseOverrides: Record<string, { rewrite: string; statusCode: number }>;
  };

  it('ships CSP and Permissions-Policy response headers', () => {
    expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(config.globalHeaders['Content-Security-Policy']).toContain('https://api.sociobot.in');
    expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
  });

  it('serves the designed 404 document with a 404 status', () => {
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
    expect(readFileSync('public/404.html', 'utf8')).toContain('That page is not in this log.');
  });
});
