'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { createClient } from '@/shared/lib/supabase/client';
import { PostCard, type PostCardData } from '@/shared/components/posts/PostCard';
import { EcosystemSidebar } from '@/shared/components/layout/public/EcosystemSidebar';

export default function Page() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [showFarewell, setShowFarewell] = useState(false);

  useEffect(() => {
    fetch('/api/public/posts?limit=20')
      .then((r) => r.json())
      .then((data) => setPosts(data.posts ?? []))
      .catch(() => setPosts([]))
      .finally(() => setPostsLoading(false));
  }, []);

  // Banner de despedida tras eliminación de cuenta. Limpiamos el query
  // param con replace (no push) para que un F5 o una URL compartida no
  // reviva el banner inadvertidamente.
  useEffect(() => {
    if (searchParams.get('farewell') === '1') {
      setShowFarewell(true);
      router.replace('/', { scroll: false });
    }
  }, [searchParams, router]);

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-10">
      {showFarewell && (
        <div
          role="status"
          aria-live="polite"
          className="mb-8 flex items-start gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4"
        >
          <div className="flex-1">
            <h2 className="text-base font-semibold text-emerald-900">
              Gracias por haber sido parte de nuestra comunidad
            </h2>
            <p className="mt-1 text-sm text-emerald-800">
              Tu cuenta y tus datos fueron eliminados. La puerta siempre estará
              abierta para volver cuando quieras.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowFarewell(false)}
            aria-label="Cerrar mensaje"
            className="shrink-0 rounded-md p-1 text-emerald-700 transition-colors hover:bg-emerald-100 hover:text-emerald-900"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <section className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          Tu comunidad inmobiliaria
        </h1>
        <p className="mt-3 text-gray-600 text-base md:text-lg max-w-2xl">
          Ecosistema integral para potenciar la visibilidad profesional y el acceso
          a datos — foro, blog, chat con IA, calendario de eventos y mapa interactivo
          de referenciales del mercado chileno.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {!isAuthenticated && (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors"
            >
              Iniciar sesión con Google
            </button>
          )}
          <Link
            href="/referenciales"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-800 transition-colors"
          >
            Explorar el mapa →
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section id="publicaciones" className="lg:col-span-2 order-2 lg:order-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-5">Publicaciones</h2>

          {postsLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-400 text-lg mb-4">Aún no hay publicaciones.</p>
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="rounded-lg bg-primary hover:bg-primary/90 px-6 py-3 text-sm font-medium text-primary-foreground transition-colors"
                >
                  Sé el primero — Iniciar sesión con Google
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>

        <div className="lg:col-span-1 order-1 lg:order-2">
          <EcosystemSidebar />
        </div>
      </div>
    </main>
  );
}
