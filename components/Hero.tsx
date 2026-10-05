'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { StoreButtons } from './StoreButtons';
import type { StoreLinks } from '@/lib/content';

/** CSS-driven entrance values: they start at first paint, with no wait for JavaScript. */
const rise = (delay: number, duration: number, y: number, x = 0) =>
  ({ '--rdelay': `${delay}s`, '--rd': `${duration}s`, '--ry': `${y}px`, '--rx': `${x}px` }) as React.CSSProperties;

function Blob({ className }: { className: string }) {
  return <div aria-hidden className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} />;
}

export function Hero({ links }: { links?: StoreLinks }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const chipA = useTransform(scrollYProgress, [0, 1], [0, -130]);
  const chipB = useTransform(scrollYProgress, [0, 1], [0, -30]);

  return (
    <section ref={ref} className="relative overflow-hidden pt-28 sm:pt-32">
      <Blob className="-left-40 top-0 h-[420px] w-[420px] bg-gold-light/25" />
      <Blob className="right-[-120px] top-24 h-[480px] w-[480px] bg-[#cfe7da]/70" />
      <Blob className="bottom-[-160px] left-1/3 h-[360px] w-[520px] bg-[#f6d8c4]/50" />

      {/* fades the glow out so it does not end in a hard line at the section edge */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-56 bg-gradient-to-b from-transparent to-cream" />

      <div className="container-x relative grid items-center gap-10 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pb-28">
        <div className="max-w-xl">
          <p className="rise label" style={rise(0, 0.4, 14)}>
            Made in Malé
          </p>
          <h1
            className="rise mt-4 font-serif text-[44px] leading-[1.04] tracking-tight sm:text-[58px] lg:text-[68px]"
            style={rise(0.05, 0.5, 14)}
          >
            The Quran, made for the Maldives.
          </h1>
          <p className="rise mt-6 max-w-md text-[18px] leading-relaxed text-ink/65" style={rise(0.12, 0.5, 12)}>
            Read and listen to the Quran with Dhivehi and English translations. Prayer times for every island, a Qibla compass and gentle reminders. Free, with no account and no ads.
          </p>
          <div className="rise mt-9" style={rise(0.2, 0.5, 12)}>
            <StoreButtons links={links} />
          </div>
        </div>

        <div className="relative mx-auto h-[580px] w-full max-w-[520px] sm:h-[720px] lg:h-[760px]">
          {/* soft ground glow under the phone */}
          <div aria-hidden className="absolute bottom-6 left-1/2 h-24 w-64 -translate-x-1/2 rounded-full bg-ink/20 blur-3xl" />
          <div aria-hidden className="absolute bottom-[38px] left-1/2 h-12 w-[260px] -translate-x-1/2 rounded-[50%] bg-ink/25 blur-2xl lg:w-[300px]" />

          <div className="absolute left-1/2 top-0 w-[280px] -translate-x-1/2 sm:w-[350px] lg:w-[385px]">
            {/* Three separate layers so no two animations fight over the same property:
                scroll parallax (outer) → entrance → idle float (inner). */}
            <motion.div style={{ y: phoneY, willChange: 'transform' }}>
              <div className="rise" style={rise(0.08, 0.6, 28)}>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                  style={{ willChange: 'transform' }}
                >
                  <Image
                    src="/img/onboarding_home.webp"
                    alt="Manazil Home screen showing the next prayer, the verse of the day and quick tiles"
                    width={800}
                    height={1461}
                    priority
                    sizes="(min-width: 1024px) 385px, (min-width: 640px) 350px, 280px"
                    className="h-auto w-full"
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* notification chip */}
          <motion.div
            style={{ y: chipA }}
            className="absolute -left-1 top-[96px] z-10 w-[236px] sm:-left-6 sm:top-[130px] sm:w-[280px] lg:-left-14 lg:top-[64px]"
          >
           <div className="rise" style={rise(0.3, 0.5, 0, -24)}>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
              className="glass rounded-[22px] p-3.5 shadow-float"
            >
              <div className="flex items-center gap-2 text-[11.5px] text-ink/50">
                <span className="grid h-[18px] w-[18px] place-items-center overflow-hidden rounded-[5px]">
                  <Image src="/img/app-icon.png" alt="" width={18} height={18} />
                </span>
                <span className="font-medium">Manazil</span>
                <span>·</span>
                <span>now</span>
              </div>
              <p className="mt-1.5 text-[14.5px] font-semibold">Maghrib</p>
              <p className="mt-0.5 text-[13px] leading-snug text-ink/65">
                Time to offer Maghrib in Malé City is 17:59
              </p>
            </motion.div>
           </div>
          </motion.div>

          {/* qibla chip */}
          <motion.div
            style={{ y: chipB }}
            className="absolute -right-1 bottom-[120px] z-10 sm:-right-4 sm:bottom-[170px] lg:-right-10 lg:bottom-[190px]"
          >
           <div className="rise" style={rise(0.4, 0.5, 0, 24)}>
            <motion.div
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
              className="glass flex items-center gap-3 rounded-[22px] py-3 pl-3 pr-5 shadow-float"
            >
              <Image src="/img/qibla_3d.png" alt="" width={46} height={52} className="h-[52px] w-auto" />
              <div>
                <p className="label !text-[10px]">Qibla</p>
                <p className="text-[19px] font-bold leading-tight">301° WNW</p>
              </div>
            </motion.div>
           </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
