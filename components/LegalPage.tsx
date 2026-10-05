import Link from 'next/link';
import { Fragment } from 'react';

function linkify(text: string) {
  const parts = text.split(/(hshazil@gmail\.com|openai\.com\/policies|everyayah\.com)/g);
  return parts.map((p, i) => {
    if (p === 'hshazil@gmail.com') return <a key={i} className="font-medium text-mint underline underline-offset-2" href="mailto:hshazil@gmail.com">{p}</a>;
    if (p === 'openai.com/policies') return <a key={i} className="font-medium text-mint underline underline-offset-2" href="https://openai.com/policies">{p}</a>;
    if (p === 'everyayah.com') return <a key={i} className="font-medium text-mint underline underline-offset-2" href="https://everyayah.com">{p}</a>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

type Block = { type: 'h2' | 'p' | 'ul'; text?: string; items?: string[] };

function parse(md: string): { title: string; blocks: Block[] } {
  let title = '';
  const blocks: Block[] = [];
  for (const raw of md.split('\n')) {
    const line = raw.trimEnd();
    if (!line.trim()) continue;
    if (line.startsWith('# ')) title = line.slice(2);
    else if (line.startsWith('## ')) blocks.push({ type: 'h2', text: line.slice(3) });
    else if (line.startsWith('- ')) {
      const last = blocks[blocks.length - 1];
      if (last && last.type === 'ul') last.items!.push(line.slice(2));
      else blocks.push({ type: 'ul', items: [line.slice(2)] });
    } else blocks.push({ type: 'p', text: line });
  }
  return { title, blocks };
}

export function LegalPage({ markdown }: { markdown: string }) {
  const { title, blocks } = parse(markdown);
  return (
    <div className="bg-gradient-to-b from-wash to-cream pb-24 pt-32 sm:pt-40">
      <article className="container-x max-w-3xl">
        <Link href="/" className="text-[14px] font-medium text-mint hover:underline">← Manazil</Link>
        <h1 className="mt-5 font-serif text-[42px] leading-[1.05] tracking-tight sm:text-[56px]">{title}</h1>
        <div className="mt-8 rounded-[28px] border border-ink/5 bg-white p-7 shadow-card sm:p-10">
          {blocks.map((b, i) => {
            if (b.type === 'h2')
              return <h2 key={i} className="mt-9 text-[20px] font-bold first:mt-0">{b.text}</h2>;
            if (b.type === 'ul')
              return (
                <ul key={i} className="mt-3 space-y-2 pl-1">
                  {b.items!.map((it, j) => (
                    <li key={j} className="flex gap-3 text-[15.5px] leading-relaxed text-ink/70">
                      <span aria-hidden className="mt-[10px] h-[5px] w-[5px] shrink-0 rounded-full bg-gold-soft" />
                      <span>{linkify(it)}</span>
                    </li>
                  ))}
                </ul>
              );
            const meta = b.text!.startsWith('Last updated');
            return (
              <p key={i} className={meta ? 'text-[13.5px] text-ink/45' : 'mt-3 text-[15.5px] leading-relaxed text-ink/70'}>
                {linkify(b.text!)}
              </p>
            );
          })}
        </div>
      </article>
    </div>
  );
}
