'use client';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '@/components/admin/AdminGate';
import { Badge, Btn, Empty, Field, Modal, PageHead, Panel, Toggle, errText, inputCls, useToast } from '@/components/admin/ui';
import { DatePicker } from '@/components/admin/DatePicker';
import { fmtMale, maleInput, maleISO } from '@/lib/admin/time';

type Occ = { id: string; starts_at: string; title: string; body: string; route: string | null; active: boolean };
type Draft = { id?: string; when: string; title: string; body: string; route: string; active: boolean };

const ROUTES = ['/home', '/tasbih', '/mushaf?surah=108&ayah=1', '/mushaf?surah=18&ayah=1', '/discover/category/morning'];
const blank: Draft = { when: '', title: '', body: '', route: '/home', active: true };

function Preview({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#e9f0ea] to-[#f6ead6] p-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/40">How it looks on the phone</p>
      <div className="glass rounded-[20px] p-3.5 shadow-card">
        <div className="flex items-center gap-2 text-[11.5px] text-ink/50">
          <Image src="/img/app-icon.png" alt="" width={18} height={18} className="rounded-[5px]" />
          <span className="font-medium">Manazil</span><span>·</span><span>now</span>
        </div>
        <p className="mt-1.5 text-[14.5px] font-semibold">{title || 'Title'}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-ink/65">{body || 'Message'}</p>
      </div>
    </div>
  );
}

export default function Occasions() {
  const { sb } = useAdmin();
  const toast = useToast();
  const [rows, setRows] = useState<Occ[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await sb.from('occasions').select('id,starts_at,title,body,route,active').order('starts_at', { ascending: false });
    if (error) {
      toast(errText(error), true);
      setRows([]);
    } else setRows(data as Occ[]);
  }, [sb, toast]);
  useEffect(() => { load(); }, [load]);

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const all = rows ?? [];
    return {
      upcoming: all.filter((r) => new Date(r.starts_at).getTime() > now).sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at)),
      past: all.filter((r) => new Date(r.starts_at).getTime() <= now),
    };
  }, [rows]);

  const edit = (r: Occ) => setDraft({ id: r.id, when: maleInput(r.starts_at), title: r.title, body: r.body, route: r.route ?? '', active: r.active });
  const duplicate = (r: Occ) => setDraft({ when: '', title: r.title, body: r.body, route: r.route ?? '', active: true });

  async function save() {
    if (!draft) return;
    if (!draft.when || !draft.title.trim() || !draft.body.trim()) return toast('Date and time, title and message are required.', true);
    const route = draft.route.trim();
    if (route && !route.startsWith('/')) return toast('The tap destination must start with "/", for example /home.', true);
    setSaving(true);
    const row = { starts_at: maleISO(draft.when), title: draft.title.trim(), body: draft.body.trim(), route: route || null, active: draft.active };
    const { error } = draft.id ? await sb.from('occasions').update(row).eq('id', draft.id) : await sb.from('occasions').insert(row);
    setSaving(false);
    if (error) return toast(errText(error), true);
    toast(draft.id ? 'Saved.' : 'Added.');
    setDraft(null);
    load();
  }

  async function toggle(r: Occ, active: boolean) {
    setRows((s) => s && s.map((x) => (x.id === r.id ? { ...x, active } : x)));
    const { error } = await sb.from('occasions').update({ active }).eq('id', r.id);
    if (error) { toast(errText(error), true); load(); }
  }

  async function remove(r: Occ) {
    if (!window.confirm(`Delete "${r.title}"? Phones that already scheduled it keep it until they next open the app.`)) return;
    const { error } = await sb.from('occasions').delete().eq('id', r.id);
    if (error) return toast(errText(error), true);
    toast('Deleted.');
    load();
  }

  const List = ({ items, dim }: { items: Occ[]; dim?: boolean }) => (
    <ul className="divide-y divide-ink/5">
      {items.map((r) => (
        <motion.li layout key={r.id} className={`flex flex-wrap items-start gap-x-4 gap-y-2 py-4 ${dim || !r.active ? 'opacity-60' : ''}`}>
          <div className="min-w-0 flex-1 basis-64">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[15.5px] font-semibold">{r.title}</p>
              {!r.active && <Badge tone="grey">Off</Badge>}
            </div>
            <p className="mt-0.5 text-[13px] font-medium text-gold">{fmtMale(r.starts_at)} Malé time</p>
            <p className="mt-1 text-[14px] leading-snug text-ink/65">{r.body}</p>
            {r.route && <p className="mt-1 text-[12px] text-ink/40">Opens {r.route}</p>}
          </div>
          <div className="flex items-center gap-1">
            <Toggle on={r.active} onChange={(v) => toggle(r, v)} label={`${r.title} active`} />
            <Btn variant="ghost" onClick={() => edit(r)}>Edit</Btn>
            <Btn variant="ghost" onClick={() => duplicate(r)}>Duplicate</Btn>
            <Btn variant="danger" onClick={() => remove(r)}>Delete</Btn>
          </div>
        </motion.li>
      ))}
    </ul>
  );

  return (
    <>
      <PageHead
        title="Occasion messages"
        sub="Eid greetings and other special-day reminders. Phones read these when the app opens and schedule each one as a silent reminder, so a message arrives only after someone has opened the app since you added it."
        action={<Btn onClick={() => setDraft({ ...blank })}>New message</Btn>}
      />

      <Panel>
        <h2 className="mb-1 text-[13px] font-semibold uppercase tracking-[0.12em] text-gold">Upcoming</h2>
        {rows === null ? <p className="py-6 text-[14px] text-ink/40">Loading…</p> : upcoming.length === 0 ? <Empty>Nothing scheduled. Add the next Eid message early.</Empty> : <List items={upcoming} />}
      </Panel>

      {past.length > 0 && (
        <Panel className="mt-5">
          <h2 className="mb-1 text-[13px] font-semibold uppercase tracking-[0.12em] text-ink/40">Past</h2>
          <List items={past} dim />
        </Panel>
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? 'Edit message' : 'New message'}>
        {draft && (
          <div className="space-y-4">
            <Field label="When (Malé time)" hint="The moment the reminder appears. Saved with the Maldives offset (+05:00).">
              <DatePicker time value={draft.when} onChange={(when) => setDraft({ ...draft, when })} />
            </Field>
            <Field label="Title">
              <input className={inputCls} value={draft.title} maxLength={60} placeholder="Eid Mubarak" onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </Field>
            <Field label="Message">
              <textarea className={inputCls} rows={3} value={draft.body} maxLength={200} placeholder="Taqabbal Allahu minna wa minkum. May Allah accept it from us and from you." onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
            </Field>
            <Field label="When tapped, open" hint="An app route. Empty means Home.">
              <input className={inputCls} list="routes" value={draft.route} onChange={(e) => setDraft({ ...draft, route: e.target.value })} />
              <datalist id="routes">{ROUTES.map((r) => <option key={r} value={r} />)}</datalist>
            </Field>
            <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-ink/5">
              <span className="text-[14px] font-medium">Active</span>
              <Toggle on={draft.active} onChange={(v) => setDraft({ ...draft, active: v })} label="Active" />
            </div>
            <Preview title={draft.title} body={draft.body} />
            <div className="flex justify-end gap-2 pt-1">
              <Btn variant="ghost" onClick={() => setDraft(null)}>Cancel</Btn>
              <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
