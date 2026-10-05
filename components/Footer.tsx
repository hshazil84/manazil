import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-ink/5 bg-wash">
      <div className="container-x flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-2.5">
            <Image src="/img/app-icon.png" alt="" width={30} height={30} className="rounded-[9px]" />
            <span className="font-serif text-[22px] leading-none">Manazil</span>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-ink/60">
            A Quran app for Maldivian Muslims. Published by Hasan Shazil, Malé, Maldives.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-14 gap-y-3 text-[14px] sm:grid-cols-3">
          <Link className="text-ink/65 hover:text-mint" href="/#features">Features</Link>
          <Link className="text-ink/65 hover:text-mint" href="/faq">FAQ</Link>
          <Link className="text-ink/65 hover:text-mint" href="/privacy">Privacy policy</Link>
          <Link className="text-ink/65 hover:text-mint" href="/terms">Terms of use</Link>
          <Link className="text-ink/65 hover:text-mint" href="/credits">Credits</Link>
          <a className="text-ink/65 hover:text-mint" href="mailto:hshazil@gmail.com">Contact</a>
        </div>
      </div>
      <div className="container-x border-t border-ink/5 py-5 text-[12.5px] text-ink/45">
        © {new Date().getFullYear()} Hasan Shazil. The Arabic text, translations and recitations belong to their authors and publishers.
      </div>
    </footer>
  );
}
