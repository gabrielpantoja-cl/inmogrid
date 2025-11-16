// Perfil público de usuario
// Ruta: /{username} (sin autenticación requerida)

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProfileHero from '@/components/ui/profile/ProfileHero';
import ProfileBio from '@/components/ui/profile/ProfileBio';
import SocialLinks from '@/components/ui/profile/SocialLinks';
import PlantCard from '@/components/ui/profile/PlantCard';

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // Obtener perfil de usuario
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
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

  // Si no existe o no es público
  if (!user || !user.isPublicProfile) {
    notFound();
  }

  // Obtener plantas del usuario (solo favoritas para home)
  const plants = await prisma.plant.findMany({
    where: {
      userId: user.id,
      isFavorite: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      scientificName: true,
      description: true,
      mainImageUrl: true,
      category: true,
      difficulty: true,
      isFavorite: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 6,
  });

  // Obtener posts recientes (solo publicados)
  const posts = await prisma.post.findMany({
    where: {
      userId: user.id,
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
    orderBy: {
      publishedAt: 'desc',
    },
    take: 3,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <ProfileHero
        name={user.name || user.username || 'Usuario'}
        username={user.username}
        tagline={user.tagline}
        image={user.image}
        coverImageUrl={user.coverImageUrl}
        identityTags={user.identityTags}
      />

      {/* Contenido Principal */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        {/* Bio Section */}
        <div className="mb-8">
          <ProfileBio
            bio={user.bio}
            location={user.location}
            profession={user.profession || undefined}
            company={user.company}
            website={user.website}
          />
        </div>

        {/* Social Links */}
        {user.externalLinks && (
          <div className="mb-12 rounded-xl bg-white p-6 shadow-md md:p-8">
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              📬 Contacto y redes
            </h2>
            <SocialLinks externalLinks={user.externalLinks} />
          </div>
        )}

        {/* Plantas Favoritas */}
        {plants.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-green-800">
                💚 Mis Plantas Favoritas
              </h2>
              <a
                href={`/${username}/plantas`}
                className="text-green-700 underline hover:text-green-600"
              >
                Ver todas →
              </a>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plants.map((plant) => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  username={user.username}
                />
              ))}
            </div>
          </section>
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
            <a href="/" className="font-semibold text-green-700 hover:underline">
              degux.cl
            </a>
            {' '} - Ecosistema digital colaborativo
          </p>
          <p className="mt-2 text-xs">
            Miembro desde {new Date(user.createdAt).toLocaleDateString('es-CL', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

// Generar metadata dinámica para SEO
export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      name: true,
      username: true,
      bio: true,
      tagline: true,
      image: true,
    },
  });

  if (!user) {
    return {
      title: 'Perfil no encontrado | degux.cl',
    };
  }

  return {
    title: `${user.name || user.username} | degux.cl`,
    description: user.tagline || user.bio?.substring(0, 160) || `Perfil de ${user.name} en degux.cl`,
    openGraph: {
      title: user.name || user.username,
      description: user.tagline || user.bio?.substring(0, 160),
      images: user.image ? [user.image] : [],
    },
  };
}
