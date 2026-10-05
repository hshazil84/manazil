'use client';
import { useEffect, useRef, useState } from 'react';
import { fmtDate, maleToday } from '@/lib/admin/time';
import { inputCls } from './ui';

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`; // m is 0-based
const parse = (s: string) => {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return { y, m: m - 1, d };
};
const WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const monthFmt = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const longFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/**
 * A date (and optionally time) picker in the site's own style. The browser's built-in
 * calendar cannot be styled, so this replaces <input type="date" | "datetime-local">.
 * value: "YYYY-MM-DD", or "YYYY-MM-DDTHH:mm" when `time` is set (the same strings those inputs use).
 */
export function DatePicker({
  value,
  onChange,
  min,
  time = false,
  placeholder = 'Choose a date',
}: {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  time?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const today = maleToday();
  const datePart = value ? value.slice(0, 10) : '';
  const timePart = time ? (value.length >= 16 ? value.slice(11, 16) : '12:00') : '';
  const [view, setView] = useState(() => {
    const p = parse(datePart || today);
    return { y: p.y, m: p.m };
  });

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', down);
      document.removeEventListener('keydown', key);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      const p = parse(datePart || today);
      setView({ y: p.y, m: p.m });
      const r = trigger.current?.getBoundingClientRect();
      setUp(!!r && r.bottom + (time ? 450 : 390) > window.innerHeight && r.top > 420);
    }
    setOpen((o) => !o);
  };

  const emit = (d: string, t: string) => onChange(time ? `${d}T${t}` : d);
  const isBefore = (d: string) => !!min && d < min;

  const pick = (d: string) => {
    if (isBefore(d)) return;
    emit(d, timePart || '12:00');
    if (!time) {
      setOpen(false);
      trigger.current?.focus();
    }
  };

  const shift = (delta: number) =>
    setView((v) => {
      const n = v.y * 12 + v.m + delta;
      return { y: Math.floor(n / 12), m: ((n % 12) + 12) % 12 };
    });

  // Days of the shown month, preceded by blanks so the 1st lands on its weekday.
  const lead = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay();
  const count = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];

  const hh = Number((timePart || '12:00').slice(0, 2));
  const mm = Number((timePart || '12:00').slice(3, 5));
  const setTime = (h: number, m: number) => emit(datePart || (min && min > today ? min : today), `${pad(h)}:${pad(m)}`);
  const stepBtn =
    'grid h-8 w-8 place-items-center rounded-full bg-mint-bg text-[15px] font-semibold text-mint transition hover:bg-mint/15 active:scale-95';
  const timeInput =
    'w-12 rounded-lg border border-ink/10 bg-white py-1.5 text-center text-[15px] font-semibold tabular-nums text-ink outline-none focus:border-mint focus:ring-2 focus:ring-mint/15';

  const label = value ? `${fmtDate(datePart)}${time ? ` · ${timePart}` : ''}` : placeholder;

  return (
    <div ref={wrap} className="relative">
      <button
        ref={trigger}
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`${inputCls} flex items-center justify-between gap-3 text-left ${value ? '' : 'text-ink/30'}`}
      >
        <span>{label}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-ink/40" aria-hidden>
          <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={time ? 'Choose date and time' : 'Choose date'}
          // A click on blank space inside a <label> would otherwise re-click the trigger and close this.
          onClick={(e) => e.preventDefault()}
          className={`absolute left-0 z-50 w-[19.5rem] max-w-[calc(100vw-2rem)] rounded-[22px] border border-ink/5 bg-white p-4 shadow-float ${up ? 'bottom-full mb-2' : 'top-full mt-2'}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={() => shift(-1)} aria-label="Previous month" className={stepBtn}>‹</button>
            <p className="font-serif text-[19px] leading-none">{monthFmt.format(new Date(Date.UTC(view.y, view.m, 1)))}</p>
            <button type="button" onClick={() => shift(1)} aria-label="Next month" className={stepBtn}>›</button>
          </div>

          <div className="grid grid-cols-7 text-center">
            {WEEK.map((w) => (
              <span key={w} className="pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink/35">{w}</span>
            ))}
            {cells.map((d, i) => {
              if (d === null) return <span key={`b${i}`} />;
              const iso = ymd(view.y, view.m, d);
              const selected = iso === datePart;
              const off = isBefore(iso);
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={off}
                  onClick={() => pick(iso)}
                  aria-label={longFmt.format(new Date(Date.UTC(view.y, view.m, d)))}
                  aria-pressed={selected}
                  aria-current={iso === today ? 'date' : undefined}
                  className={`mx-auto grid h-9 w-9 place-items-center rounded-full text-[14px] tabular-nums transition ${
                    selected
                      ? 'bg-mint font-semibold text-white'
                      : off
                        ? 'cursor-not-allowed text-ink/20'
                        : `hover:bg-mint-bg ${iso === today ? 'font-semibold text-gold ring-1 ring-gold/50' : 'text-ink'}`
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {time && (
            <div className="mt-3 border-t border-ink/5 pt-3">
              <div className="flex items-center justify-center gap-1.5" role="group" aria-label="Time">
                <button type="button" aria-label="Earlier hour" className={stepBtn} onClick={() => setTime((hh + 23) % 24, mm)}>−</button>
                <input
                  inputMode="numeric"
                  aria-label="Hour"
                  className={timeInput}
                  value={pad(hh)}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setTime(Math.min(23, parseInt(e.target.value.replace(/\D/g, '').slice(-2) || '0', 10)), mm)}
                />
                <button type="button" aria-label="Later hour" className={stepBtn} onClick={() => setTime((hh + 1) % 24, mm)}>+</button>
                <span className="px-0.5 text-[15px] font-semibold text-ink/40">:</span>
                <button type="button" aria-label="Earlier by 5 minutes" className={stepBtn} onClick={() => setTime(hh, (mm + 55) % 60)}>−</button>
                <input
                  inputMode="numeric"
                  aria-label="Minute"
                  className={timeInput}
                  value={pad(mm)}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setTime(hh, Math.min(59, parseInt(e.target.value.replace(/\D/g, '').slice(-2) || '0', 10)))}
                />
                <button type="button" aria-label="Later by 5 minutes" className={stepBtn} onClick={() => setTime(hh, (mm + 5) % 60)}>+</button>
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              disabled={isBefore(today)}
              onClick={() => {
                const p = parse(today);
                setView({ y: p.y, m: p.m });
                pick(today);
              }}
              className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-mint transition hover:bg-mint-bg disabled:opacity-40"
            >
              Today
            </button>
            {time && (
              <button type="button" onClick={() => { setOpen(false); trigger.current?.focus(); }} className="rounded-full bg-ink px-4 py-1.5 text-[13px] font-semibold text-white transition hover:bg-deep">
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
