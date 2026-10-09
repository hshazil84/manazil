// Hijri helpers for /admin/hijri. Dates are plain "YYYY-MM-DD" strings (the
// Maldives calendar day), so the browser's time zone never shifts a date.
import { addDays } from './time';

export const HIJRI_MONTH_NAMES = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Akhir",
  'Jumada al-Ula',
  'Jumada al-Akhir',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

export type HijriDay = { y: number; m: number; d: number };
export type MonthRow = { hijri_year: number; hijri_month: number; starts_on: string };

const DAY_MS = 86_400_000;

function toUtc(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Whole days from a to b (positive when b is later). */
export function daysBetween(a: string, b: string): number {
  return Math.round((toUtc(b) - toUtc(a)) / DAY_MS);
}

const umalqura = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
});

/** The Umm al-Qura Hijri date, used as the "reference" when nothing is set. */
export function umalquraOf(iso: string): HijriDay {
  const parts = umalqura.formatToParts(new Date(toUtc(iso)));
  const get = (t: string) => parseInt(parts.find((p) => p.type === t)?.value ?? '0', 10);
  return { y: get('year'), m: get('month'), d: get('day') };
}

export function nextMonth(y: number, m: number): { y: number; m: number } {
  return m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 };
}

export function prevMonth(y: number, m: number): { y: number; m: number } {
  return m === 1 ? { y: y - 1, m: 12 } : { y, m: m - 1 };
}

export const monthKey = (y: number, m: number) => `${y}-${m}`;

/** First Gregorian day of each Hijri month (Umm al-Qura), for a window around [today]. */
export function referenceStarts(today: string): Map<string, string> {
  const out = new Map<string, string>();
  for (let i = -45; i <= 420; i++) {
    const iso = addDays(today, i);
    const h = umalquraOf(iso);
    if (h.d === 1) out.set(monthKey(h.y, h.m), iso);
  }
  return out;
}

/**
 * The Hijri date the app shows for [iso]: the latest set month start on or
 * before it (if less than 30 days back), otherwise the built-in calendar.
 */
export function appHijri(iso: string, rows: MonthRow[]): HijriDay {
  let best: MonthRow | null = null;
  for (const r of rows) {
    if (r.starts_on <= iso && (!best || r.starts_on > best.starts_on)) best = r;
  }
  if (best) {
    const into = daysBetween(best.starts_on, iso);
    if (into < 30) return { y: best.hijri_year, m: best.hijri_month, d: into + 1 };
  }
  return umalquraOf(iso);
}
