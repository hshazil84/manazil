'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdmin } from '@/components/admin/AdminGate';
import { Badge, Btn, Empty, Field, PageHead, Panel, errText, inputCls, useToast } from '@/components/admin/ui';
import { addDays, fmtDate, maleToday } from '@/lib/admin/time';
import hadithData from '@/lib/admin/data/hadith.json';
import hisnData from '@/lib/admin/data/hisn.json';
import surahData from '@/lib/admin/data/surahs.json';

type Kind = 'verse' | 'hadith' | 'dua';
type Row = {
  id: string; show_on: string; kind: Kind; surah: number | null; ayah: number | null;
  hadith_id: string | null; dua_chapter: number | null; dua_index: number | null; note: string | null;
};

const hadith = hadithData as { id: string; category: string; occasion: string | null; reference: string; narrator: string; english: string }[];
const hisn = hisnData as { id: number; title: string; duas: string[] }[];
const surahs = surahData as { n: number; name: string; meaning: string; ayahs: number }[];

const KINDS: { id: Kind; label: string }[] = [{ id: 'verse', label: 'Verse' }, { id: 'hadith', label: 'Hadith' }, { id: 'dua', label: 'Dua' }];
const clean = (s: string) => s.replace(/^\(\s*|\s*\)$/g, '').trim();

function describe(r: Row): string {
  if (r.kind === 'verse') {
    const s = surahs.find((x) => x.n === r.surah);
    return `${s?.name ?? 'Surah ' + r.surah} ${r.surah}:${r.ayah}`;
  }
  if (r.kind === 'hadith') {
    const h = hadith.find((x) => x.id === r.hadith_id);
    return h ? h.reference : `Hadith ${r.hadith_id}`;
  }
  const c = hisn.find((x) => x.id === r.dua_chapter);
  return `${c?.title ?? 'Chapter ' + r.dua_chapter} · dua ${(r.dua_index ?? 0) + 1}`;
}

