'use client';

import Link from 'next/link';
import { lusitana } from '@/lib/styles/fonts';
import { Session } from 'next-auth';
import {
  UserGroupIcon,
  DocumentTextIcon,
  SparklesIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface LatestPost {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  createdAt: Date;
  user: {
    name: string | null;
    username: string | null;
  };
}

interface DashboardContentProps {
  session: Session | null; // ✅ Permitir sesión nula para modo anónimo
  latestPosts: LatestPost[];
  totalPosts: number;
}

export default function DashboardContent({
  session,
  latestPosts,
  totalPosts,
}: DashboardContentProps) {
  return (
    <main className="flex flex-col space-y-6">
      {/* Bienvenida */}
      <div className="rounded-xl bg-gradient-to-r from-green-50 to-blue-50 p-6 shadow-sm border border-green-200">
        {session?.user ? (
          <div className="space-y-2">
            <h1 className={`${lusitana.className} text-2xl md:text-3xl text-gray-800`}>
              👋 ¡Hola, <span className="font-bold text-green-700">{session.user.name}</span>!
            </h1>
            <p className="text-gray-600">
              Bienvenid@ a <span className="font-semibold text-green-700">degux.cl</span> 🌱 - Tu ecosistema digital colaborativo
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <h1 className={`${lusitana.className} text-2xl md:text-3xl text-gray-800`}>
              👋 Bienvenid@ a degux.cl
            </h1>
            <p className="text-gray-600">
              <Link href="/auth/signin" className="font-semibold text-green-700 underline hover:text-green-600">
                Inicia sesión
              </Link> para crear tu perfil y conectar con la comunidad.
            </p>
          </div>
        )}
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/perfil"
          className="group p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-green-300 transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <UserGroupIcon className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
                Mi Perfil
              </h3>
              <p className="text-sm text-gray-500">
                Edita tu información y personaliza tu espacio
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/notas"
          className="group p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <DocumentTextIcon className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                Mis Notas
              </h3>
              <p className="text-sm text-gray-500">
                Crea y gestiona tus publicaciones
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/plantas"
          className="group p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <SparklesIcon className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                Mis Plantas
              </h3>
              <p className="text-sm text-gray-500">
                Comparte tu colección y conocimientos
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Feed de Actividad Reciente */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className={`${lusitana.className} text-xl md:text-2xl mb-6 text-gray-800`}>
          📰 Feed de la Comunidad ({totalPosts} publicaciones)
        </h2>

        <div className="space-y-4">
          {latestPosts?.length > 0 ? (
            latestPosts.map((post) => (
              <div key={post.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                <Link href={`/${post.user.username}/posts/${post.slug}`} className="block group">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <NewspaperIcon className="w-4 h-4 mr-1" />
                    <span>
                      {post.user.name} &bull;{' '}
                      {formatDistanceToNowStrict(parseISO(post.createdAt.toISOString()), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <NewspaperIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-600 mb-2">
                ¡Sé el primero en publicar!
              </p>
              <p className="text-sm max-w-md mx-auto">
                No hay publicaciones recientes en la comunidad.
                <Link href="/dashboard/notas" className="text-green-700 underline ml-1">
                  Crea tu primera publicación aquí.
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}