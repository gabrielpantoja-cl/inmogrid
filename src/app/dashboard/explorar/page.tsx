import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Explorar | degux.cl',
  description: 'Descubre perfiles y notas de la comunidad degux.cl',
};

type PostRow = {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  createdAt: Date;
  authorFullName: string | null;
  authorUsername: string | null;
};

export default async function ExplorarPage() {
  const [recentPosts, recentProfiles] = await Promise.all([
    prisma.$queryRaw<PostRow[]>`
      SELECT
        p.id,
        p.title,
        p.excerpt,
        p.slug,
        p.created_at AS "createdAt",
        dp.full_name  AS "authorFullName",
        dp.username   AS "authorUsername"
      FROM posts p
      LEFT JOIN degux_profiles dp ON dp.id = p.author_id
      WHERE p.status = 'published'
      ORDER BY p.created_at DESC
      LIMIT 10
    `,
    prisma.profile.findMany({
      take: 10,
      where: { isPublicProfile: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        username: true,
        avatarUrl: true,
        profession: true,
      },
    }),
  ]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Explorar</h1>

      {/* Notas recientes */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Notas recientes</h2>
        {recentPosts.length === 0 ? (
          <p className="text-gray-500 text-sm">Aun no hay notas publicadas.</p>
        ) : (
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={post.authorUsername ? `/${post.authorUsername}/notas/${post.slug}` : `/notas/${post.slug}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <h3 className="font-medium text-gray-900">{post.title}</h3>
                {post.excerpt && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  {post.authorFullName} &middot;{' '}
                  {new Date(post.createdAt).toLocaleDateString('es-CL')}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Perfiles publicos */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Perfiles recientes</h2>
        {recentProfiles.length === 0 ? (
          <p className="text-gray-500 text-sm">Aun no hay perfiles publicos.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentProfiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/${profile.username}`}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName || ''}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium">
                    {(profile.fullName || '?')[0]}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{profile.fullName}</p>
                  {profile.profession && (
                    <p className="text-xs text-gray-500">{profile.profession}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
