import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Terms of use' };

export default function Terms() {
  const md = fs.readFileSync(path.join(process.cwd(), 'content/terms.md'), 'utf8');
  return <LegalPage markdown={md} />;
}
