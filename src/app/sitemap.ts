import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

export const revalidate = 3600; // 1 hora (ISR)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/unidades`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/sobre`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/para-proprietarios`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/para-proprietarios/simulacao`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/termos`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/politica-de-privacidade`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/politica-de-cancelamento`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ];

  // Páginas dinâmicas — listings da Stays.net
  let listingPages: MetadataRoute.Sitemap = [];
  try {
    const { fetchListings } = await import('@/services/staysService');
    const listings = await fetchListings();
    listingPages = listings.map((listing: { id: string; _updatedAt?: string }) => ({
      url: `${baseUrl}/unidades/${listing.id}`,
      lastModified: listing._updatedAt ? new Date(listing._updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (err) {
    console.error('[Sitemap] Erro ao buscar listings:', err);
  }

  // Páginas dinâmicas — blog posts
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const { listPublishedPostsServer } = await import('@/services/cmsServiceServer');
    const posts = await listPublishedPostsServer(100);
    blogPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt || post.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error('[Sitemap] Erro ao buscar blog posts:', err);
  }

  return [...staticPages, ...listingPages, ...blogPages];
}
