'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import { Btn, Field, ToastProvider, errText, inputCls } from './ui';

type Ctx = { sb: SupabaseClient; user: User };
const AdminCtx = createContext<Ctx | null>(null);
export function useAdmin() {
  const v = useContext(AdminCtx);
  if (!v) throw new Error('useAdmin outside AdminGate');
  return v;
}

type Phase = 'loading' | 'unconfigured' | 'signed-out' | 'not-admin' | 'ok';

const nav = [
  { href: '/admin', label: 'Overview', icon: 'M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z' },
  { href: '/admin/occasions', label: 'Occasions', icon: 'M12 3a6 6 0 0 0-6 6v3l-1.5 3h15L18 12V9a6 6 0 0 0-6-6Zm-2 14a2 2 0 0 0 4 0' },
  { href: '/admin/daily', label: 'Daily content', icon: 'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm0 5h15M9 2v4m6-4v4' },
  { href: '/admin/site', label: 'Site content', icon: 'M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Zm0 0h18M12 3c2.5 2.4 3.8 5.6 3.8 9S14.5 18.6 12 21c-2.5-2.4-3.8-5.6-3.8-9S9.5 5.4 12 3Z' },
  { href: '/admin/finder', label: 'Verse Finder', icon: 'M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-6 8a6 6 0 0 0 12 0m-6 6v4' },
];

function Icon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-wash to-cream px-5">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

function Login({ sb, notAdmin, email }: { sb: SupabaseClient; notAdmin: boolean; email?: string }) {
  const [e, setE] = useState('');
  const [p, setP] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setBusy(true);
    setErr('');
    const { error } = await sb.auth.signInWithPassword({ email: e.trim(), password: p });
    if (error) setErr(error.message);
    setBusy(false);
  }

  return (
    <Centered>
      <div className="mb-6 flex items-center gap-2.5">
        <Image src="/img/app-icon.png" alt="" width={36} height={36} className="rounded-[10px]" />
        <span className="font-serif text-[26px] leading-none">Manazil admin</span>
      </div>
      {notAdmin ? (
        <div className="rounded-2xl border border-ink/5 bg-white p-6 shadow-card">
          <p className="text-[15px] font-semibold">This account is not an admin.</p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink/60">
            {email} is signed in, but its user ID is not in the <code className="rounded bg-ink/5 px-1">admins</code> table. Add it in Supabase, then reload.
          </p>
          <Btn className="mt-5" variant="soft" onClick={() => sb.auth.signOut()}>Sign out</Btn>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-ink/5 bg-white p-6 shadow-card">
          <Field label="Email">
            <input className={inputCls} type="email" autoComplete="username" required value={e} onChange={(x) => setE(x.target.value)} />
          </Field>
          <Field label="Password">
            <input className={inputCls} type="password" autoComplete="current-password" required value={p} onChange={(x) => setP(x.target.value)} />
          </Field>
          {err && <p className="text-[13px] text-[#a3341f]">{err}</p>}
          <Btn type="submit" disabled={busy} className="w-full">{busy ? 'Signing in…' : 'Sign in'}</Btn>
        </form>
      )}
    </Centered>
  );
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const sb = getSupabase();

  useEffect(() => {
    if (!sb) {
      setPhase('unconfigured');
      return;
    }
    let live = true;
    async function check(u: User | null) {
      if (!live) return;
      setUser(u);
      if (!u) return setPhase('signed-out');
      const { data, error } = await sb!.rpc('is_admin');
      if (!live) return;
      setPhase(!error && data === true ? 'ok' : 'not-admin');
    }
    sb.auth.getSession().then(({ data }) => check(data.session?.user ?? null));
    const { data: sub } = sb.auth.onAuthStateChange((_ev, session) => {
      // Avoid awaiting Supabase calls inside this callback; defer them.
      setTimeout(() => check(session?.user ?? null), 0);
    });
    return () => {
      live = false;
      sub.subscription.unsubscribe();
    };
  }, [sb]);

  if (phase === 'loading') {
    return <Centered><p className="text-center text-[14px] text-ink/40">Loading…</p></Centered>;
  }
  if (phase === 'unconfigured' || !sb) {
    return (
      <Centered>
        <div className="rounded-2xl border border-ink/5 bg-white p-6 shadow-card">
          <p className="text-[15px] font-semibold">Supabase is not set up for this site.</p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink/60">
            Add <code className="rounded bg-ink/5 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="rounded bg-ink/5 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel (Settings → Environment Variables), then redeploy.
          </p>
        </div>
      </Centered>
    );
  }
  if (phase === 'signed-out') return <Login sb={sb} notAdmin={false} />;
  if (phase === 'not-admin') return <Login sb={sb} notAdmin email={user?.email} />;

  return (
    <AdminCtx.Provider value={{ sb, user: user! }}>
      <ToastProvider>
        <div className="min-h-screen bg-gradient-to-b from-wash to-cream lg:grid lg:grid-cols-[240px_1fr]">
          <aside className="border-b border-ink/5 bg-white/70 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-3 px-4 py-3 lg:flex-col lg:items-stretch lg:gap-6 lg:px-5 lg:py-6">
              <Link href="/admin" className="flex items-center gap-2.5">
                <Image src="/img/app-icon.png" alt="" width={30} height={30} className="rounded-[9px]" />
                <span className="font-serif text-[22px] leading-none">Manazil <span className="text-ink/40">admin</span></span>
              </Link>
              <nav className="hidden flex-col gap-1 lg:flex">
                {nav.map((n) => {
                  const on = n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href);
                  return (
                    <Link key={n.href} href={n.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-medium transition ${on ? 'bg-mint-bg text-mint' : 'text-ink/65 hover:bg-ink/5'}`}>
                      <Icon d={n.icon} /> {n.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="hidden lg:mt-auto lg:block">
                <p className="truncate text-[12.5px] text-ink/45">{user?.email}</p>
                <div className="mt-2 flex gap-1">
                  <Link href="/" className="rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-ink/60 hover:bg-ink/5">View site</Link>
                  <button onClick={() => sb.auth.signOut()} className="rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-ink/60 hover:bg-ink/5">Sign out</button>
                </div>
              </div>
              <button onClick={() => sb.auth.signOut()} className="rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-ink/60 hover:bg-ink/5 lg:hidden">Sign out</button>
            </div>
            <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:hidden">
              {nav.map((n) => {
                const on = n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href);
                return (
                  <Link key={n.href} href={n.href} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold ${on ? 'bg-mint-bg text-mint' : 'text-ink/60'}`}>
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
          <main className="min-w-0 px-4 py-7 sm:px-8 lg:py-10">
            <div className="mx-auto max-w-4xl">{children}</div>
          </main>
        </div>
      </ToastProvider>
    </AdminCtx.Provider>
  );
}
