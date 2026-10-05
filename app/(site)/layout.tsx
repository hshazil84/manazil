import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Banner } from '@/components/Banner';
import { MotionProvider } from '@/components/MotionProvider';
import { getBanner } from '@/lib/content';

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const banner = await getBanner();
  return (
    <MotionProvider>
      <Nav />
      <main>{children}</main>
      <Footer />
      <Banner banner={banner} />
    </MotionProvider>
  );
}
