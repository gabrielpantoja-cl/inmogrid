import { notFound } from 'next/navigation';
import { prisma } from '@/shared/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  params: Promise<{ slug: string }>;
}

type PostRow = {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image: string | null;
  slug: string;
  category: string | null;
  createdAt: Date;
  authorFullName: string | null;
  authorUsername: string | null;
  authorAvatarUrl: string | null;
};

async function getPost(slug: string): Promise<PostRow | null> {
  const rows = await prisma.$queryRaw<PostRow[]>`
    SELECT
      p.id,
      p.title,
      p.content,
      p.excerpt,
      p.image,
      p.slug,
      p.category,
      p.created_at      AS "createdAt",
      dp.full_name      AS "authorFullName",
      dp.username       AS "authorUsername",
      dp.avatar_url     AS "authorAvatarUrl"
    FROM posts p
    LEFT JOIN degux_profiles dp ON dp.id = p.author_id
    WHERE p.slug = ${slug}
      AND p.status = 'published'
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Nota no encontrada' };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: { title: post.title, description: post.excerpt ?? '' },
  };
}

export default async function NotaPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const authorName = post.authorFullName ?? post.authorUsername ?? 'Anónimo';
  const authorHref = post.authorUsername ? `/${post.authorUsername}` : '#';

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 md:px-8">
        <div className="max-w-3xl mx-auto h-14 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="font-black text-gray-900 text-base">
            DEG<span className="text-yellow-500">UX</span>
          </Link>
          <span>/</span>
          <Link href="/" className="hover:text-gray-900">Publicaciones</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-10">
        {/* Header */}
        <header className="mb-8">
          {post.category && (
            <span className="text-xs font-semibold uppercase tracking-wide text-yellow-600 mb-3 block">
              {post.category}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-3">
            {post.authorAvatarUrl ? (
              <Image
                src={post.authorAvatarUrl}
                alt={authorName}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-sm font-bold text-yellow-700">
                {authorName[0]?.toUpperCase()}
              </div>
            )}
            <div className="text-sm text-gray-500">
              <Link href={authorHref} className="font-medium text-gray-700 hover:text-gray-900">
                {authorName}
              </Link>
              <span className="mx-1">·</span>
              {new Date(post.createdAt).toLocaleDateString('es-CL', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </div>
          </div>
        </header>

        {/* Cover image */}
        {post.image && (
          <div className="mb-8 rounded-xl overflow-hidden aspect-video relative">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <article className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-yellow-600 prose-a:no-underline hover:prose-a:underline">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </article>
      </main>
    </div>
  );
}
