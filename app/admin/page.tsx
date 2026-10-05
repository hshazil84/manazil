'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdmin } from '@/components/admin/AdminGate';
import { PageHead, Panel } from '@/components/admin/ui';
import { addDays, maleToday } from '@/lib/admin/time';

type Counts = { occasions: number | null; pinned: number | null; finder: number | null; banner: boolean | null };

export default function Overview() {
  const { sb } = useAdmin();
  const [c, setC] = useState<Counts>({ occasions: null, pinned: null, finder: null, banner: null });

  useEffect(() => {
    (async () => {
      const today = maleToday();
      const [o, d, f, b] = await Promise.all([
        sb.from('occasions').select('id', { count: 'exact', head: true }).eq('active', true).gt('starts_at', new Date().toISOString()),
        sb.from('daily_content').select('id', { count: 'exact', head: true }).gte('show_on', today).lte('show_on', addDays(today, 7)),
        sb.from('finder_logs').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 86400_000).toISOString()),
        sb.from('site_settings').select('value').eq('key', 'banner').maybeSingle(),
      ]);
      setC({
        occasions: o.error ? null : o.count,
        pinned: d.error ? null : d.count,
        finder: f.error ? null : f.count,
        banner: b.error ? null : !!(b.data?.value as { enabled?: boolean } | undefined)?.enabled,
      });
    })();
  }, [sb]);

  const cards = [
    { href: '/admin/occasions', title: 'Occasion messages', big: c.occasions, line: 'upcoming and on', hint: 'Eid and special-day reminders' },
    { href: '/admin/daily', title: 'Daily content', big: c.pinned, line: 'pinned in the next 7 days', hint: 'Verse, hadith and dua of the day' },
    { href: '/admin/finder', title: 'Verse Finder', big: c.finder, line: 'recordings in 24 hours', hint: 'Activity and failures' },
    { href: '/admin/site', title: 'Site content', big: null, line: c.banner === null ? '' : c.banner ? 'Banner is showing' : 'No banner showing', hint: 'Banner, store links, FAQ' },
  ];

  return (
    <>
      <PageHead title="Overview" sub="Everything you can change without releasing a new version of the app." />
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((x) => (
          <Link key={x.href} href={x.href}>
            <Panel className="h-full transition hover:-translate-y-0.5 hover:shadow-float">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">{x.title}</p>
              <p className="mt-2 font-serif text-[44px] leading-none">{x.big === null ? (x.title === 'Site content' ? '' : '–') : x.big}</p>
              <p className="mt-2 text-[14px] text-ink/60">{x.line || ' '}</p>
              <p className="mt-3 text-[13px] text-ink/40">{x.hint}</p>
            </Panel>
          </Link>
        ))}
      </div>
    </>
  );
}
