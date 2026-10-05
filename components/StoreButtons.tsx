import Image from 'next/image';
import type { StoreLinks } from '@/lib/content';

/** Store buttons. Each one stays a disabled "coming soon" until its link is set in /admin. */
export function StoreButtons({ links, dark = false }: { links?: StoreLinks; dark?: boolean }) {
  const base = 'inline-flex items-center gap-2.5 rounded-full py-2.5 pl-3 pr-5 text-[14px] font-semibold';
  const off = `${base} cursor-not-allowed select-none ${
    dark ? 'bg-white/10 text-white/80 ring-1 ring-white/20' : 'bg-ink/[0.06] text-ink/60 ring-1 ring-ink/10'
  }`;
  const on = `${base} bg-ink text-white shadow-card transition hover:-translate-y-0.5 hover:bg-deep`;

  const items = [
    { href: links?.ios, icon: '/img/appstore.png', name: 'App Store', live: 'Download on the' },
    { href: links?.android, icon: '/img/googleplay.png', name: 'Google Play', live: 'Get it on' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((it) => {
        const inner = (
          <>
            <Image src={it.icon} alt="" width={24} height={24} className={`h-6 w-6 ${it.href ? '' : 'opacity-50 grayscale'}`} />
            {it.href ? (
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] font-medium opacity-70">{it.live}</span>
                <span>{it.name}</span>
              </span>
            ) : (
              <>
                {it.name} <span className="text-[11px] font-medium opacity-70">coming soon</span>
              </>
            )}
          </>
        );
        return it.href ? (
          <a key={it.name} href={it.href} target="_blank" rel="noopener noreferrer" className={on}>
            {inner}
          </a>
        ) : (
          <span key={it.name} aria-disabled className={off}>
            {inner}
          </span>
        );
      })}
    </div>
  );
}
