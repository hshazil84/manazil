'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { CardText } from './CardText';

/** A replica of the app's Tasbih screen: zikr card, 33 / 99 / 100 switcher,
 *  glass disc with the light ring, and rounds completed. Tap the disc. */

const zikrs = [
  { id: 'free', arabic: '', meaning: 'Free count', target: 33 },
  { id: 'subhanallah', arabic: 'سُبْحَانَ ٱللَّهِ', meaning: 'Glory be to Allah', target: 33 },
  { id: 'alhamdulillah', arabic: 'ٱلْحَمْدُ لِلَّهِ', meaning: 'All praise is for Allah', target: 33 },
  { id: 'allahu_akbar', arabic: 'ٱللَّهُ أَكْبَرُ', meaning: 'Allah is the Greatest', target: 33 },
  { id: 'la_ilaha', arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّهُ', meaning: 'There is no god but Allah', target: 100 },
];
const TARGETS = [33, 99, 100];
const SIZE = 216;
const R = SIZE / 2 - 16;

type Progress = { count: number; target: number; rounds: number };
type Ripple = { id: number; x: number; y: number; big: boolean };

const glow = (rgb: string, a: number) =>
  `radial-gradient(closest-side, rgba(${rgb},${a}), rgba(${rgb},0))`;

export function TasbihCard() {
  const [zi, setZi] = useState(1);
  const [prog, setProg] = useState<Record<string, Progress>>(() =>
    Object.fromEntries(zikrs.map((z) => [z.id, { count: z.id === 'subhanallah' ? 12 : 0, target: z.target, rounds: z.id === 'subhanallah' ? 2 : 0 }])),
  );
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [flash, setFlash] = useState(false);
  const [pulse, setPulse] = useState(0);
  const nextId = useRef(0);

  const zikr = zikrs[zi];
  const p = prog[zikr.id];
  const fraction = Math.min(p.count / p.target, 1);

  const prog01 = useMotionValue(fraction);
  useEffect(() => {
    const c = animate(prog01, fraction, { type: 'spring', stiffness: 160, damping: 22 });
    return () => c.stop();
  }, [fraction, prog01]);
  const dash = useTransform(prog01, (v) => 1 - v);
  const tipX = useTransform(prog01, (v) => SIZE / 2 + Math.cos(-Math.PI / 2 + 2 * Math.PI * v) * R);
  const tipY = useTransform(prog01, (v) => SIZE / 2 + Math.sin(-Math.PI / 2 + 2 * Math.PI * v) * R);

  function tap(e: React.PointerEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const done = p.count + 1 >= p.target;
    const id = nextId.current++;
    setRipples((r) => [...r.slice(-5), { id, x, y, big: done }]);
    setProg((s) => ({
      ...s,
      [zikr.id]: done ? { ...p, count: 0, rounds: p.rounds + 1 } : { ...p, count: p.count + 1 },
    }));
    setPulse((n) => n + 1);
    if (done) {
      setFlash(true);
      setTimeout(() => setFlash(false), 900);
    }
  }
  function setTarget(t: number) {
    setProg((s) => ({ ...s, [zikr.id]: { ...p, target: t, count: p.count >= t ? 0 : p.count } }));
  }

  const shown = flash ? 1 : fraction;
  const tint = flash ? '#E8B84A' : '#F6EBC8';

  return (
    <div className="card flex h-full flex-col bg-[#f6f8f3] p-6 sm:p-7">
      {/* The app's drifting colour fields; they swell on every tap */}
      {/* Radial gradients instead of blurred blobs: the card's own rounded box clips them, in every browser */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[27px]">
        <motion.div
          key={`a${pulse}`}
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute -right-[150px] -top-[166px] h-[440px] w-[440px]"
          style={{ background: glow('242,213,138', 0.78) }}
        />
        <motion.div
          key={`b${pulse}`}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute -left-[166px] top-[calc(33.333%-70px)] h-[440px] w-[440px]"
          style={{ background: glow('159,220,192', 0.62) }}
        />
        <div
          className="absolute -bottom-[166px] -right-[60px] h-[420px] w-[420px]"
          style={{ background: glow('246,201,168', 0.52) }}
        />
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0.6, scale: 0.8 }}
              animate={{ opacity: 0, scale: 1.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2"
              style={{ background: glow('242,213,138', 0.75) }}
            />
          )}
        </AnimatePresence>
      </div>

      <CardText className="relative" label="Tasbih" title="Count with a tap.">
        Pick a zikr and a target. Try it here.
      </CardText>

      <div className="relative mt-5 flex flex-1 flex-col items-center gap-3.5">
        {/* Zikr card */}
        <button
          onClick={() => setZi((i) => (i + 1) % zikrs.length)}
          aria-label="Change zikr"
          className="glass flex w-full items-center rounded-[22px] py-2.5 pl-4 pr-3 text-center"
        >
          <span className="flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={zikr.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="block"
              >
                {zikr.arabic && (
                  <span dir="rtl" lang="ar" className="block font-arabic text-[24px] leading-[1.6] text-ink">
                    {zikr.arabic}
                  </span>
                )}
                <span className={zikr.arabic ? 'block text-[12px] text-ink/55' : 'block text-[16px] font-semibold text-ink/85'}>
                  {zikr.meaning}
                </span>
              </motion.span>
            </AnimatePresence>
          </span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(22,36,31,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m8 9 4-4 4 4M8 15l4 4 4-4" />
          </svg>
        </button>

        {/* Target switcher */}
        <div className="glass relative flex rounded-[18px] p-1">
          {TARGETS.map((t) => (
            <button
              key={t}
              onClick={() => setTarget(t)}
              className="relative h-[34px] w-[58px] text-[13.5px] font-bold"
              style={{ color: t === p.target ? '#2F5C4C' : 'rgba(22,36,31,0.5)' }}
            >
              {t === p.target && (
                <motion.span
                  layoutId="tasbih-target"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-[14px] bg-gradient-to-r from-white/95 to-mint-bg/90 shadow-[0_3px_10px_rgba(22,60,45,0.12)]"
                />
              )}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>

        {/* Glass disc */}
        <motion.button
          whileTap={{ scale: 0.955 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          onPointerDown={tap}
          aria-label="Tap to count"
          className="relative my-1 select-none rounded-full outline-none"
          style={{
            width: SIZE,
            height: SIZE,
            touchAction: 'manipulation',
            boxShadow: flash
              ? '0 18px 40px rgba(22,60,45,0.10), 0 0 60px 6px rgba(212,160,48,0.45)'
              : '0 18px 40px rgba(22,60,45,0.10)',
            transition: 'box-shadow 0.4s',
          }}
        >
          <span
            className="absolute inset-0 overflow-hidden rounded-full border-[1.4px] border-white/70 backdrop-blur-[22px]"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.62), rgba(255,255,255,0.18))' }}
          >
            <span
              className="absolute inset-0"
              style={{ background: 'radial-gradient(circle at 25% 15%, rgba(255,255,255,0.45), rgba(255,255,255,0) 90%)' }}
            />
            {ripples.map((r) => {
              const d = SIZE * (r.big ? 0.9 : 0.55) * 2;
              return (
                <motion.span
                  key={r.id}
                  initial={{ scale: 0.03, opacity: 1 }}
                  animate={{ scale: 1, opacity: 0 }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  onAnimationComplete={() => setRipples((s) => s.filter((x) => x.id !== r.id))}
                  className="pointer-events-none absolute rounded-full"
                  style={{
                    width: d,
                    height: d,
                    left: r.x - d / 2,
                    top: r.y - d / 2,
                    background: `radial-gradient(circle, rgba(255,255,255,0) 70%, ${r.big ? 'rgba(212,160,48,0.55)' : 'rgba(255,255,255,0.65)'} 92%, rgba(255,255,255,0) 100%)`,
                  }}
                />
              );
            })}
          </span>

          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            <defs>
              <filter id="tb-bloom" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation={flash ? 12 : 7} />
              </filter>
              <filter id="tb-tip" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>
            <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
            {shown > 0 && (
              <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
                {flash ? (
                  <>
                    <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={tint} strokeOpacity="0.75" strokeWidth="13.5" filter="url(#tb-bloom)" />
                    <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="#fff" strokeOpacity="0.95" strokeWidth="3.5" />
                  </>
                ) : (
                  <>
                    <motion.circle
                      cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={tint} strokeOpacity="0.6" strokeWidth="13.5"
                      strokeLinecap="round" pathLength={1} strokeDasharray="1 1" style={{ strokeDashoffset: dash }} filter="url(#tb-bloom)"
                    />
                    <motion.circle
                      cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="#fff" strokeOpacity="0.95" strokeWidth="3.5"
                      strokeLinecap="round" pathLength={1} strokeDasharray="1 1" style={{ strokeDashoffset: dash }}
                    />
                  </>
                )}
              </g>
            )}
            {!flash && fraction > 0 && (
              <>
                <motion.circle cx={tipX} cy={tipY} r="10" fill={tint} fillOpacity="0.65" filter="url(#tb-tip)" />
                <motion.circle cx={tipX} cy={tipY} r="4.5" fill="#fff" />
              </>
            )}
          </svg>

          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <motion.span
              key={p.count}
              initial={{ scale: 1.14 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="block text-center"
            >
              <span
                className="block text-[70px] font-bold leading-none text-ink tabular-nums"
                style={{ textShadow: '0 0 12px rgba(255,255,255,0.8)' }}
              >
                {p.count}
              </span>
              <span className="mt-1.5 block text-[14px] text-ink/50">of {p.target}</span>
            </motion.span>
          </span>
        </motion.button>

        {/* Rounds */}
        <div className="glass rounded-[22px] px-6 py-2.5 text-center">
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-gold">Rounds completed</p>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={p.rounds}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="text-[24px] font-bold leading-tight text-ink"
            >
              {p.rounds}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
