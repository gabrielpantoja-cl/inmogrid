// API pública para obtener posts de un usuario
// GET /api/public/profiles/[username]/posts
// NO requiere autenticación

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const { searchParams } = new URL(request.url);

    // Parámetros opcionales
    const tag = searchParams.get('tag');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Buscar usuario por username
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, isPublicProfile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (!user.isPublicProfile) {
      return NextResponse.json(
        { error: 'Este perfil es privado' },
        { status: 403 }
      );
    }

    // Construir filtros
    const where: any = {
      userId: user.id,
      published: true, // Solo posts publicados
    };

    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    // Obtener posts
    const posts = await prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        tags: true,
        readTime: true,
        publishedAt: true,
        createdAt: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      posts,
      count: posts.length,
    });
  } catch (error) {
    console.error('[API Public Posts Error]:', error);
    return NextResponse.json(
      { error: 'Error al obtener posts' },
      { status: 500 }
    );
  }
}
