'use client';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CardText } from './CardText';

const TARGET = 33;

export function TasbihCard() {
  const [count, setCount] = useState(7);
  const r = 46;
  const c = 2 * Math.PI * r;

  return (
    <div className="card flex h-full flex-col gap-6 p-7 sm:p-9">
      <Image
        src="/img/tasbih_3d.png"
        alt=""
        width={558}
        height={560}
        className="pointer-events-none absolute -right-7 -top-7 h-[120px] w-auto rotate-[14deg]"
      />
      <CardText className="pr-24" label="Tasbih" title="Count with a tap.">
        Pick a zikr and a target. Try it here.
      </CardText>
      <div className="mt-auto flex flex-col items-center">
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setCount((n) => (n >= TARGET ? 0 : n + 1))}
          aria-label="Tap to count"
          className="relative grid h-[150px] w-[150px] place-items-center rounded-full bg-gradient-to-br from-mint-bg to-white shadow-card ring-1 ring-ink/5"
        >
          <svg viewBox="0 0 110 110" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(22,36,31,0.08)" strokeWidth="5" />
            <motion.circle
              cx="55"
              cy="55"
              r={r}
              fill="none"
              stroke="#D4A030"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={c}
              animate={{ strokeDashoffset: c * (1 - count / TARGET) }}
              transition={{ type: 'spring', stiffness: 140, damping: 20 }}
            />
          </svg>
          <span className="text-center">
            <motion.span
              key={count}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="block font-serif text-[46px] leading-none tabular-nums"
            >
              {count}
            </motion.span>
            <span className="text-[12px] text-ink/45">/ {TARGET}</span>
          </span>
        </motion.button>
        <p className="mt-4 text-[12.5px] text-ink/45">Tap the circle</p>
      </div>
    </div>
  );
}
