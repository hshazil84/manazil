import Image from 'next/image';
import { Reveal } from './Reveal';
import { StoreButtons } from './StoreButtons';
import type { StoreLinks } from '@/lib/content';

export function Cta({ links }: { links?: StoreLinks }) {
  const ios = !!links?.ios;
  const android = !!links?.android;
  const headline =
    ios && android
      ? 'Get Manazil on iPhone, iPad and Android.'
      : ios
        ? 'Now on the App Store.'
        : android
          ? 'Now on Google Play.'
          : 'Coming soon to iPhone, iPad and Android.';
  return (
    <section className="relative overflow-hidden bg-wash py-20 sm:py-28">
      <div className="container-x">
        <Reveal>
          <div className="card flex flex-col items-start gap-8 bg-gradient-to-br from-white to-mint-bg p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
            <div className="max-w-lg">
              <Image src="/img/app-icon.png" alt="" width={56} height={56} className="rounded-[14px] shadow-card" />
              <h2 className="mt-5 font-serif text-[34px] leading-[1.08] tracking-tight sm:text-[44px]">
                {headline}
              </h2>
              <p className="mt-3 text-[16px] leading-relaxed text-ink/60">
                Free. No account. No ads.
              </p>
            </div>
            <StoreButtons links={links} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
