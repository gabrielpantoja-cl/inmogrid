import { getUser } from '@/shared/lib/supabase/auth';
import DashboardContent from './DashboardContent';
import { prisma } from '@/shared/lib/prisma';
import { Suspense } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface LatestPost {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  createdAt: Date;
  author: { fullName: string | null; username: string | null } | null;
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
  const user: SupabaseUser | null = await getUser();

  try {
    const [latestPosts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        take: 5,
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          excerpt: true,
          slug: true,
          createdAt: true,
          author: {
            select: {
              fullName: true,
              username: true,
            },
          },
        },
      }),
      prisma.post.count({ where: { published: true } }),
    ]);

    return (
      <Suspense fallback={<div>Cargando panel de control...</div>}>
        <DashboardContent
          user={user}
          latestPosts={latestPosts as LatestPost[]}
          totalPosts={totalPosts}
        />
      </Suspense>
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
