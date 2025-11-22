// src/app/[username]/notas/page.tsx

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

interface NotesPageProps {
  params: {
    username: string;
  };
}

export default async function NotesPage({ params }: NotesPageProps) {
  const { username } = params;

  // 1. Get user
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      isPublicProfile: true,
    },
  });

  if (!user || !user.isPublicProfile) {
    notFound();
  }

  // 2. Get all published posts for this user
  const posts = await prisma.post.findMany({
    where: {
      userId: user.id,
      published: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
  });

  const totalPosts = posts.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 py-12 text-white">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <Link
            href={`/${username}`}
            className="mb-4 inline-block text-sm opacity-90 hover:opacity-100"
          >
            ← Volver al perfil de {user.name || username}
          </Link>
          <h1 className="mb-2 text-4xl font-bold">📝 Notas Recientes</h1>
          <p className="text-lg opacity-90">
            {totalPosts} {totalPosts === 1 ? 'nota publicada' : 'notas publicadas'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        {posts.length > 0 ? (
          <div className="space-y-8">
            {posts.map((post) => (
              <Link href={`/${username}/notas/${post.slug}`} key={post.id} className="block rounded-xl bg-white p-6 shadow-md transition hover:shadow-lg">
                <article>
                  <h2 className="mb-2 text-2xl font-bold text-gray-900">{post.title}</h2>
                  {post.publishedAt && (
                    <time dateTime={post.publishedAt.toISOString()} className="text-sm text-gray-500">
                      {new Date(post.publishedAt).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  )}
                  <p className="mt-4 text-gray-700">{post.excerpt}</p>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-white p-12 text-center shadow-md">
            <p className="text-xl text-gray-600">
              Aún no hay notas publicadas en este perfil.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
