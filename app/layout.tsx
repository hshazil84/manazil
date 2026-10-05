import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { MotionProvider } from '@/components/MotionProvider';

const sans = localFont({
  src: [
    { path: './fonts/DMSans-Regular.ttf', weight: '400' },
    { path: './fonts/DMSans-Medium.ttf', weight: '500' },
    { path: './fonts/DMSans-SemiBold.ttf', weight: '600' },
    { path: './fonts/DMSans-Bold.ttf', weight: '700' },
  ],
  variable: '--font-sans',
  display: 'swap',
});
const serif = localFont({
  src: './fonts/CooperLtBT-Regular.ttf',
  variable: '--font-serif',
  display: 'swap',
});
const arabic = localFont({
  src: './fonts/ScheherazadeNew-Regular.ttf',
  variable: '--font-arabic',
  display: 'swap',
});

const title = 'Manazil: Quran app for the Maldives';
const description =
  'The Quran, recitation, prayer times for every island, Qibla and reminders. Free, with no account and no ads.';

export const metadata: Metadata = {
  metadataBase: new URL('https://manazil.mv'),
  title: { default: title, template: '%s | Manazil' },
  description,
  openGraph: { title, description, url: 'https://manazil.mv', siteName: 'Manazil', type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
};

export const viewport: Viewport = { themeColor: '#FCFBF7', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${arabic.variable}`}>
      <body className="min-h-screen font-sans">
        <MotionProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