function VersePreview({ surah, ayah }: { surah: number; ayah: number }) {
  const [state, setState] = useState<{ ar: string; en: string } | 'loading' | 'none'>('loading');
  useEffect(() => {
    let live = true;
    setState('loading');
    fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/editions/quran-uthmani,en.sahih`)
      .then((r) => r.json())
      .then((j) => {
        if (!live) return;
        const [ar, en] = j.data ?? [];
        setState(ar && en ? { ar: ar.text, en: en.text } : 'none');
      })
      .catch(() => live && setState('none'));
    return () => { live = false; };
  }, [surah, ayah]);
  if (state === 'loading') return <p className="text-[13px] text-ink/40">Loading preview…</p>;
  if (state === 'none') return <p className="text-[13px] text-ink/40">Preview unavailable. The app will read the verse from its own Quran data.</p>;
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-ink/5">
      <p dir="rtl" lang="ar" className="font-arabic text-[24px] leading-[1.9]">{state.ar}</p>
      <p className="mt-2 text-[13.5px] leading-snug text-ink/60">{state.en}</p>
    </div>
  );
}

export default function Daily() {
  const { sb } = useAdmin();
  const toast = useToast();
  const today = maleToday();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [date, setDate] = useState(addDays(today, 1));
  const [kind, setKind] = useState<Kind>('verse');
  const [surah, setSurah] = useState(2);
  const [ayah, setAyah] = useState(255);
  const [hid, setHid] = useState(hadith.find((h) => h.category === 'general')?.id ?? hadith[0].id);
  const [chapter, setChapter] = useState(hisn[0].id);
  const [dIndex, setDIndex] = useState(0);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await sb.from('daily_content').select('*').gte('show_on', addDays(today, -14)).order('show_on', { ascending: true });
    if (error) { toast(errText(error), true); setRows([]); } else setRows(data as Row[]);
  }, [sb, toast, today]);
  useEffect(() => { load(); }, [load]);

  const maxAyah = surahs.find((s) => s.n === surah)?.ayahs ?? 286;
  const ch = hisn.find((c) => c.id === chapter) ?? hisn[0];
  const hd = hadith.find((h) => h.id === hid);
  const existing = rows?.find((r) => r.show_on === date && r.kind === kind);

  // Load a saved row into the form when its date and kind are picked; clear the note otherwise.
  useEffect(() => {
    setNote(existing?.note ?? '');
    if (!existing) return;
    if (existing.kind === 'verse' && existing.surah && existing.ayah) { setSurah(existing.surah); setAyah(existing.ayah); }
    if (existing.kind === 'hadith' && existing.hadith_id) setHid(existing.hadith_id);
    if (existing.kind === 'dua' && existing.dua_chapter != null) { setChapter(existing.dua_chapter); setDIndex(existing.dua_index ?? 0); }
  }, [date, kind, existing?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const strip = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(today, i)), [today]);
  const upcoming = (rows ?? []).filter((r) => r.show_on >= today);
  const past = (rows ?? []).filter((r) => r.show_on < today).reverse();

  async function save() {
    if (date < today) return toast('Pick today or a later date.', true);
    if (kind === 'verse' && (ayah < 1 || ayah > maxAyah)) return toast(`Surah ${surah} has ${maxAyah} verses.`, true);
    const row: Record<string, unknown> = {
      show_on: date, kind, note: note.trim() || null,
      surah: null, ayah: null, hadith_id: null, dua_chapter: null, dua_index: null,
    };
    if (kind === 'verse') { row.surah = surah; row.ayah = ayah; }
    if (kind === 'hadith') row.hadith_id = hid;
    if (kind === 'dua') { row.dua_chapter = chapter; row.dua_index = dIndex; }
    setSaving(true);
    const { error } = await sb.from('daily_content').upsert(row, { onConflict: 'show_on,kind' });
    setSaving(false);
    if (error) return toast(errText(error), true);
    toast(existing ? 'Updated.' : 'Pinned.');
    load();
  }

  async function remove(r: Row) {
    const { error } = await sb.from('daily_content').delete().eq('id', r.id);
    if (error) return toast(errText(error), true);
    toast('Removed. That day goes back to the normal rotation.');
    load();
  }

  const Item = ({ r }: { r: Row }) => (
    <li className="flex items-center gap-3 py-3">
      <button onClick={() => { setDate(r.show_on); setKind(r.kind); }} className="min-w-0 flex-1 text-left">
        <p className="text-[13px] font-medium text-gold">{fmtDate(r.show_on)}{r.show_on === today && ' · today'}</p>
        <p className="truncate text-[14.5px] font-semibold">{describe(r)}</p>
        {r.note && <p className="truncate text-[12.5px] text-ink/45">{r.note}</p>}
      </button>
      <Badge tone={r.kind === 'verse' ? 'mint' : r.kind === 'hadith' ? 'gold' : 'grey'}>{r.kind}</Badge>
      <Btn variant="danger" onClick={() => remove(r)}>Remove</Btn>
    </li>
  );

  return (
    <>
      <PageHead
        title="Daily content"
        sub="Pin a verse, hadith or dua for a particular day. Days with nothing pinned keep the app's normal rotation. Phones pick this up when the app opens, and keep working offline."
      />

      <Panel>
        <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
          {strip.map((d) => {
            const set = (rows ?? []).filter((r) => r.show_on === d);
            const on = d === date;
            return (
              <button
                key={d}
                onClick={() => setDate(d)}
                className={`flex w-[58px] shrink-0 flex-col items-center rounded-xl px-1 py-2 text-center transition ${on ? 'bg-ink text-white' : 'bg-white ring-1 ring-ink/5 hover:bg-mint-bg'}`}
              >
                <span className={`text-[10.5px] font-semibold uppercase ${on ? 'text-white/60' : 'text-ink/40'}`}>{fmtDate(d).split(' ')[0]}</span>
                <span className="text-[17px] font-bold leading-tight">{Number(d.slice(8))}</span>
                <span className="mt-1 flex h-1.5 gap-0.5">
                  {set.map((r) => <i key={r.id} className={`h-1.5 w-1.5 rounded-full ${on ? 'bg-gold-light' : 'bg-gold'}`} />)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date"><input type="date" min={today} className={inputCls} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} /></Field>
          <Field label="Pin a">
            <div className="flex rounded-xl bg-ink/5 p-1">
              {KINDS.map((k) => (
                <button key={k.id} onClick={() => setKind(k.id)} className={`flex-1 rounded-lg py-1.5 text-[13.5px] font-semibold transition ${kind === k.id ? 'bg-white shadow-sm' : 'text-ink/55'}`}>{k.label}</button>
              ))}
            </div>
          </Field>
        </div>

        <div className="mt-4 space-y-4">
          {kind === 'verse' && (
            <>
              <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                <Field label="Surah">
                  <select className={inputCls} value={surah} onChange={(e) => { setSurah(Number(e.target.value)); setAyah(1); }}>
                    {surahs.map((s) => <option key={s.n} value={s.n}>{s.n}. {s.name} · {s.meaning}</option>)}
                  </select>
                </Field>
                <Field label={`Verse (1–${maxAyah})`}>
                  <input type="number" min={1} max={maxAyah} className={inputCls} value={ayah} onChange={(e) => setAyah(Number(e.target.value))} />
                </Field>
              </div>
              {ayah >= 1 && ayah <= maxAyah && <VersePreview surah={surah} ayah={ayah} />}
            </>
          )}
          {kind === 'hadith' && (
            <>
              <Field label="Hadith" hint="From the app's built-in collection.">
                <select className={inputCls} value={hid} onChange={(e) => setHid(e.target.value)}>
                  {hadith.map((h) => <option key={h.id} value={h.id}>#{h.id} · {h.reference}{h.category !== 'general' ? ` · ${h.category}` : ''}</option>)}
                </select>
              </Field>
              {hd && (
                <div className="rounded-xl bg-white p-4 ring-1 ring-ink/5">
                  <p className="text-[14.5px] leading-snug">{hd.english}</p>
                  <p className="mt-2 text-[12.5px] text-ink/45">{hd.narrator} · {hd.reference}</p>
                  {hd.category !== 'general' && <p className="mt-2 text-[12.5px] text-gold">Tagged “{hd.category}”: the app normally shows it only on its own occasion. Pinning shows it on this date regardless.</p>}
                </div>
              )}
            </>
          )}
          {kind === 'dua' && (
            <>
              <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                <Field label="Chapter of Hisnul Muslim">
                  <select className={inputCls} value={chapter} onChange={(e) => { setChapter(Number(e.target.value)); setDIndex(0); }}>
                    {hisn.map((c) => <option key={c.id} value={c.id}>{c.id}. {c.title}</option>)}
                  </select>
                </Field>
                <Field label="Dua">
                  <select className={inputCls} value={dIndex} onChange={(e) => setDIndex(Number(e.target.value))}>
                    {ch.duas.map((_, i) => <option key={i} value={i}>{i + 1} of {ch.duas.length}</option>)}
                  </select>
                </Field>
              </div>
              <div className="rounded-xl bg-white p-4 ring-1 ring-ink/5">
                <p className="text-[14.5px] leading-snug">{clean(ch.duas[dIndex] ?? '')}</p>
                <p className="mt-2 text-[12.5px] text-ink/45">Hisnul Muslim · {ch.title}</p>
              </div>
            </>
          )}
          <Field label="Note to yourself (optional)"><input className={inputCls} value={note} maxLength={120} placeholder="Why this one" onChange={(e) => setNote(e.target.value)} /></Field>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-[13px] text-ink/50">{existing ? `Replaces the ${kind} already pinned for ${fmtDate(date)}.` : `Nothing pinned for ${fmtDate(date)} yet.`}</p>
          <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : existing ? 'Update' : 'Pin it'}</Btn>
        </div>
      </Panel>

      <Panel className="mt-5">
        <h2 className="mb-1 text-[13px] font-semibold uppercase tracking-[0.12em] text-gold">Pinned from today</h2>
        {rows === null ? <p className="py-6 text-[14px] text-ink/40">Loading…</p> : upcoming.length === 0 ? <Empty>Nothing pinned. Every day follows the normal rotation.</Empty> : <ul className="divide-y divide-ink/5">{upcoming.map((r) => <Item key={r.id} r={r} />)}</ul>}
      </Panel>
      {past.length > 0 && (
        <Panel className="mt-5 opacity-70">
          <h2 className="mb-1 text-[13px] font-semibold uppercase tracking-[0.12em] text-ink/40">Recent days</h2>
          <ul className="divide-y divide-ink/5">{past.map((r) => <Item key={r.id} r={r} />)}</ul>
        </Panel>
      )}
    </>
  );
}
