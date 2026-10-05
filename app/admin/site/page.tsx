'use client';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAdmin } from '@/components/admin/AdminGate';
import { Badge, Btn, Empty, Field, PageHead, Panel, Toggle, errText, inputCls, useToast } from '@/components/admin/ui';
import { faqs as defaultFaqs } from '@/components/faq-data';

type Banner = { enabled: boolean; text: string; link_label: string; link_url: string };
type Links = { ios: string; android: string };
type Faq = { id: string; position: number; question: string; answer: string; active: boolean };

const emptyBanner: Banner = { enabled: false, text: '', link_label: '', link_url: '' };
const httpsOnly = (v: string) => v === '' || /^https:\/\//i.test(v.trim());

export default function SiteContent() {
  const { sb } = useAdmin();
  const toast = useToast();
  const [banner, setBanner] = useState<Banner>(emptyBanner);
  const [links, setLinks] = useState<Links>({ ios: '', android: '' });
  const [faqs, setFaqs] = useState<Faq[] | null>(null);
  const [edit, setEdit] = useState<Faq | null>(null);
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    const s = await sb.from('site_settings').select('key,value');
    if (s.error) toast(errText(s.error), true);
    else {
      for (const r of s.data) {
        if (r.key === 'banner') setBanner({ ...emptyBanner, ...r.value });
        if (r.key === 'store_links') setLinks({ ios: '', android: '', ...r.value });
      }
    }
    const f = await sb.from('faqs').select('*').order('position').order('created_at');
    if (f.error) { toast(errText(f.error), true); setFaqs([]); } else setFaqs(f.data as Faq[]);
  }, [sb, toast]);
  useEffect(() => { load(); }, [load]);

  async function saveSetting(key: string, value: unknown, label: string) {
    setBusy(key);
    const { error } = await sb.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() });
    setBusy('');
    if (error) return toast(errText(error), true);
    toast(`${label} saved. The site updates within a minute.`);
  }

  const saveBanner = () => {
    if (banner.enabled && !banner.text.trim()) return toast('Write the announcement text first.', true);
    if (!httpsOnly(banner.link_url)) return toast('The link must start with https://', true);
    saveSetting('banner', { ...banner, text: banner.text.trim(), link_url: banner.link_url.trim(), link_label: banner.link_label.trim() }, 'Banner');
  };
  const saveLinks = () => {
    if (!httpsOnly(links.ios) || !httpsOnly(links.android)) return toast('Store links must start with https://', true);
    saveSetting('store_links', { ios: links.ios.trim(), android: links.android.trim() }, 'Store links');
  };

  async function importDefaults() {
    setBusy('import');
    const { error } = await sb.from('faqs').insert(defaultFaqs.map((f, i) => ({ position: i + 1, question: f.q, answer: f.a, active: true })));
    setBusy('');
    if (error) return toast(errText(error), true);
    toast('Imported the current FAQ. Edit it from here from now on.');
    load();
  }

  async function saveFaq() {
    if (!edit) return;
    if (!edit.question.trim() || !edit.answer.trim()) return toast('Question and answer are required.', true);
    const row = { question: edit.question.trim(), answer: edit.answer.trim(), active: edit.active };
    const isNew = !edit.id;
    const { error } = isNew
      ? await sb.from('faqs').insert({ ...row, position: (faqs?.reduce((m, f) => Math.max(m, f.position), 0) ?? 0) + 1 })
      : await sb.from('faqs').update(row).eq('id', edit.id);
    if (error) return toast(errText(error), true);
    toast(isNew ? 'Added.' : 'Saved.');
    setEdit(null);
    load();
  }

  async function move(i: number, dir: -1 | 1) {
    if (!faqs) return;
    const j = i + dir;
    if (j < 0 || j >= faqs.length) return;
    const next = [...faqs];
    [next[i], next[j]] = [next[j], next[i]];
    const renumbered = next.map((f, k) => ({ ...f, position: k + 1 }));
    setFaqs(renumbered);
    const results = await Promise.all(renumbered.map((f) => sb.from('faqs').update({ position: f.position }).eq('id', f.id)));
    const bad = results.find((r) => r.error);
    if (bad?.error) { toast(errText(bad.error), true); load(); }
  }

  async function toggleFaq(f: Faq, active: boolean) {
    setFaqs((s) => s && s.map((x) => (x.id === f.id ? { ...x, active } : x)));
    const { error } = await sb.from('faqs').update({ active }).eq('id', f.id);
    if (error) { toast(errText(error), true); load(); }
  }

  async function removeFaq(f: Faq) {
    if (!window.confirm(`Delete “${f.question}”?`)) return;
    const { error } = await sb.from('faqs').delete().eq('id', f.id);
    if (error) return toast(errText(error), true);
    load();
  }

  const h2 = 'text-[13px] font-semibold uppercase tracking-[0.12em] text-gold';

  return (
    <>
      <PageHead title="Site content" sub="What visitors see on manazil.mv. Changes appear within about a minute." />

      <Panel>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className={h2}>Announcement banner</h2>
            <p className="mt-1 text-[13.5px] text-ink/50">A small dismissible note at the bottom of every page.</p>
          </div>
          <Toggle on={banner.enabled} onChange={(v) => setBanner({ ...banner, enabled: v })} label="Banner on" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Text" className="sm:col-span-2">
            <input className={inputCls} maxLength={140} value={banner.text} placeholder="Eid Mubarak from all of us at Manazil." onChange={(e) => setBanner({ ...banner, text: e.target.value })} />
          </Field>
          <Field label="Link label (optional)"><input className={inputCls} value={banner.link_label} placeholder="Read more" onChange={(e) => setBanner({ ...banner, link_label: e.target.value })} /></Field>
          <Field label="Link (optional)"><input className={inputCls} value={banner.link_url} placeholder="https://" onChange={(e) => setBanner({ ...banner, link_url: e.target.value })} /></Field>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[13px] text-ink/45">{banner.enabled ? 'Showing on the site.' : 'Hidden.'}</span>
          <Btn onClick={saveBanner} disabled={busy === 'banner'}>{busy === 'banner' ? 'Saving…' : 'Save banner'}</Btn>
        </div>
      </Panel>

      <Panel className="mt-5">
        <h2 className={h2}>Store links</h2>
        <p className="mt-1 text-[13.5px] text-ink/50">While a link is empty its button shows “coming soon”. Paste the link once the app is live and the button turns on.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="App Store"><input className={inputCls} value={links.ios} placeholder="https://apps.apple.com/…" onChange={(e) => setLinks({ ...links, ios: e.target.value })} /></Field>
          <Field label="Google Play"><input className={inputCls} value={links.android} placeholder="https://play.google.com/store/apps/details?id=mv.manazil.manazil" onChange={(e) => setLinks({ ...links, android: e.target.value })} /></Field>
        </div>
        <div className="mt-4 flex justify-end"><Btn onClick={saveLinks} disabled={busy === 'store_links'}>{busy === 'store_links' ? 'Saving…' : 'Save links'}</Btn></div>
      </Panel>

      <Panel className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={h2}>FAQ</h2>
            <p className="mt-1 text-[13.5px] text-ink/50">Shown on /faq. Until you add questions here, the site uses its built-in list.</p>
          </div>
          {faqs && faqs.length > 0 && <Btn onClick={() => setEdit({ id: '', position: 0, question: '', answer: '', active: true })}>Add question</Btn>}
        </div>
        <div className="mt-3">
          {faqs === null ? (
            <p className="py-6 text-[14px] text-ink/40">Loading…</p>
          ) : faqs.length === 0 ? (
            <Empty>
              <p>The site is showing its built-in FAQ ({defaultFaqs.length} questions).</p>
              <Btn className="mt-3" variant="soft" onClick={importDefaults} disabled={busy === 'import'}>{busy === 'import' ? 'Importing…' : 'Import them here to edit'}</Btn>
            </Empty>
          ) : (
            <ul className="divide-y divide-ink/5">
              {faqs.map((f, i) => (
                <li key={f.id} className={`flex items-start gap-3 py-3.5 ${f.active ? '' : 'opacity-55'}`}>
                  <div className="flex flex-col">
                    <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="grid h-6 w-6 place-items-center rounded text-ink/40 hover:bg-ink/5 disabled:opacity-25">▲</button>
                    <button aria-label="Move down" disabled={i === faqs.length - 1} onClick={() => move(i, 1)} className="grid h-6 w-6 place-items-center rounded text-ink/40 hover:bg-ink/5 disabled:opacity-25">▼</button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold">{f.question} {!f.active && <Badge tone="grey">Hidden</Badge>}</p>
                    <p className="mt-0.5 line-clamp-2 text-[13.5px] leading-snug text-ink/55">{f.answer}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Toggle on={f.active} onChange={(v) => toggleFaq(f, v)} label="Shown" />
                    <Btn variant="ghost" onClick={() => setEdit(f)}>Edit</Btn>
                    <Btn variant="danger" onClick={() => removeFaq(f)}>Delete</Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <AnimatePresence>
          {edit && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-4 space-y-4 rounded-2xl bg-cream p-4 ring-1 ring-ink/5">
                <Field label="Question"><input className={inputCls} value={edit.question} onChange={(e) => setEdit({ ...edit, question: e.target.value })} /></Field>
                <Field label="Answer"><textarea className={inputCls} rows={4} value={edit.answer} onChange={(e) => setEdit({ ...edit, answer: e.target.value })} /></Field>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[13.5px] font-medium"><Toggle on={edit.active} onChange={(v) => setEdit({ ...edit, active: v })} label="Shown" /> Shown on the site</label>
                  <div className="flex gap-2"><Btn variant="ghost" onClick={() => setEdit(null)}>Cancel</Btn><Btn onClick={saveFaq}>Save</Btn></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Panel>
    </>
  );
}
