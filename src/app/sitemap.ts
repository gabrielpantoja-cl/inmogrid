import { MetadataRoute } from 'next'
import prisma from '@/shared/lib/prisma'

const BASE_URL = 'https://degux.cl'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Páginas estáticas públicas
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/mapa-conceptual`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Posts publicados (dinámicos)
  let postRoutes: MetadataRoute.Sitemap = []
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })

    postRoutes = posts
      .filter(p => p.slug)
      .map(p => ({
        url: `${BASE_URL}/notas/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))
  } catch {
    // Si falla la DB en build time, continúa sin posts dinámicos
  }

  return [...staticRoutes, ...postRoutes]
}
