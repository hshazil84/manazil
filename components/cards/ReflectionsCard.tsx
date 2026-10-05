'use client';
import { motion } from 'framer-motion';
import { CardText } from './CardText';

const week = [
  { d: 'M', v: 0.55 },
  { d: 'T', v: 0.8 },
  { d: 'W', v: 0.35 },
  { d: 'T', v: 0.9 },
  { d: 'F', v: 0.65 },
  { d: 'S', v: 1 },
  { d: 'S', v: 0.2 },
];

export function ReflectionsCard() {
  const r = 38;
  const c = 2 * Math.PI * r;
  const pct = 0.42;
  return (
    <div className="card grid h-full gap-8 p-7 sm:p-9 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <CardText label="Reflections" title="Your week, and your khatm.">
        See the days you read or listened. Pick a day to finish the Quran by and Manazil works out each day&apos;s portion.
      </CardText>
      <div className="rounded-[22px] bg-wash p-4 ring-1 ring-ink/5">
        <div className="flex items-center gap-4">
          <div className="relative h-[92px] w-[92px] shrink-0">
            <svg viewBox="0 0 92 92" className="h-full w-full -rotate-90">
              <circle cx="46" cy="46" r={r} fill="none" stroke="rgba(22,36,31,0.08)" strokeWidth="8" />
              <motion.circle
                cx="46"
                cy="46"
                r={r}
                fill="none"
                stroke="#2F5C4C"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={c}
                initial={{ strokeDashoffset: c }}
                whileInView={{ strokeDashoffset: c * (1 - pct) }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            <span className="absolute inset-0 grid place-items-center text-[19px] font-bold">42%</span>
          </div>
          <div>
            <p className="label !text-[10px]">Khatm</p>
            <p className="text-[14px] font-semibold">About 4 pages today</p>
            <p className="text-[12px] text-ink/50">At your own pace</p>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between gap-2">
          {week.map((w, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-[54px] w-full items-end">
                <motion.div
                  className="w-full rounded-md bg-gold-soft/80"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${w.v * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <span className="text-[10.5px] text-ink/45">{w.d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
