export const HOURLY_WINDOW = 12;

// Normalize a Date to the top of its hour (UTC) as an ISO string.
export function topOfHourUTC(date: Date): string {
  const d = new Date(date.getTime());
  d.setUTCMinutes(0, 0, 0);
  return d.toISOString();
}

// ISO keys for the current hour plus the next (HOURLY_WINDOW - 1) hours.
export function nextHourKeys(from: Date = new Date()): string[] {
  const base = new Date(from.getTime());
  base.setUTCMinutes(0, 0, 0);
  return Array.from({ length: HOURLY_WINDOW }, (_, i) =>
    new Date(base.getTime() + i * 3_600_000).toISOString()
  );
}
