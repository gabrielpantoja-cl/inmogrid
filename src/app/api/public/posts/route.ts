// GET /api/public/posts - Feed público de posts publicados (sin autenticación)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const tag = searchParams.get('tag');

    const where: Record<string, unknown> = { published: true };
    if (tag) {
      where.tags = { has: tag };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImageUrl: true,
          publishedAt: true,
          tags: true,
          readTime: true,
          author: {
            select: {
              username: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({ posts, total, limit, offset });
  } catch (error) {
    console.error('[API public/posts GET Error]:', error);
    return NextResponse.json({ error: 'Error al obtener posts' }, { status: 500 });
  }
}
