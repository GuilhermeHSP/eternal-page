import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The admin, the API and the steps of building and paying for a page.
      disallow: ['/admin', '/api/', '/preview', '/finalize', '/payment/', '/previa-ao-vivo'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
