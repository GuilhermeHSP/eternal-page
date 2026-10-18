import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

// Only the public pages. Tributes people bought stay out: their links are private gifts.
export default function sitemap(): MetadataRoute.Sitemap {
  const url = siteUrl();
  return [
    { url: `${url}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${url}/contato`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${url}/termos`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${url}/privacidade`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${url}/cookies`, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
