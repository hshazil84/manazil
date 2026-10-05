'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CardText } from './CardText';

// Example day: Malé City, October.
const prayers = [
  { name: 'Fajr', time: '04:40' },
  { name: 'Dhuhr', time: '11:59' },
  { name: 'Asr', time: '15:09' },
  { name: 'Maghrib', time: '17:59' },
  { name: 'Isha', time: '19:10' },
];

function minutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/** Seconds since midnight in the Maldives (UTC+5). */
function maldivesSeconds() {
  const now = new Date();
  return ((now.getUTCHours() + 5) % 24) * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function PrayerCard() {
  const [secs, setSecs] = useState<number | null>(null);
  useEffect(() => {
    setSecs(maldivesSeconds());
    const id = setInterval(() => setSecs(maldivesSeconds()), 1000);
    return () => clearInterval(id);
  }, []);

  let nextIdx = 0;
  let left = 0;
  if (secs !== null) {
    const idx = prayers.findIndex((p) => minutes(p.time) * 60 > secs);
    nextIdx = idx === -1 ? 0 : idx;
    const target = minutes(prayers[nextIdx].time) * 60 + (idx === -1 ? 86400 : 0);
    left = target - secs;
  }
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;

  return (
    <div className="card grid h-full gap-8 p-7 sm:p-9 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
      <CardText label="Prayer times" title="The right times for your island.">
        Choose your island and Manazil shows its prayer times from the Maldives Islamic Ministry tables. Or let it use your location.
      </CardText>

      <div className="rounded-[24px] bg-gradient-to-b from-[#cfe3f2]/70 via-white to-white p-5 ring-1 ring-ink/5">
        <p className="label">Next prayer</p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="text-[24px] font-bold">{prayers[nextIdx].name}</p>
          <p className="font-serif text-[38px] leading-none tabular-nums">
            {secs === null ? '--:--:--' : `${h}:${pad(m)}:${pad(s)}`}
          </p>
        </div>
        <div className="mt-3 flex justify-between text-[12.5px] text-ink/55">
          <span>
            Sunrise <b className="text-ink">05:51</b>
          </span>
          <span>
            Night prayer <b className="text-ink">01:06</b>
          </span>
        </div>

        <div className="relative mt-6">
          <div className="absolute left-[10%] right-[10%] top-[7px] h-[2px] rounded bg-ink/10" />
          <motion.div
            className="absolute left-[10%] top-[7px] h-[2px] rounded bg-gold-soft"
            initial={{ width: 0 }}
            whileInView={{ width: `${Math.max(nextIdx - 1, 0) * 20}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="relative flex justify-between">
            {prayers.map((p, i) => {
              const done = secs !== null && i < nextIdx;
              const current = secs !== null && i === Math.max(nextIdx - 1, 0) && nextIdx > 0;
              return (
                <div key={p.name} className="flex w-1/5 flex-col items-center">
                  <span
                    className={`h-[15px] w-[15px] rounded-full border-2 ${
                      current
                        ? 'border-gold-soft bg-gold-soft shadow-[0_0_0_5px_rgba(212,160,48,0.2)]'
                        : done
                        ? 'border-gold-soft bg-gold-soft'
                        : 'border-ink/20 bg-white'
                    }`}
                  />
                  <span className={`mt-2 text-[12px] ${current ? 'font-bold text-ink' : 'text-ink/55'}`}>{p.name}</span>
                  <span className="text-[11px] text-ink/40">{p.time}</span>
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-5 text-[11px] text-ink/40">Example times for Malé City, October.</p>
      </div>
    </div>
  );
}
