'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CardText } from './CardText';
import { AppOrb } from './AppOrb';

const bars = [0.35, 0.7, 0.5, 1, 0.6, 0.85, 0.4, 0.75, 0.45];

export function FinderCard() {
  // 0 idle, 1 listening, 2 matching, 3 result
  const [step, setStep] = useState(0);
  useEffect(() => {
    const times = [1500, 3200, 1100, 5200];
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const next = () => {
      t = setTimeout(() => {
        i = (i + 1) % 4;
        setStep(i);
        next();
      }, times[i]);
    };
    next();
    return () => clearTimeout(t);
  }, []);

  const energy = step === 1 ? 1 : step === 2 ? 0.6 : 0.2;
  return (
    <div className="card grid h-full gap-8 p-7 sm:p-9 lg:grid-cols-[1fr_1fr] lg:items-center">
      {/* The app's drifting colour fields, across the whole card */}
      {/* Plain radial gradients on one box: no blur layers, so the rounded corners clip every browser the same way */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[27px]"
        style={{
          backgroundColor: '#fdfaf3',
          backgroundImage: [
            'radial-gradient(circle 250px at calc(100% - 30px) 10px, rgba(242,213,138,0.62), rgba(242,213,138,0) 100%)',
            'radial-gradient(circle 260px at 50px calc(33% + 150px), rgba(159,220,192,0.58), rgba(159,220,192,0) 100%)',
            'radial-gradient(circle 240px at calc(75% - 150px) calc(100% - 30px), rgba(246,201,168,0.48), rgba(246,201,168,0) 100%)',
          ].join(','),
        }}
      />
      <CardText label="Verse Finder" title="Recite a few words. Find the verse." className="relative">
        Tap the orb and recite. Manazil works out which verse it is and opens it. It asks before the first recording, and needs the internet.
      </CardText>

      <div className="relative min-h-[300px]">
        <AnimatePresence mode="wait">
          {step < 3 ? (
            <motion.div
              key="orb"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
              className="flex h-[260px] flex-col items-center justify-center"
            >
              <div className="relative grid h-[150px] w-[150px] place-items-center">
                {step === 1 && (
                  <>
                    <motion.span
                      className="absolute inset-[10px] rounded-full border border-gold-soft/60"
                      animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <motion.span
                      className="absolute inset-[10px] rounded-full border border-gold-soft/60"
                      animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
                    />
                  </>
                )}
                <AppOrb energy={energy} size={150} />
                <span className="pointer-events-none absolute inset-0 grid place-items-center">
                  {step === 1 ? (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="#B8791F" aria-hidden><rect x="6" y="6" width="12" height="12" rx="3" /></svg>
                  ) : (
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="#2F5C4C" opacity={step === 2 ? 0.35 : 0.9} aria-hidden>
                      <path d="M12 14.5a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 1 0-7 0v5a3.5 3.5 0 0 0 3.5 3.5Zm6-3.5a1 1 0 1 0-2 0 4 4 0 0 1-8 0 1 1 0 1 0-2 0 6 6 0 0 0 5 5.9V19H9.5a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2H13v-2.1A6 6 0 0 0 18 11Z" />
                    </svg>
                  )}
                </span>
              </div>
              <div className="mt-5 flex h-8 items-center gap-[5px]">
                {bars.map((b, i) => (
                  <motion.span
                    key={i}
                    className="w-[4px] rounded-full bg-gold-soft"
                    animate={
                      step === 1
                        ? { height: [6, 8 + b * 22, 6 + b * 6, 8 + b * 22, 6] }
                        : { height: step === 2 ? 6 : 4, opacity: step === 2 ? 0.5 : 0.3 }
                    }
                    transition={{ duration: 0.9 + i * 0.05, repeat: step === 1 ? Infinity : 0, ease: 'easeInOut' }}
                  />
                ))}
              </div>
              <p className="mt-3 text-[14px] font-semibold">
                {step === 0 ? 'Find a verse' : step === 1 ? 'Listening…' : 'Looking for the verse…'}
              </p>
              <p className="text-[12.5px] text-ink/50">
                {step === 0 ? 'Tap the orb and recite a few words' : step === 1 ? 'Recite a few words' : 'One moment'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-[260px] items-center"
            >
              <div className="w-full rounded-[22px] bg-white p-5 shadow-card ring-1 ring-ink/5">
                <div className="flex items-center justify-between">
                  <p className="label">Match</p>
                  <p className="text-[12px] font-semibold text-mint">Taa-Haa 20:14</p>
                </div>
                <p dir="rtl" lang="ar" className="mt-3 font-arabic text-[27px] leading-[1.9] text-ink">
                  إِنَّنِىٓ أَنَا ٱللَّهُ لَآ إِلَٰهَ إِلَّآ أَنَا۠ فَٱعْبُدْنِى وَأَقِمِ ٱلصَّلَوٰةَ لِذِكْرِىٓ
                </p>
                <p className="mt-2 text-[13.5px] leading-snug text-ink/60">
                  Indeed, I am Allah. There is no deity except Me, so worship Me and establish prayer for My remembrance.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
