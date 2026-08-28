export function localId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function isoNow(): string {
  return new Date().toISOString();
}
