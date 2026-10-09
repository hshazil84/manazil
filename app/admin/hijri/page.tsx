'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdmin } from '@/components/admin/AdminGate';
import { Badge, Btn, PageHead, Panel, errText, useToast } from '@/components/admin/ui';
import { DatePicker } from '@/components/admin/DatePicker';
import { addDays, fmtDate, maleToday } from '@/lib/admin/time';
import {
  HIJRI_MONTH_NAMES,
  appHijri,
  daysBetween,
  monthKey,
  nextMonth,
  prevMonth,
  referenceStarts,
  type MonthRow,
} from '@/lib/admin/hijri';

const TABLE = 'hijri_months';
const monthName = (m: number) => HIJRI_MONTH_NAMES[m - 1];

export default function HijriMonths() {
  const { sb } = useAdmin();
  const toast = useToast();
  const [rows, setRows] = useState<MonthRow[] | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await sb.from(TABLE).select('hijri_year,hijri_month,starts_on').order('starts_on');
    if (error) {
      toast(errText(error), true);
      setRows([]);
    } else setRows(data as MonthRow[]);
  }, [sb, toast]);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHead
        title="Hijri months"
        sub="Set the day each Hijri month begins, as announced in the Maldives. Phones read this when the app opens, so a change shows the next time someone opens it with internet. No app update is needed."
      />
      {rows === null ? (
        <p className="py-6 text-[14px] text-ink/40">Loading…</p>
      ) : (
        <div className="space-y-5">
          <Tomorrow rows={rows} reload={load} />
          <Months rows={rows} reload={load} />
        </div>
      )}
    </>
  );
}

function Tomorrow({ rows, reload }: { rows: MonthRow[]; reload: () => void }) {
  const { sb } = useAdmin();
  const toast = useToast();
  const today = maleToday();
  const tomorrow = addDays(today, 1);
  const h = appHijri(today, rows);
  const next = nextMonth(h.y, h.m);
  const canContinue = h.d + 1 <= 30;
  const appTomorrow = appHijri(tomorrow, rows);
  const appSaysNew = appTomorrow.d === 1;

  const [choice, setChoice] = useState<'continue' | 'new' | null>(null);
  const [busy, setBusy] = useState(false);
  const picked = choice ?? (appSaysNew || !canContinue ? 'new' : 'continue');

  async function save() {
    setBusy(true);
    const out: MonthRow[] = [];
    // The current month needs its own row. Without it the app cannot tell that
    // tomorrow is meant to be day 30, and falls back to the built-in calendar.
    const hasCurrent = rows.some((r) => r.hijri_year === h.y && r.hijri_month === h.m);
    if (!hasCurrent) out.push({ hijri_year: h.y, hijri_month: h.m, starts_on: addDays(today, -(h.d - 1)) });
    out.push({ hijri_year: next.y, hijri_month: next.m, starts_on: picked === 'new' ? tomorrow : addDays(today, 2) });
    const { error } = await sb.from(TABLE).upsert(out, { onConflict: 'hijri_year,hijri_month' });
    setBusy(false);
    if (error) return toast(errText(error), true);
    toast(picked === 'new' ? `Saved: ${monthName(next.m)} begins tomorrow.` : `Saved: tomorrow is ${h.d + 1} ${monthName(h.m)}.`);
    setChoice(null);
    reload();
  }

  const opt = (on: boolean, disabled: boolean) =>
    `rounded-2xl border-2 px-4 py-4 text-center transition ${on ? 'border-mint bg-mint-bg' : 'border-ink/10 bg-white hover:border-ink/20'} ${
      disabled ? 'cursor-not-allowed opacity-40' : ''
    }`;

  return (
    <Panel>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">Tomorrow · {fmtDate(tomorrow)}</p>
      <h2 className="mt-1.5 text-[19px] font-bold">What is tomorrow?</h2>
      <p className="mt-1 text-[14px] leading-relaxed text-ink/60">
        Today is {h.d} {monthName(h.m)} {h.y}. Pick what the Maldives announces. The app currently shows tomorrow as {appTomorrow.d}{' '}
        {monthName(appTomorrow.m)}.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button type="button" aria-pressed={picked === 'continue'} disabled={!canContinue} onClick={() => setChoice('continue')} className={opt(picked === 'continue', !canContinue)}>
          <span className="block text-[18px] font-bold">{canContinue ? `${h.d + 1} ${monthName(h.m)}` : 'Not possible'}</span>
          <span className="block text-[12.5px] text-ink/55">{canContinue ? 'The month continues' : 'A month has at most 30 days'}</span>
        </button>
        <button type="button" aria-pressed={picked === 'new'} onClick={() => setChoice('new')} className={opt(picked === 'new', false)}>
          <span className="block text-[18px] font-bold">1 {monthName(next.m)}</span>
          <span className="block text-[12.5px] text-ink/55">New moon sighted</span>
        </button>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Btn onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Btn>
        <p className="text-[12.5px] text-ink/45">Phones update the next time the app is opened with internet.</p>
      </div>
    </Panel>
  );
}

