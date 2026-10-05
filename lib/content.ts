import { faqs as defaultFaqs } from '@/components/faq-data';

/**
 * Site content that can be edited from /admin. It is read from Supabase with
 * the public anon key (the tables allow public reads) and cached for a minute.
 * If Supabase is not configured or cannot be reached, the built-in defaults
 * are used, so the site never breaks.
 */

export type StoreLinks = { ios: string; android: string };
export type Banner = { enabled: boolean; text: string; link_label: string; link_url: string };
export type Faq = { q: string; a: string };

const REVALIDATE = 60;

async function rest<T>(path: string): Promise<T | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/rest/v1/${path}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const safeUrl = (v: unknown) => {
  const s = typeof v === 'string' ? v.trim() : '';
  return /^https:\/\//i.test(s) ? s : '';
};

async function setting<T>(key: string): Promise<T | null> {
  const rows = await rest<{ value: T }[]>(`site_settings?key=eq.${key}&select=value`);
  return rows && rows[0] ? rows[0].value : null;
}

export async function getStoreLinks(): Promise<StoreLinks> {
  const v = await setting<Partial<StoreLinks>>('store_links');
  return { ios: safeUrl(v?.ios), android: safeUrl(v?.android) };
}

export async function getBanner(): Promise<Banner | null> {
  const v = await setting<Partial<Banner>>('banner');
  if (!v || !v.enabled || !v.text?.trim()) return null;
  const url = safeUrl(v.link_url);
  return {
    enabled: true,
    text: v.text.trim(),
    link_label: url ? (v.link_label?.trim() || 'Learn more') : '',
    link_url: url,
  };
}

export async function getFaqs(): Promise<Faq[]> {
  const rows = await rest<{ question: string; answer: string }[]>(
    'faqs?active=eq.true&select=question,answer&order=position.asc,created_at.asc',
  );
  if (rows && rows.length > 0) return rows.map((r) => ({ q: r.question, a: r.answer }));
  return defaultFaqs;
}
