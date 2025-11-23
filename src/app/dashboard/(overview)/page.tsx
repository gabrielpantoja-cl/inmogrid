import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import DashboardContent from './DashboardContent';
import DisclaimerPopup from '@/components/ui/dashboard/DisclaimerPopup';
import { prisma } from '@/lib/prisma';
import type { User, Post } from '@prisma/client';
import { Suspense } from 'react';

// Tipos mejorados
interface LatestPost extends Pick<Post, 'id' | 'title' | 'excerpt' | 'slug' | 'createdAt'> {
  User: Pick<User, 'name' | 'username'>;
}

interface DashboardError extends Error {
  code?: string;
  meta?: Record<string, unknown>;
}

export const metadata = {
  title: 'Panel de Control',
  description: 'Panel de control'
};

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <p className="text-red-700">{message}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // ✅ PERMITIR ACCESO ANÓNIMO - Mostrar contenido limitado si no hay sesión
  // if (!session) {
  //   redirect('/auth/signin');
  // }

  try {
    const [latestPosts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        take: 5,
        where: { published: true },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          excerpt: true,
          slug: true,
          createdAt: true,
          User: {
            select: {
              name: true,
              username: true,
            },
          },
        },
      }),
      prisma.post.count({ where: { published: true } }),
    ]);

    return (
      <>
        <DisclaimerPopup />
        <Suspense fallback={<div>Cargando panel de control...</div>}>
          <DashboardContent 
            session={session}
            latestPosts={latestPosts as LatestPost[]}
            totalPosts={totalPosts}
          />
        </Suspense>
      </>
    );

  } catch (error) {
    console.error('[Dashboard Error]:', error);
    
    const dashboardError = error as DashboardError;

    if (dashboardError.code === 'P2002') {
      return <ErrorMessage message="Error de restricción única en la base de datos." />;
    }
    
    if (dashboardError.code === 'P2025') {
      return <ErrorMessage message="No se encontró el registro solicitado." />;
    }

    return <ErrorMessage message="Error al cargar el dashboard. Por favor, intente nuevamente." />;
  }
}

