import { NextResponse } from 'next/server';
import { getUser } from '@/shared/lib/supabase/auth';
import { prisma } from '@/shared/lib/prisma';

export async function DELETE() {
  try {
    const authUser = await getUser();

    if (!authUser?.id) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'No tienes autorización para realizar esta acción. Por favor, inicia sesión.',
          error: 'UNAUTHORIZED'
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar si el usuario tiene posts publicados
    const postsCount = await prisma.post.count({ where: { userId: authUser.id } });

    if (postsCount > 0) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'No es posible eliminar tu cuenta porque tienes posts publicados. Elimínalos primero.',
          error: 'HAS_ASSOCIATED_CONTENT',
          content: { posts: postsCount }
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Eliminar perfil — FK CASCADE elimina conexiones, mensajes, logs, etc.
    await prisma.profile.delete({ where: { id: authUser.id } });

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: 'Tu cuenta ha sido eliminada exitosamente. Gracias por usar nuestros servicios.'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Ocurrió un error al intentar eliminar tu cuenta. Por favor, inténtalo de nuevo más tarde.',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
