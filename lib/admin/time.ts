// The Maldives is UTC+05:00 all year (no daylight saving).
const OFFSET_MS = 5 * 3600 * 1000;

/** A <input type="datetime-local"> value ("2027-03-09T20:00") read as Maldives time → ISO with +05:00. */
export function maleISO(local: string): string {
  return `${local.length === 16 ? local + ':00' : local}+05:00`;
}

/** ISO instant → value for <input type="datetime-local">, in Maldives time. */
export function maleInput(iso: string): string {
  return new Date(new Date(iso).getTime() + OFFSET_MS).toISOString().slice(0, 16);
}

/** Today's date in the Maldives, "YYYY-MM-DD". */
export function maleToday(): string {
  return new Date(Date.now() + OFFSET_MS).toISOString().slice(0, 10);
}

export function addDays(date: string, n: number): string {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const dt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Indian/Maldives',
  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hour12: false,
});
const d = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const t = new Intl.DateTimeFormat('en-GB', { timeZone: 'Indian/Maldives', hour: '2-digit', minute: '2-digit', hour12: false });

export const fmtMale = (iso: string) => dt.format(new Date(iso)).replace(',', '');
export const fmtMaleTime = (iso: string) => t.format(new Date(iso));
/** "2027-03-09" → "Tue 9 Mar 2027" */
export const fmtDate = (date: string) => d.format(new Date(date + 'T00:00:00Z')).replace(',', '');
