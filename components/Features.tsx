import { Reveal } from './Reveal';
import { PrayerCard } from './cards/PrayerCard';
import { NotificationsCard } from './cards/NotificationsCard';
import { FinderCard } from './cards/FinderCard';
import { QiblaCard } from './cards/QiblaCard';
import { MushafCard } from './cards/MushafCard';
import { TasbihCard } from './cards/TasbihCard';
import { VerseCard } from './cards/VerseCard';
import { DuaCard } from './cards/DuaCard';
import { ReflectionsCard } from './cards/ReflectionsCard';

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 bg-gradient-to-b from-cream to-wash py-20 sm:py-28">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <p className="label">Features</p>
          <h2 className="mt-3 font-serif text-[38px] leading-[1.06] tracking-tight sm:text-[52px]">
            Quran, prayer and remembrance in one app.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-8"><PrayerCard /></Reveal>
          <Reveal className="lg:col-span-4 lg:row-span-2" delay={0.08}><NotificationsCard /></Reveal>
          <Reveal className="lg:col-span-8"><FinderCard /></Reveal>
          <Reveal className="lg:col-span-4"><QiblaCard /></Reveal>
          <Reveal className="lg:col-span-8" delay={0.08}><MushafCard /></Reveal>
          <Reveal className="lg:col-span-4"><TasbihCard /></Reveal>
          <Reveal className="lg:col-span-4" delay={0.08}><VerseCard /></Reveal>
          <Reveal className="lg:col-span-4" delay={0.16}><DuaCard /></Reveal>
          <Reveal className="lg:col-span-12"><ReflectionsCard /></Reveal>
        </div>
      </div>
    </section>
  );
}
