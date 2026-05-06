import { MetadataRoute } from 'next';
import { articles } from './lib/articles';

export default function sitemap(): MetadataRoute.Sitemap {
  // Alltid bruk produksjonsdomenet — aldri Vercel-preview-URL
  const base = 'https://codemedic.no';
  return [
    { url: base,                  lastModified: new Date(), changeFrequency: 'weekly',  priority: 1   },
    { url: `${base}/fix/new`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/blogg`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    ...articles.map(a => ({
      url: `${base}/blogg/${a.slug}`,
      lastModified: new Date(a.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${base}/kontakt`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/login`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/personvern`,  lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
