import { getUser } from '@/shared/lib/supabase/auth';
import DashboardContent from './DashboardContent';
import { prisma } from '@/shared/lib/prisma';
import { Suspense } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// La tabla `posts` tiene columnas legacy fuera del Prisma schema,
// por eso usamos $queryRaw en lugar de prisma.post.findMany.
interface LatestPostRow {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  createdAt: Date;
  authorFullName: string | null;
  authorUsername: string | null;
}

interface LatestPost {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  createdAt: Date;
  author: { fullName: string | null; username: string | null } | null;
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
    const [rows, countResult] = await Promise.all([
      prisma.$queryRaw<LatestPostRow[]>`
        SELECT
          p.id,
          p.title,
          p.excerpt,
          p.slug,
          p.created_at   AS "createdAt",
          dp.full_name   AS "authorFullName",
          dp.username    AS "authorUsername"
        FROM posts p
        LEFT JOIN inmogrid_profiles dp ON dp.id = p.author_id
        WHERE p.status = 'published'
        ORDER BY p.created_at DESC
        LIMIT 5
      `,
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) AS count
        FROM posts
        WHERE status = 'published'
      `,
    ]);

    const latestPosts: LatestPost[] = rows.map((r) => ({
      id: r.id,
      title: r.title,
      excerpt: r.excerpt,
      slug: r.slug,
      createdAt: r.createdAt,
      author: {
        fullName: r.authorFullName,
        username: r.authorUsername,
      },
    }));

    const totalPosts = Number(countResult[0]?.count ?? 0);

    return (
      <Suspense fallback={<div>Cargando panel de control...</div>}>
        <DashboardContent
          user={user}
          latestPosts={latestPosts}
          totalPosts={totalPosts}
        />
      </Suspense>
    );

  } catch (error) {
    console.error('[Dashboard Error]:', error);
    return <ErrorMessage message="Error al cargar el dashboard. Por favor, intente nuevamente." />;
  }
}
