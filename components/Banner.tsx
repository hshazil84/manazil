'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Banner as BannerData } from '@/lib/content';

/** Announcement set from /admin. A floating pill that can be dismissed for the visit. */
export function Banner({ banner }: { banner: BannerData | null }) {
  const [hidden, setHidden] = useState(true);
  const key = banner ? `manazil-banner:${banner.text}` : '';

  useEffect(() => {
    if (!banner) return;
    try {
      setHidden(sessionStorage.getItem(key) === '1');
    } catch {
      setHidden(false);
    }
  }, [banner, key]);

  if (!banner) return null;
  const close = () => {
    setHidden(true);
    try {
      sessionStorage.setItem(key, '1');
    } catch {}
  };

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ duration: 0.35, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4"
        >
          <div className="glass pointer-events-auto flex max-w-[560px] items-center gap-3 rounded-full py-2 pl-5 pr-2 shadow-float">
            <span className="h-2 w-2 shrink-0 rounded-full bg-gold-soft" />
            <p className="text-[14px] leading-snug text-ink/80">
              {banner.text}
              {banner.link_url && (
                <>
                  {' '}
                  <a href={banner.link_url} className="font-semibold text-mint underline-offset-2 hover:underline">
                    {banner.link_label}
                  </a>
                </>
              )}
            </p>
            <button
              onClick={close}
              aria-label="Dismiss"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink/50 transition hover:bg-ink/5 hover:text-ink"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m2 2 8 8M10 2l-8 8" /></svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
