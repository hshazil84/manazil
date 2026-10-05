'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export const inputCls =
  'w-full rounded-xl border border-ink/10 bg-white px-3.5 py-2.5 text-[14.5px] text-ink outline-none transition placeholder:text-ink/30 focus:border-mint focus:ring-2 focus:ring-mint/15';

export function Btn({
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' | 'soft' }) {
  const tone = {
    primary: 'bg-ink text-white hover:bg-deep disabled:bg-ink/30',
    soft: 'bg-mint-bg text-mint hover:bg-mint/15 disabled:opacity-50',
    ghost: 'text-ink/65 hover:bg-ink/5 disabled:opacity-40',
    danger: 'text-[#a3341f] hover:bg-[#a3341f]/10 disabled:opacity-40',
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-semibold transition disabled:cursor-not-allowed ${tone} ${className}`}
    />
  );
}

export function Field({ label, hint, children, className = '' }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[12.5px] font-semibold text-ink/70">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[12px] leading-snug text-ink/45">{hint}</span>}
    </label>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-[24px] w-[42px] shrink-0 rounded-full transition-colors ${on ? 'bg-mint' : 'bg-ink/15'}`}
    >
      <motion.span
        animate={{ x: on ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="absolute left-0 top-[2px] h-[20px] w-[20px] rounded-full bg-white shadow"
      />
    </button>
  );
}

export function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6 ${className}`}>{children}</section>;
}

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-[34px] leading-tight tracking-tight sm:text-[40px]">{title}</h1>
        {sub && <p className="mt-1 max-w-xl text-[14.5px] leading-relaxed text-ink/55">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({ children, tone = 'mint' }: { children: React.ReactNode; tone?: 'mint' | 'gold' | 'grey' | 'red' }) {
  const c = {
    mint: 'bg-mint-bg text-mint',
    gold: 'bg-gold/10 text-gold',
    grey: 'bg-ink/5 text-ink/55',
    red: 'bg-[#a3341f]/10 text-[#a3341f]',
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${c}`}>{children}</span>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-ink/10 px-4 py-8 text-center text-[14px] text-ink/45">{children}</div>;
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/30 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ y: 28, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 28, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal
            aria-label={title}
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-cream p-5 shadow-float sm:rounded-3xl sm:p-7"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-[26px] leading-none tracking-tight">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full text-ink/50 hover:bg-ink/5">
                <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m2 2 8 8M10 2l-8 8" /></svg>
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ------------------------------------------------------------------ toasts

type Toast = { id: number; text: string; bad?: boolean };
const ToastCtx = createContext<(text: string, bad?: boolean) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((text: string, bad?: boolean) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, text, bad }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), bad ? 6000 : 2600);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[90] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`pointer-events-auto max-w-md rounded-full px-5 py-2.5 text-[13.5px] font-medium shadow-float ${t.bad ? 'bg-[#a3341f] text-white' : 'bg-ink text-white'}`}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/** Turns a Supabase error into something readable. */
export function errText(e: unknown): string {
  const m = (e as { message?: string })?.message ?? String(e);
  if (/row-level security|permission denied/i.test(m)) return 'Not allowed. Is this account in the admins table?';
  if (/relation .* does not exist|schema cache/i.test(m)) return 'A table is missing. Run supabase/admin.sql in Supabase first.';
  return m;
}