function Months({ rows, reload }: { rows: MonthRow[]; reload: () => void }) {
  const { sb } = useAdmin();
  const toast = useToast();
  const today = maleToday();
  const refs = useMemo(() => referenceStarts(today), [today]);
  const now = appHijri(today, rows);

  const months = useMemo(() => {
    const out: { y: number; m: number }[] = [];
    let cur = prevMonth(now.y, now.m);
    for (let i = 0; i < 14; i++) {
      out.push(cur);
      cur = nextMonth(cur.y, cur.m);
    }
    return out;
  }, [now.y, now.m]);

  const [draft, setDraft] = useState<Record<string, string>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const clear = (key: string) =>
    setDraft((d) => {
      const rest = { ...d };
      delete rest[key];
      return rest;
    });

  async function save(y: number, m: number, value: string) {
    const key = monthKey(y, m);
    setBusyKey(key);
    const { error } = await sb.from(TABLE).upsert({ hijri_year: y, hijri_month: m, starts_on: value }, { onConflict: 'hijri_year,hijri_month' });
    setBusyKey(null);
    if (error) return toast(errText(error), true);
    toast(`Saved: ${monthName(m)} ${y} begins ${fmtDate(value)}.`);
    clear(key);
    reload();
  }

  async function reset(y: number, m: number) {
    const key = monthKey(y, m);
    setBusyKey(key);
    const { error } = await sb.from(TABLE).delete().eq('hijri_year', y).eq('hijri_month', m);
    setBusyKey(null);
    if (error) return toast(errText(error), true);
    toast(`${monthName(m)} ${y} is back to the built-in calendar.`);
    clear(key);
    reload();
  }

  return (
    <Panel>
      <h2 className="text-[19px] font-bold">Months</h2>
      <p className="mt-1 text-[14px] leading-relaxed text-ink/60">
        The reference is the Umm al-Qura calendar. It is there to help you spot a typo, and the app&apos;s built-in calendar can differ from it by a day.
      </p>
      <ul className="mt-3 divide-y divide-ink/5">
        {months.map(({ y, m }) => {
          const key = monthKey(y, m);
          const ref = refs.get(key);
          const row = rows.find((r) => r.hijri_year === y && r.hijri_month === m);
          const value = draft[key] ?? row?.starts_on ?? '';
          const dirty = value !== '' && value !== (row?.starts_on ?? '');
          const diff = ref && value ? daysBetween(ref, value) : 0;
          const far = Math.abs(diff) > 2;
          return (
            <li key={key} className="flex flex-wrap items-start gap-x-5 gap-y-3 py-4">
              <div className="min-w-0 basis-44">
                <p className="text-[15px] font-semibold">{monthName(m)} {y}</p>
                <p className="mt-0.5 text-[12.5px] text-ink/45">Reference: {ref ? fmtDate(ref) : 'not available'}</p>
              </div>
              <div className="min-w-0 flex-1 basis-56">
                <DatePicker value={value} onChange={(v) => setDraft((d) => ({ ...d, [key]: v }))} placeholder="Not set" />
                {diff !== 0 && (
                  <p className={`mt-1.5 text-[12.5px] ${far ? 'font-semibold text-[#a3341f]' : 'text-gold'}`}>
                    {Math.abs(diff)} day{Math.abs(diff) === 1 ? '' : 's'} {diff > 0 ? 'later' : 'earlier'} than the reference{far ? '. Check this date.' : ''}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 pt-1">
                {dirty ? (
                  <>
                    <Btn variant={far ? 'danger' : 'primary'} onClick={() => save(y, m, value)} disabled={busyKey === key}>
                      {far ? 'Save anyway' : 'Save'}
                    </Btn>
                    <Btn variant="ghost" onClick={() => clear(key)}>Cancel</Btn>
                  </>
                ) : row ? (
                  <>
                    <Badge>Set</Badge>
                    <Btn variant="ghost" onClick={() => reset(y, m)} disabled={busyKey === key}>Reset</Btn>
                  </>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
