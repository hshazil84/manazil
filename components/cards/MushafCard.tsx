'use client';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CardText } from './CardText';

const speeds = ['0.75×', '1.0×', '1.25×', '1.5×'];

export function MushafCard() {
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(true);

  return (
    <div className="card relative h-full min-h-[560px] overflow-hidden bg-gradient-to-br from-white via-white to-mint-bg p-7 sm:p-9">
      <div className="relative z-20 flex h-full flex-col justify-between gap-8">
        <CardText className="max-w-[19rem] sm:max-w-[17.5rem]" label="Mushaf" title="Read it, hear it, at your pace.">
          Uthmani or IndoPak script, with Dhivehi and English translations. Pick a reciter and change the speed without changing the pitch.
        </CardText>

        {/* working mini player, floating over the phone */}
        <div className="w-full max-w-[19rem] rounded-[22px] bg-white/95 p-3.5 shadow-float ring-1 ring-ink/5 backdrop-blur sm:max-w-[27rem] lg:max-w-[31rem]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pause' : 'Play'}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-soft/20 text-gold transition-transform active:scale-90"
            >
              {playing ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="1" width="3.6" height="12" rx="1" /><rect x="8.4" y="1" width="3.6" height="12" rx="1" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1.5v11l9-5.5z" /></svg>
              )}
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold">Taa-Haa · Ayah 14 of 135</p>
              <p className="text-[11.5px] text-ink/45">Mishary Rashid Alafasy</p>
              <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-ink/10">
                <motion.div
                  className="h-full rounded-full bg-gold-soft"
                  animate={playing ? { width: ['8%', '100%'] } : undefined}
                  transition={{ duration: 14 / speeds.length / (0.75 + speed * 0.25) + 6, repeat: Infinity, ease: 'linear' }}
                  style={{ width: playing ? undefined : '38%' }}
                />
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-1.5">
            {speeds.map((s, i) => (
              <button
                key={s}
                onClick={() => setSpeed(i)}
                className={`flex-1 rounded-full py-1.5 text-[12px] font-semibold transition-colors ${
                  i === speed ? 'bg-mint text-white' : 'bg-ink/5 text-ink/55 hover:bg-mint-bg'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute -bottom-32 right-4 z-10 hidden w-[300px] rotate-[4deg] sm:block lg:-bottom-40 lg:right-4 lg:w-[360px]"
      >
        <Image
          src="/img/onboarding_verse.webp"
          alt="The Mushaf reader showing Taa-Haa with Arabic, Dhivehi and English"
          width={800}
          height={1461}
          className="h-auto w-full"
        />
      </motion.div>
    </div>
  );
}
