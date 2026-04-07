// API privada para operaciones con un post específico
// GET /api/posts/[id] - Obtiene un post
// PUT /api/posts/[id] - Actualiza un post
// DELETE /api/posts/[id] - Elimina un post

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - Obtiene un post del usuario autenticado
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await auth();
    if (!authUser?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const post = await prisma.post.findFirst({
      where: {
        id,
        userId: authUser!.id, // Solo posts del usuario
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
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

    if (!post) {
      return NextResponse.json(
        { error: 'Post no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error('[API Post GET Error]:', error);
    return NextResponse.json(
      { error: 'Error al obtener post' },
      { status: 500 }
    );
  }
}

// PUT - Actualiza un post del usuario autenticado
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await auth();
    if (!authUser?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      coverImageUrl,
      published,
      tags,
    } = body;

    // Verificar que el post pertenece al usuario
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        userId: authUser!.id,
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post no encontrado' },
        { status: 404 }
      );
    }

    // Preparar datos de actualización
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) {
      updateData.content = content;
      // Recalcular tiempo de lectura
      const words = content.split(/\s+/).length;
      updateData.readTime = Math.ceil(words / 200);
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl;
    if (tags !== undefined) updateData.tags = tags;

    // Manejar cambio de estado de publicación
    if (published !== undefined) {
      updateData.published = published;
      if (published && !existingPost.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    // Actualizar post
    const post = await prisma.post.update({
      where: { id },
      data: updateData,
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
    console.error('[API Post PUT Error]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar post' },
      { status: 500 }
    );
  }
}

// DELETE - Elimina un post del usuario autenticado
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await auth();
    if (!authUser?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verificar que el post pertenece al usuario antes de eliminar
    const post = await prisma.post.findFirst({
      where: {
        id,
        userId: authUser!.id,
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar post
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Post eliminado correctamente',
    });
  } catch (error) {
    console.error('[API Post DELETE Error]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar post' },
      { status: 500 }
    );
  }
}
