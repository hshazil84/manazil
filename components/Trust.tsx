import Link from 'next/link';
import { Reveal } from './Reveal';

const points = [
  {
    t: 'No account',
    b: 'Manazil never asks for your email or phone number. There are no ads, no analytics and no tracking.',
  },
  {
    t: 'Saved on your phone',
    b: 'Your saved verses, notes, reading activity, settings and location stay on your phone. Deleting the app deletes them.',
  },
  {
    t: 'Verse Finder',
    b: 'Your recording is sent to OpenAI’s speech-to-text service to find the verse, and deleted from your phone as soon as it is sent. We do not save recordings.',
  },
];

export function Trust() {
  return (
    <section id="privacy" className="scroll-mt-24 bg-deep py-20 text-white sm:py-28">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <p className="label !text-gold-light">Privacy</p>
          <h2 className="mt-3 font-serif text-[38px] leading-[1.06] tracking-tight sm:text-[52px]">
            Only one thing leaves your phone.
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-white/65">
            A recording, and only when you use Verse Finder.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {points.map((p, i) => (
            <Reveal key={p.t} delay={i * 0.1}>
              <div className="h-full rounded-[26px] border border-white/10 bg-white/[0.04] p-7">
                <h3 className="text-[19px] font-semibold">{p.t}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-white/65">{p.b}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10">
          <Link href="/privacy" className="inline-flex items-center gap-2 text-[15px] font-semibold text-gold-light hover:text-white">
            Read the privacy policy <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
