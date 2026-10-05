'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const links = [
  { href: '/#features', label: 'Features' },
  { href: '/#privacy', label: 'Privacy' },
  { href: '/faq', label: 'FAQ' },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6"
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-300 sm:px-5 ${
          scrolled ? 'border border-white/80 bg-white/90 shadow-card backdrop-blur-xl' : 'border border-transparent'
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/img/app-icon.png" alt="" width={30} height={30} className="rounded-[9px]" />
          <span className="font-serif text-[22px] leading-none tracking-tight">Manazil</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-[14px] font-medium text-ink/65 transition-colors hover:bg-mint-bg hover:text-mint"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </motion.header>
  );
}
