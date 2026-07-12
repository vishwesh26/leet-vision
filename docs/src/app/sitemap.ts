import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const revalidate = 86400; // Revalidate every day

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const canonicalBaseUrl = 'https://leet-vision.com/docs';

  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${canonicalBaseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${canonicalBaseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  try {
    // Fetch all published subtopics
    const subtopics = await prisma.subTopic.findMany({
      select: { slug: true, updatedAt: true }
    });

    const dynamicRoutes: MetadataRoute.Sitemap = subtopics.map((subtopic) => ({
      url: `${canonicalBaseUrl}/concept/${subtopic.slug}`,
      lastModified: subtopic.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    }));

    return [...routes, ...dynamicRoutes];
  } catch (error) {
    console.error("Failed to generate sitemap for subtopics", error);
    return routes; // Return at least the base routes if DB fails
  }
}
