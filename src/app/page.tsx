'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/shared/hooks/useAuth';
import { createClient } from '@/shared/lib/supabase/client';
import { useNavbarActions } from '@/shared/components/layout/dashboard/navbar/useNavbarActions';
import { UserMenu } from '@/shared/components/layout/dashboard/navbar/UserMenu';
import { DeleteAccountDialog } from '@/shared/components/layout/dashboard/navbar/DeleteAccountDialog';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
  tags: string[];
  readTime: number | null;
  author: {
    username: string | null;
    fullName: string | null;
    avatarUrl: string | null;
  };
}

export default function Page() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navActions = useNavbarActions();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/posts?limit=20')
      .then(r => r.json())
      .then(data => setPosts(data.posts ?? []))
      .catch(() => setPosts([]))
      .finally(() => setPostsLoading(false));
  }, []);

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 md:px-8">
        <div className="max-w-4xl mx-auto h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight text-gray-900">
            inmo<span className="text-yellow-500">grid</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/referenciales"
              className="hidden sm:inline text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Referenciales
            </Link>

            {authLoading ? (
              // Skeleton mientras resuelve la sesión — evita flash entre
              // "no logueado" y "logueado" al recargar.
              <div className="h-8 w-24 rounded-full bg-gray-100 animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="hidden sm:block text-sm text-gray-600">
                  Hola, <span className="font-medium text-gray-900">{navActions.displayName}</span>
                </div>
                <UserMenu
                  avatarUrl={navActions.avatarUrl}
                  isOpen={navActions.isUserMenuOpen}
                  isSigningOut={navActions.isSigningOut}
                  isDeleting={navActions.isDeleting}
                  onToggle={() => navActions.setIsUserMenuOpen(!navActions.isUserMenuOpen)}
                  onSignOut={navActions.handleSignOut}
                  onDeleteAccount={navActions.handleDeleteAccount}
                  onCloseDropdown={() => navActions.setIsUserMenuOpen(false)}
                />
              </>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center gap-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 px-4 py-2 text-sm font-medium text-white transition-colors"
              >
                Iniciar sesión con Google
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Click-outside para cerrar el dropdown del UserMenu */}
      {navActions.isUserMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-0 bg-transparent"
          onClick={navActions.closeAllMenus}
          onKeyDown={(e) => {
            if (e.key === 'Escape') navActions.closeAllMenus();
          }}
          aria-label="Cerrar menú"
        />
      )}

      <DeleteAccountDialog
        open={navActions.showModal}
        isDeleting={navActions.isDeleting}
        onClose={() => navActions.setShowModal(false)}
        onConfirm={navActions.handleConfirmDelete}
      />

      {/* Feed */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Publicaciones</h1>
          <p className="mt-1 text-gray-500">Ideas, conocimiento y experiencias de la comunidad INMOGRID.</p>
        </div>

        {postsLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">Aún no hay publicaciones.</p>
            {!isAuthenticated && (
              <button
                onClick={handleGoogleSignIn}
                className="rounded-lg bg-yellow-500 hover:bg-yellow-400 px-6 py-3 text-sm font-medium text-white transition-colors"
              >
                Sé el primero — Iniciar sesión con Google
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const authorName = post.author.fullName ?? post.author.username ?? 'Anónimo';
  const authorHref = post.author.username ? `/${post.author.username}` : '#';
  const postHref = `/notas/${post.slug}`;
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <article className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="flex items-center gap-2 mb-3">
        {post.author.avatarUrl ? (
          <Image
            src={post.author.avatarUrl}
            alt={authorName}
            width={24}
            height={24}
            className="rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-bold text-yellow-700">
            {authorName[0]?.toUpperCase()}
          </div>
        )}
        <Link href={authorHref} className="text-sm font-medium text-gray-700 hover:text-gray-900">
          {authorName}
        </Link>
        {date && <span className="text-sm text-gray-400">· {date}</span>}
        {post.readTime && <span className="text-sm text-gray-400">· {post.readTime} min</span>}
      </div>

      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <Link href={postHref}>
            <h2 className="text-lg font-bold text-gray-900 hover:text-yellow-600 transition-colors leading-snug mb-1">
              {post.title}
            </h2>
          </Link>
          {post.excerpt && (
            <p className="text-gray-500 text-sm line-clamp-2">{post.excerpt}</p>
          )}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {post.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {post.coverImageUrl && (
          <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </article>
  );
}
