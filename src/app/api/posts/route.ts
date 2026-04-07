// API privada para gestionar posts del usuario autenticado
// GET /api/posts - Lista posts del usuario
// POST /api/posts - Crea un nuevo post

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { randomUUID } from 'crypto';

// Helper para generar slug único
function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, ''); // Remover guiones al inicio/fin

  const timestamp = Date.now().toString(36);
  return `${baseSlug}-${timestamp}`;
}

// GET - Lista posts del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    const authUser = await auth();
    if (!authUser?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');

    // Filtros
    const where: any = {
      userId: authUser.id,
    };

    if (published !== null) {
      where.published = published === 'true';
    }

    const posts = await prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        published: true,
        publishedAt: true,
        tags: true,
        readTime: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      posts,
      count: posts.length,
    });
  } catch (error) {
    console.error('[API Posts GET Error]:', error);
    return NextResponse.json(
      { error: 'Error al obtener posts' },
      { status: 500 }
    );
  }
}

// POST - Crea un nuevo post
export async function POST(request: NextRequest) {
  try {
    const authUser = await auth();
    if (!authUser?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      coverImageUrl,
      published = false,
      tags = [],
    } = body;

    // Validación
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Título y contenido son requeridos' },
        { status: 400 }
      );
    }

    // Generar slug único
    const slug = generateSlug(title);

    // Calcular tiempo de lectura (aproximado: 200 palabras por minuto)
    const words = content.split(/\s+/).length;
    const readTime = Math.ceil(words / 200);

    // Crear post
    const post = await prisma.post.create({
      data: {
        id: randomUUID(),
        userId: authUser.id,
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 160) + '...',
        coverImageUrl,
        published,
        publishedAt: published ? new Date() : null,
        tags,
        readTime,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        published: true,
        publishedAt: true,
        tags: true,
        readTime: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error('[API Posts POST Error]:', error);
    return NextResponse.json(
      { error: 'Error al crear post' },
      { status: 500 }
    );
  }
}
