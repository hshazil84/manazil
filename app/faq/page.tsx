import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqList } from '@/components/FaqList';
import { faqs } from '@/components/faq-data';

export const metadata: Metadata = { title: 'FAQ' };

export default function Faq() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  return (
    <div className="bg-gradient-to-b from-wash to-cream pb-24 pt-32 sm:pt-40">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-x max-w-3xl">
        <Link href="/" className="text-[14px] font-medium text-mint hover:underline">← Manazil</Link>
        <h1 className="mt-5 font-serif text-[42px] leading-[1.05] tracking-tight sm:text-[56px]">Questions</h1>
        <div className="mt-8">
          <FaqList />
        </div>
      </div>
    </div>
  );
}
