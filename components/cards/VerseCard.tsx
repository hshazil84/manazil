'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { CardText } from './CardText';

const tabs = {
  Verse: {
    ar: 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
    en: 'For indeed, with hardship [will be] ease',
    src: 'Ash-Sharh 94:5',
  },
  Hadith: {
    ar: '',
    en: 'Actions are judged by intentions, and everyone will have what they intended.',
    src: 'Sahih al-Bukhari 1',
  },
  Dua: {
    ar: 'رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةً وَفِى ٱلْـَٔاخِرَةِ حَسَنَةً وَقِنَا عَذَابَ ٱلنَّارِ',
    en: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
    src: 'Al-Baqarah 2:201',
  },
} as const;

type Tab = keyof typeof tabs;

export function VerseCard() {
  const [tab, setTab] = useState<Tab>('Verse');
  const t = tabs[tab];
  return (
    <div className="card flex h-full flex-col gap-6 bg-gradient-to-br from-white via-white to-[#fbf3e4] p-7 sm:p-9">
      <CardText label="Every day" title="A verse, hadith or dua each day.">
        Turn any of them into an image with your own photo and share it.
      </CardText>
      <div className="mt-auto rounded-[22px] bg-white p-4 shadow-card ring-1 ring-ink/5">
        <div className="flex gap-1.5 text-[13px] font-semibold">
          {(Object.keys(tabs) as Tab[]).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                k === tab ? 'bg-mint-bg text-mint' : 'text-ink/40 hover:text-ink/70'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="min-h-[148px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              {t.ar && (
                <p dir="rtl" lang="ar" className="mt-4 font-arabic text-[26px] leading-[1.9]">
                  {t.ar}
                </p>
              )}
              <p className={`text-[14.5px] leading-snug text-ink/65 ${t.ar ? 'mt-2' : 'mt-4'}`}>{t.en}</p>
              <p className="mt-3 text-[12px] font-medium text-gold">{t.src}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
