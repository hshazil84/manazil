'use client';
import { useEffect, useState } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { CardText } from './CardText';

const QIBLA = 301;

function Dial({ rotate, aligned }: { rotate: ReturnType<typeof useMotionValue<number>>; aligned: boolean }) {
  const ticks = Array.from({ length: 72 }, (_, i) => i);
  const active = aligned ? '#2F5C4C' : '#D4A030';
  return (
    <div className="relative mx-auto h-[230px] w-[230px]">
      {/* Kaaba marker: where the phone is facing */}
      <div
        className="absolute left-1/2 top-[-16px] z-10 grid h-[34px] w-[34px] -translate-x-1/2 place-items-center rounded-full border border-white shadow-md transition-colors duration-300"
        style={{ background: `radial-gradient(circle at 35% 30%, #fff, ${active})` }}
      >
        <span className="relative block h-[14px] w-[14px] rounded-[3px] bg-[#1b1b1b]">
          <span className="absolute inset-x-0 top-[3px] h-[2px] bg-[#E6C36A]" />
        </span>
      </div>
      <div
        className="h-full w-full rounded-full bg-gradient-to-br from-white to-white/40 ring-1 ring-white transition-shadow duration-500"
        style={{ boxShadow: aligned ? '0 0 40px 4px rgba(47,92,76,0.35)' : '0 14px 34px -12px rgba(22,36,31,0.25)' }}
      >
        <motion.svg viewBox="-115 -115 230 230" className="h-full w-full" style={{ rotate }}>
          {ticks.map((i) => {
            const major = i % 6 === 0;
            return (
              <line
                key={i}
                x1={0}
                x2={0}
                y1={-105 + 10}
                y2={-105 + (major ? 24 : 17)}
                transform={`rotate(${i * 5})`}
                stroke="#16241F"
                strokeOpacity={major ? 0.5 : 0.2}
                strokeWidth={major ? 2 : 1}
                strokeLinecap="round"
              />
            );
          })}
          <polygon points="0,-108 -6,-95 6,-95" fill="#C0392B" />
          {[
            ['N', 0, '#C0392B'],
            ['E', 90, 'rgba(22,36,31,0.6)'],
            ['S', 180, 'rgba(22,36,31,0.6)'],
            ['W', 270, 'rgba(22,36,31,0.6)'],
          ].map(([t, deg, c]) => (
            <g key={t as string} transform={`rotate(${deg}) translate(0 -68)`}>
              <g transform={`rotate(${-(deg as number)})`}>
                <text textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="700" fill={c as string}>
                  {t}
                </text>
              </g>
            </g>
          ))}
          {/* the Qibla notch on the rim */}
          <g transform={`rotate(${QIBLA})`}>
            <line x1="0" x2="0" y1="-99" y2="-71" stroke={active} strokeWidth="4" strokeLinecap="round" />
            <circle cx="0" cy="-55" r="5" fill={active} />
          </g>
        </motion.svg>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow">
        <span className="absolute inset-[3.5px] rounded-full bg-ink/70" />
      </div>
    </div>
  );
}

export function QiblaCard() {
  const rotate = useMotionValue(-30);
  const [aligned, setAligned] = useState(false);

  useMotionValueEvent(rotate, 'change', (v) => {
    // The dial turns against the heading; aligned when the notch sits at the top.
    const diff = ((((QIBLA + v) % 360) + 540) % 360) - 180;
    setAligned(Math.abs(diff) <= 3);
  });

  useEffect(() => {
    const controls = animate(rotate, [-30, -150, -260, -318, -296, -301], {
      duration: 5.5,
      times: [0, 0.25, 0.5, 0.75, 0.9, 1],
      ease: 'easeInOut',
      repeat: Infinity,
      repeatDelay: 2.4,
    });
    return () => controls.stop();
  }, [rotate]);

  return (
    <div className="card flex h-full flex-col gap-7 p-7 sm:p-9">
      <CardText label="Qibla" title="Turn until the mark meets the Kaaba.">
        A live compass on phones that have the sensor. On phones that don&apos;t, Manazil shows the bearing as a number on a still dial.
      </CardText>
      <div className="mt-auto pt-3">
        <div className="mb-8 flex items-center justify-center gap-3 text-center">
          <div className="glass rounded-2xl px-4 py-2 text-left">
            <p className="label !text-[9.5px]">Qibla</p>
            <p className="text-[19px] font-bold leading-tight">301° WNW</p>
          </div>
          <p
            className={`w-[130px] text-left text-[13px] leading-snug transition-colors ${
              aligned ? 'font-semibold text-mint' : 'text-ink/55'
            }`}
          >
            {aligned ? 'You are facing the Qibla' : 'Turn until the gold mark meets the Kaaba'}
          </p>
        </div>
        <Dial rotate={rotate} aligned={aligned} />
      </div>
    </div>
  );
}
