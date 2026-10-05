'use client';
import { motion } from 'framer-motion';
import { CardText } from './CardText';

const rows = [
  { t: 'Morning adhkar', s: 'Before the world asks anything of you' },
  { t: 'Evening adhkar', s: 'Close the day in His remembrance' },
  { t: 'Before you sleep', s: 'Ayat al-Kursi and the last two verses of Al-Baqarah' },
];

export function DuaCard() {
  return (
    <div className="card flex h-full flex-col gap-6 p-7 sm:p-9">
      <CardText label="Duas" title="Hisnul Muslim, with Dhivehi.">
        The Fortress of the Muslim, with a Dhivehi translation of the duas, and reminders that open the right chapter.
      </CardText>
      <div className="mt-auto space-y-2">
        {rows.map((r, i) => (
          <motion.div
            key={r.t}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 rounded-2xl bg-wash p-3 ring-1 ring-ink/5"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mint-bg text-mint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M8 7h8" /></svg>
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold">{r.t}</span>
              <span className="block truncate text-[12px] text-ink/50">{r.s}</span>
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
