'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CardText } from './CardText';

const items = [
  {
    title: 'Maghrib',
    body: 'Time to offer Maghrib in Malé City is 17:59. Praying in congregation is worth twenty-seven times more.',
    when: 'now',
  },
  { title: 'Evening adhkar', body: 'Close the day in His remembrance. Your evening adhkar are ready.', when: '2h' },
  { title: 'Al-Kahf', body: "Tonight is the night of Jumu'ah. Read Surah Al-Kahf, and let it be a light for you.", when: '5h' },
  { title: 'Your khatm', body: 'About 4 pages left for today. A few verses at a time is fine.', when: '8h' },
];

export function NotificationsCard() {
  return (
    <div className="card flex h-full flex-col gap-7 bg-gradient-to-b from-white to-wash p-7 sm:p-9">
      <CardText label="Reminders" title="Gentle, and on your phone.">
        Prayer times, adhkar, Surah Al-Kahf on Fridays, an evening reading nudge and your khatm. All scheduled on the phone, so they work without internet.
      </CardText>
      <div className="relative mt-auto space-y-2.5">
        {items.map((n, i) => (
          <motion.div
            key={n.title}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.15 + i * 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[20px] bg-white p-3.5 shadow-card ring-1 ring-ink/5"
          >
            <div className="flex items-center gap-2 text-[11.5px] text-ink/45">
              <Image src="/img/app-icon.png" alt="" width={17} height={17} className="rounded-[5px]" />
              <span className="font-medium">Manazil</span>
              <span>·</span>
              <span>{n.when}</span>
            </div>
            <p className="mt-1.5 text-[14.5px] font-semibold">{n.title}</p>
            <p className="mt-0.5 text-[13.2px] leading-snug text-ink/65">{n.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
