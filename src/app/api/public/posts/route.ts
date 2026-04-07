// GET /api/public/posts - Feed público de posts publicados (sin autenticación)
// Filtra por status='published' (pantojapropiedades.cl) OR published=true (degux.cl)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  tags: string[];
  readTime: number | null;
  authorUsername: string | null;
  authorFullName: string | null;
  authorAvatarUrl: string | null;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const tag = searchParams.get('tag');

    const tagFilter = tag
      ? Prisma.sql`AND p.tags @> ARRAY[${tag}]::text[]`
      : Prisma.empty;

    const [rows, countResult] = await Promise.all([
      prisma.$queryRaw<PostRow[]>`
        SELECT
          p.id,
          p.title,
          p.slug,
          p.excerpt,
          COALESCE(p.cover_image_url, p.image) AS "coverImageUrl",
          COALESCE(p.published_at, p.created_at) AS "publishedAt",
          COALESCE(p.tags, '{}')  AS tags,
          p.read_time         AS "readTime",
          dp.username         AS "authorUsername",
          dp.full_name        AS "authorFullName",
          dp.avatar_url       AS "authorAvatarUrl"
        FROM posts p
        LEFT JOIN degux_profiles dp ON dp.id = COALESCE(p.user_id, p.author_id)
        WHERE (p.status = 'published' OR p.published = TRUE)
        ${tagFilter}
        ORDER BY COALESCE(p.published_at, p.created_at) DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) AS count
        FROM posts p
        WHERE (p.status = 'published' OR p.published = TRUE)
        ${tagFilter}
      `,
    ]);

    const posts = rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      coverImageUrl: r.coverImageUrl,
      publishedAt: r.publishedAt,
      tags: r.tags,
      readTime: r.readTime,
      author: {
        username: r.authorUsername,
        fullName: r.authorFullName,
        avatarUrl: r.authorAvatarUrl,
      },
    }));

    const total = Number(countResult[0].count);

    return NextResponse.json({ posts, total, limit, offset });
  } catch (error) {
    console.error('[API public/posts GET Error]:', error);
    return NextResponse.json({ error: 'Error al obtener posts' }, { status: 500 });
  }
}
