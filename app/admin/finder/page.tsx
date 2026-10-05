'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdmin } from '@/components/admin/AdminGate';
import { Badge, Btn, Empty, PageHead, Panel, errText, useToast } from '@/components/admin/ui';
import { fmtMale } from '@/lib/admin/time';

type Log = {
  id: string; created_at: string; ok: boolean; model: string | null; audio_bytes: number | null;
  audio_type: string | null; duration_ms: number | null; recognised: string | null; error: string | null;
};

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-ink/5 bg-white p-4 shadow-card">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">{label}</p>
      <p className="mt-1 font-serif text-[32px] leading-none">{value}</p>
      {sub && <p className="mt-1.5 text-[12.5px] text-ink/45">{sub}</p>}
    </div>
  );
}

export default function Finder() {
  const { sb } = useAdmin();
  const toast = useToast();
  const [rows, setRows] = useState<Log[] | null>(null);
  const [filter, setFilter] = useState<'all' | 'ok' | 'empty' | 'failed'>('all');

  const load = useCallback(async () => {
    const since = new Date(Date.now() - 30 * 86400_000).toISOString();
    const { data, error } = await sb.from('finder_logs').select('*').gte('created_at', since).order('created_at', { ascending: false }).limit(1000);
    if (error) { toast(errText(error), true); setRows([]); } else setRows(data as Log[]);
  }, [sb, toast]);
  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const all = rows ?? [];
    const now = Date.now();
    const day = all.filter((r) => now - +new Date(r.created_at) < 86400_000);
    const week = all.filter((r) => now - +new Date(r.created_at) < 7 * 86400_000);
    const failed = week.filter((r) => !r.ok).length;
    const empty = week.filter((r) => r.ok && !(r.recognised ?? '').trim()).length;
    const dur = week.filter((r) => r.ok && r.duration_ms).map((r) => r.duration_ms as number).sort((a, b) => a - b);
    return {
      day: day.length, week: week.length, failed, empty,
      okRate: week.length ? Math.round(((week.length - failed - empty) / week.length) * 100) : null,
      median: dur.length ? dur[Math.floor(dur.length / 2)] : null,
    };
  }, [rows]);

  const shown = (rows ?? []).filter((r) =>
    filter === 'all' ? true : filter === 'failed' ? !r.ok : filter === 'empty' ? r.ok && !(r.recognised ?? '').trim() : r.ok && !!(r.recognised ?? '').trim(),
  ).slice(0, 150);

  async function purge() {
    if (!window.confirm('Delete every log row older than 30 days?')) return;
    const cutoff = new Date(Date.now() - 30 * 86400_000).toISOString();
    const { error } = await sb.from('finder_logs').delete().lt('created_at', cutoff);
    if (error) return toast(errText(error), true);
    toast('Old rows deleted.');
    load();
  }

  const tabs: [typeof filter, string][] = [['all', 'All'], ['ok', 'Recognised'], ['empty', 'Nothing heard'], ['failed', 'Failed']];

  return (
    <>
      <PageHead
        title="Verse Finder activity"
        sub="One row for every recording sent for recognition: time, size, whether it worked and the text heard. No audio is kept."
        action={<div className="flex gap-2"><Btn variant="soft" onClick={load}>Refresh</Btn><Btn variant="ghost" onClick={purge}>Delete older than 30 days</Btn></div>}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Last 24 hours" value={String(stats.day)} sub="recordings" />
        <Stat label="Last 7 days" value={String(stats.week)} sub="recordings" />
        <Stat label="Worked" value={stats.okRate === null ? '–' : `${stats.okRate}%`} sub={`${stats.empty} heard nothing · ${stats.failed} failed`} />
        <Stat label="Typical time" value={stats.median === null ? '–' : `${(stats.median / 1000).toFixed(1)}s`} sub="median, successful" />
      </div>

      <Panel className="mt-5">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${filter === id ? 'bg-ink text-white' : 'bg-ink/5 text-ink/60 hover:bg-ink/10'}`}>{label}</button>
          ))}
        </div>
        {rows === null ? (
          <p className="py-6 text-[14px] text-ink/40">Loading…</p>
        ) : shown.length === 0 ? (
          <Empty>{rows.length === 0 ? 'No activity yet. Rows appear once the updated transcribe function is deployed and someone uses Verse Finder.' : 'No rows match.'}</Empty>
        ) : (
          <ul className="divide-y divide-ink/5">
            {shown.map((r) => (
              <li key={r.id} className="py-3.5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-[13px] font-medium text-ink/70">{fmtMale(r.created_at)}</span>
                  {!r.ok ? <Badge tone="red">Failed</Badge> : (r.recognised ?? '').trim() ? <Badge>Recognised</Badge> : <Badge tone="gold">Nothing heard</Badge>}
                  <span className="text-[12px] text-ink/40">
                    {r.audio_bytes != null && `${Math.round(r.audio_bytes / 1024)} KB`}
                    {r.duration_ms != null && ` · ${(r.duration_ms / 1000).toFixed(1)}s`}
                    {r.model && ` · ${r.model}`}
                  </span>
                </div>
                {r.recognised && <p dir="rtl" lang="ar" className="mt-1 font-arabic text-[21px] leading-[1.8]">{r.recognised}</p>}
                {r.error && <p className="mt-1 break-words text-[12.5px] text-[#a3341f]">{r.error}</p>}
              </li>
            ))}
          </ul>
        )}
        {rows && rows.length >= 1000 && <p className="mt-3 text-[12.5px] text-ink/40">Showing the latest 150 of the last 1,000 rows.</p>}
      </Panel>
    </>
  );
}
