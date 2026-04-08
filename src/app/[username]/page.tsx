// Perfil público de usuario
// Ruta: /{username} (sin autenticación requerida)

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/shared/lib/prisma';
import ProfileHero from '@/shared/components/layout/profile/ProfileHero';
import ProfileBio from '@/shared/components/layout/profile/ProfileBio';
import SocialLinks from '@/shared/components/layout/profile/SocialLinks';

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  const profile = await prisma.profile.findUnique({
    where: { username },
    select: {
      id: true,
      fullName: true,
      username: true,
      avatarUrl: true,
      bio: true,
      tagline: true,
      coverImageUrl: true,
      location: true,
      identityTags: true,
      externalLinks: true,
      profession: true,
      company: true,
      website: true,
      linkedin: true,
      isPublicProfile: true,
      createdAt: true,
    },
  });

  if (!profile || !profile.isPublicProfile) {
    notFound();
  }

  // Obtener posts recientes (solo publicados)
  const posts = await prisma.post.findMany({
    where: {
      userId: profile.id,
      published: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImageUrl: true,
      tags: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <ProfileHero
        name={profile.fullName || profile.username || 'Usuario'}
        username={profile.username}
        tagline={profile.tagline}
        image={profile.avatarUrl}
        coverImageUrl={profile.coverImageUrl}
        identityTags={profile.identityTags}
      />

      {/* Contenido Principal */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        {/* Bio Section */}
        <div className="mb-8">
          <ProfileBio
            bio={profile.bio}
            location={profile.location}
            profession={profile.profession || undefined}
            company={profile.company}
            website={profile.website}
          />
        </div>

        {/* Social Links */}
        {profile.externalLinks && (
          <div className="mb-12 rounded-xl bg-white p-6 shadow-md md:p-8">
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              📬 Contacto y redes
            </h2>
            <SocialLinks externalLinks={profile.externalLinks} />
          </div>
        )}

        {/* Posts Recientes */}
        {posts.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-800">
                📝 Notas Recientes
              </h2>
              <a
                href={`/${username}/notas`}
                className="text-green-700 underline hover:text-green-600"
              >
                Ver todas →
              </a>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <a
                  key={post.id}
                  href={`/${username}/notas/${post.slug}`}
                  className="group overflow-hidden rounded-xl bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  {post.coverImageUrl && (
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="mb-2 text-xl font-bold text-gray-800">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mb-3 line-clamp-2 text-gray-600">
                        {post.excerpt}
                      </p>
                    )}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Footer del perfil */}
        <div className="mt-16 border-t border-gray-200 pt-8 text-center text-gray-500">
          <p className="text-sm">
            Perfil en{' '}
            <Link href="/" className="font-semibold text-green-700 hover:underline">
              degux.cl
            </Link>
            {' '} - Ecosistema digital colaborativo
          </p>
          <p className="mt-2 text-xs">
            Miembro desde {new Date(profile.createdAt).toLocaleDateString('es-CL', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;

  const profile = await prisma.profile.findUnique({
    where: { username },
    select: {
      fullName: true,
      username: true,
      bio: true,
      tagline: true,
      avatarUrl: true,
    },
  });

  if (!profile) {
    return { title: 'Perfil no encontrado | degux.cl' };
  }

  return {
    title: `${profile.fullName || profile.username} | degux.cl`,
    description: profile.tagline || profile.bio?.substring(0, 160) || `Perfil de ${profile.fullName} en degux.cl`,
    openGraph: {
      title: profile.fullName || profile.username,
      description: profile.tagline || profile.bio?.substring(0, 160),
      images: profile.avatarUrl ? [profile.avatarUrl] : [],
    },
  };
}
