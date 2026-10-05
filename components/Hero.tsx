import Image from 'next/image';
import { StoreButtons } from './StoreButtons';
import type { StoreLinks } from '@/lib/content';

/** CSS-driven entrance values: they start at first paint, with no wait for JavaScript. */
const rise = (delay: number, duration: number, y: number, x = 0) =>
  ({ '--rdelay': `${delay}s`, '--rd': `${duration}s`, '--ry': `${y}px`, '--rx': `${x}px` }) as React.CSSProperties;

/** Idle float, run by the compositor (CSS) rather than JavaScript. */
const float = (distance: number, duration: number, delay: number) =>
  ({ '--fy': `${distance}px`, '--fd': `${duration}s`, '--fdelay': `${delay}s` }) as React.CSSProperties;

/**
 * A soft colour field. Plain radial gradient, no blur filter: big blurred layers
 * show as tiled rectangles and scroll choppily in iOS Safari.
 */
function Glow({ className, rgb, alpha }: { className: string; rgb: string; alpha: number }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{ background: `radial-gradient(closest-side, rgba(${rgb},${alpha}) 0%, rgba(${rgb},${alpha * 0.7}) 35%, rgba(${rgb},0) 100%)` }}
    />
  );
}

export function Hero({ links }: { links?: StoreLinks }) {
  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32">
      <Glow className="-left-56 -top-24 h-[620px] w-[620px]" rgb="232,184,74" alpha={0.3} />
      <Glow className="-right-48 -top-8 h-[700px] w-[700px]" rgb="207,231,218" alpha={0.85} />
      <Glow className="-bottom-60 left-1/4 h-[560px] w-[760px]" rgb="246,216,196" alpha={0.6} />

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
            Your companion for Quran, Dhikr, and reflection
          </h1>
          <p className="rise mt-6 max-w-md text-[18px] leading-relaxed text-ink/65" style={rise(0.12, 0.5, 12)}>
            Read and listen to the Quran with Dhivehi and English translations. Prayer times for every island, a Qibla compass and gentle reminders. Free, with no account and no ads.
          </p>
          <div className="rise mt-9" style={rise(0.2, 0.5, 12)}>
            <StoreButtons links={links} />
          </div>
        </div>

        <div className="relative mx-auto h-[580px] w-full max-w-[520px] sm:h-[720px] lg:h-[760px]">
          {/* soft ground shadow under the phone */}
          <div
            aria-hidden
            className="absolute bottom-0 left-1/2 h-40 w-[420px] -translate-x-1/2"
            style={{ background: 'radial-gradient(closest-side, rgba(22,36,31,0.22), rgba(22,36,31,0.08) 55%, rgba(22,36,31,0) 100%)' }}
          />

          <div className="absolute left-1/2 top-0 w-[280px] -translate-x-1/2 sm:w-[350px] lg:w-[385px]">
            <div className="rise" style={rise(0.08, 0.6, 28)}>
              <div className="float" style={float(-10, 6, 1.2)}>
                <Image
                  src="/img/onboarding_home.webp"
                  alt="Manazil Home screen showing the next prayer, the verse of the day and quick tiles"
                  width={800}
                  height={1461}
                  priority
                  sizes="(min-width: 1024px) 385px, (min-width: 640px) 350px, 280px"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>

          {/* notification chip: sits below the greeting so the name stays readable */}
          <div className="absolute -left-1 top-[112px] z-10 w-[236px] sm:-left-6 sm:top-[170px] sm:w-[280px] lg:-left-14 lg:top-[190px]">
            <div className="rise" style={rise(0.3, 0.5, 0, -24)}>
              <div className="float rounded-[22px] border border-ink/5 bg-white p-3.5 shadow-float" style={float(8, 5, 1.4)}>
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
              </div>
            </div>
          </div>

          {/* qibla chip */}
          <div className="absolute -right-1 bottom-[120px] z-10 sm:-right-4 sm:bottom-[170px] lg:-right-10 lg:bottom-[190px]">
            <div className="rise" style={rise(0.4, 0.5, 0, 24)}>
              <div className="float flex items-center gap-3 rounded-[22px] border border-ink/5 bg-white py-3 pl-3 pr-5 shadow-float" style={float(-9, 5.5, 1.6)}>
                <Image src="/img/qibla_3d.png" alt="" width={46} height={52} className="h-[52px] w-auto" />
                <div>
                  <p className="label !text-[10px]">Qibla</p>
                  <p className="text-[19px] font-bold leading-tight">301° WNW</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
