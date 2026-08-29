export const PRODUCT_SLUG = 'durable-set-log';
export const CHECKOUT_URL = `https://api.sociobot.in/api/v1/products/${PRODUCT_SLUG}/checkout`;
let keySuffix = '';
const DAY = 86_400_000;

interface Verdict { valid: boolean; checkedAt: number; reason?: string }

export interface LicenseState { unlocked: boolean; checking: boolean; reason?: string; token?: string }

const tokenKey = () => `sb_license:${PRODUCT_SLUG}${keySuffix}`;
const verdictKey = () => `sb_license_verdict:${PRODUCT_SLUG}${keySuffix}`;

/** Keep the optional purchase state out of the real profile while trying the demo. */
export function useLicenseNamespace(namespace: 'real' | 'demo'): void {
  keySuffix = namespace === 'demo' ? ':demo' : '';
}

function readVerdict(): Verdict | undefined {
  try { return JSON.parse(localStorage.getItem(verdictKey()) ?? '') as Verdict; } catch { return undefined; }
}

export function captureReturnedLicense(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license')?.trim();
  if (!token) return;
  localStorage.setItem(tokenKey(), token);
  localStorage.setItem(verdictKey(), JSON.stringify({ valid: true, checkedAt: 0 } satisfies Verdict));
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function cachedLicenseState(): LicenseState {
  const token = localStorage.getItem(tokenKey()) ?? undefined;
  const verdict = readVerdict();
  return { token, unlocked: Boolean(token && verdict?.valid), checking: false, reason: verdict?.reason };
}

export async function verifyLicense(force = false): Promise<LicenseState> {
  const token = localStorage.getItem(tokenKey()) ?? undefined;
  if (!token) return { unlocked: false, checking: false };
  const cached = readVerdict();
  if (!force && cached && Date.now() - cached.checkedAt < DAY) {
    return { token, unlocked: cached.valid, checking: false, reason: cached.reason };
  }
  try {
    const response = await fetch(`https://api.sociobot.in/api/v1/products/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification unavailable');
    const result = await response.json() as { valid: boolean; reason?: string };
    const verdict = { valid: result.valid, reason: result.reason, checkedAt: Date.now() } satisfies Verdict;
    localStorage.setItem(verdictKey(), JSON.stringify(verdict));
    return { token, unlocked: result.valid, checking: false, reason: result.reason };
  } catch {
    return { token, unlocked: Boolean(cached?.valid), checking: false, reason: cached?.reason ?? 'offline' };
  }
}

export function storeLicense(token: string): void {
  localStorage.setItem(tokenKey(), token.trim());
  localStorage.removeItem(verdictKey());
}
