// src/app/[username]/notas/[slug]/page.tsx

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NotePageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: NotePageProps) {
  const { username, slug } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, name: true },
  });

  if (!user) return { title: 'Nota no encontrada' };

  const post = await prisma.post.findFirst({
    where: { slug, userId: user.id, published: true },
    select: { title: true, excerpt: true },
  });

  if (!post) return { title: 'Nota no encontrada' };

  return {
    title: `${post.title} | by ${user.name || username}`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
    },
  };
}

export default async function NotePage({ params }: NotePageProps) {
  const { username, slug } = await params;

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

  const post = await prisma.post.findFirst({
    where: {
      slug,
      userId: user.id,
      published: true,
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-600">
          <Link href={`/${username}`} className="hover:text-blue-700 hover:underline">
            {user.name || username}
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/${username}/notas`} className="hover:text-blue-700 hover:underline">
            Notas
          </Link>
        </nav>

        {/* Post Header */}
        <header className="mb-8">
          <h1 className="mb-3 text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
            {post.title}
          </h1>
          {post.publishedAt && (
            <p className="text-base text-gray-500">
              Publicado el {new Date(post.publishedAt).toLocaleDateString('es-CL', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          )}
        </header>

        {/* Post Content */}
        <article className="prose prose-lg max-w-none prose-indigo">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </article>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center gap-2">
            <span className="font-semibold">Etiquetas:</span>
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                {tag}
              </span>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
