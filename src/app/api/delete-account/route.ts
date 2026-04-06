import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/auth';
import { prisma } from '@/lib/prisma';

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
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verificar si el usuario tiene contenido asociado
    const [postsCount, collectionsCount, plantsCount] = await Promise.all([
      prisma.post.count({ where: { userId: authUser.id } }),
      prisma.collection.count({ where: { userId: authUser.id } }),
      prisma.plant.count({ where: { userId: authUser.id } })
    ]);

    const totalContent = postsCount + collectionsCount + plantsCount;

    if (totalContent > 0) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'No es posible eliminar tu cuenta debido a que tienes contenido publicado. Por favor, elimina primero tus posts, colecciones y plantas antes de continuar.',
          error: 'HAS_ASSOCIATED_CONTENT',
          content: {
            posts: postsCount,
            collections: collectionsCount,
            plants: plantsCount
          }
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Eliminar cuenta y todos los datos asociados en transacción
    await prisma.$transaction([
      // Eliminar conexiones (como requester y receiver)
      prisma.connection.deleteMany({ where: { requesterId: authUser.id } }),
      prisma.connection.deleteMany({ where: { receiverId: authUser.id } }),
      // Eliminar mensajes del chat
      prisma.chatMessage.deleteMany({ where: { userId: authUser.id } }),
      // Eliminar logs de auditoría
      prisma.auditLog.deleteMany({ where: { userId: authUser.id } }),
      // Eliminar sesiones y cuentas OAuth (NextAuth legacy — kept for existing rows)
      prisma.account.deleteMany({ where: { userId: authUser.id } }),
      prisma.session.deleteMany({ where: { userId: authUser.id } }),
      // Finalmente eliminar el usuario
      prisma.user.delete({ where: { id: authUser.id } })
    ]);

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: 'Tu cuenta ha sido eliminada exitosamente. Gracias por usar nuestros servicios.'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Ocurrió un error al intentar eliminar tu cuenta. Por favor, inténtalo de nuevo más tarde.',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
