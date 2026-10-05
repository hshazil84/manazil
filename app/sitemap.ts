import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.manazilapp.com';
  return ['', '/faq', '/privacy', '/terms', '/credits'].map((p) => ({
    url: base + p,
    lastModified: new Date(),
  }));
}
