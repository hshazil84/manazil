import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Credits' };

const sections: { title: string; items: [string, string][] }[] = [
  {
    title: 'Quran text',
    items: [
      ['Arabic text', 'Uthmani and IndoPak text from the Quran Printing Complex text files published at github.com/nuqayah/qpc-fonts (Uthmanic Hafs v22 and Hafs Nastaleeq v10).'],
      ['Mushaf pages', 'Data provided by QUL, the Quranic Universal Library (qul.tarteel.ai): page layout and word data for the Madinah Mushaf, 1421H print.'],
      ['Page fonts', 'The page-by-page glyph fonts (QCF V2) are from the King Fahd Glorious Quran Printing Complex.'],
      ['Uthmani font', 'Uthmanic Hafs, King Fahd Glorious Quran Printing Complex.'],
      ['IndoPak font', 'AlQuran IndoPak by QuranWBW (quranwbw.com), made by Ayman Siddiqui, based on Al Qalam Quran Majeed. © Al Qalam, Ghandhara, KFGQPC.'],
    ],
  },
  {
    title: 'Translations and audio',
    items: [
      ['Dhivehi', 'Office of the President of Maldives. Abu Bakr Ibrahim Ali (Bakurube).'],
      ['English', 'Saheeh International.'],
      ['Data', 'Translation files compiled through github.com/fawazahmed0/quran-api.'],
      ['Audio', 'Verse-by-verse audio served by everyayah.com.'],
    ],
  },
  {
    title: 'Prayer times',
    items: [
      ['Maldives tables', 'Island times follow the tables of the Maldives Islamic Ministry. The island data comes from the Namaadhu app by Naffah Abdulla Rasheed, github.com/n4ff4h/namaadhu_app, used under the MIT licence.'],
    ],
  },
  {
    title: 'Duas and hadith',
    items: [
      ['Hisnul Muslim', 'Fortress of the Muslim by Sa’id bin Ali bin Wahf al-Qahtani. Text compiled from github.com/wafaaelmaandy/Hisn-Muslim-Json and github.com/rn0x/Adhkar-json.'],
      ['Dhivehi translation of the duas', 'Sheikh Mohamed Ibrahim (Naifaru).'],
    ],
  },
  {
    title: 'Verse Finder',
    items: [['Speech recognition', 'Uses OpenAI Whisper to turn your recitation into text, so the verse can be found.']],
  },
  {
    title: 'Typefaces',
    items: [['Fonts', 'DM Sans and DM Serif Display, Colophon Foundry. Scheherazade New, SIL International. All under the SIL Open Font License.']],
  },
];

export default function Credits() {
  return (
    <div className="bg-gradient-to-b from-wash to-cream pb-24 pt-32 sm:pt-40">
      <div className="container-x max-w-3xl">
        <Link href="/" className="text-[14px] font-medium text-mint hover:underline">← Manazil</Link>
        <h1 className="mt-5 font-serif text-[42px] leading-[1.05] tracking-tight sm:text-[56px]">Credits</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-ink/65">
          Manazil is built on the work of many people. Thank you to everyone listed here.
        </p>
        <div className="mt-8 space-y-6">
          {sections.map((s) => (
            <section key={s.title} className="rounded-[28px] border border-ink/5 bg-white p-7 shadow-card sm:p-9">
              <p className="label">{s.title}</p>
              <dl className="mt-4 space-y-4">
                {s.items.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[15px] font-semibold">{k}</dt>
                    <dd className="mt-0.5 text-[14.5px] leading-relaxed text-ink/65">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
        <p className="mt-8 text-[13.5px] text-ink/50">
          The Arabic text, fonts, translations and recitations belong to their authors and publishers.
        </p>
      </div>
    </div>
  );
}
