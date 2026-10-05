import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Privacy policy' };

export default function Privacy() {
  const md = fs.readFileSync(path.join(process.cwd(), 'content/privacy.md'), 'utf8');
  return <LegalPage markdown={md} />;
}
