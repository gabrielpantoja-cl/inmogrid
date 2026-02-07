import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Explorar | degux.cl',
  description: 'Descubre perfiles, notas y plantas de la comunidad degux.cl',
};

export default async function ExplorarPage() {
  const [recentPosts, recentUsers] = await Promise.all([
    prisma.post.findMany({
      take: 10,
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        createdAt: true,
        User: {
          select: { name: true, username: true },
        },
      },
    }),
    prisma.user.findMany({
      take: 10,
      where: { isPublicProfile: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
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
                href={`/${post.User.username}/notas/${post.slug}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <h3 className="font-medium text-gray-900">{post.title}</h3>
                {post.excerpt && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  {post.User.name} &middot;{' '}
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
        {recentUsers.length === 0 ? (
          <p className="text-gray-500 text-sm">Aun no hay perfiles publicos.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentUsers.map((user) => (
              <Link
                key={user.id}
                href={`/${user.username}`}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || ''}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium">
                    {(user.name || '?')[0]}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  {user.profession && (
                    <p className="text-xs text-gray-500">{user.profession}</p>
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
