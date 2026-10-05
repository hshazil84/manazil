import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { Trust } from '@/components/Trust';
import { Cta } from '@/components/Cta';
import { getStoreLinks } from '@/lib/content';

export const revalidate = 60;

export default async function Home() {
  const links = await getStoreLinks();
  return (
    <>
      <Hero links={links} />
      <Features />
      <Trust />
      <Cta links={links} />
    </>
  );
}
