// Página individual de planta
// Ruta: /{username}/plantas/{slug}

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface PlantPageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

export default async function PlantPage({ params }: PlantPageProps) {
  const { username, slug } = await params;

  // Obtener usuario
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

  // Obtener planta
  const plant = await prisma.plant.findFirst({
    where: {
      slug,
      userId: user.id,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      scientificName: true,
      description: true,
      careInstructions: true,
      imageUrls: true,
      mainImageUrl: true,
      category: true,
      difficulty: true,
      sunlight: true,
      watering: true,
      origin: true,
      isFavorite: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!plant) {
    notFound();
  }

  const defaultImage =
    'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=800&h=600&fit=crop';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link
            href={`/${username}`}
            className="hover:text-green-700 hover:underline"
          >
            {user.name || username}
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/${username}/plantas`}
            className="hover:text-green-700 hover:underline"
          >
            Plantas
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-800">{plant.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-md md:p-8">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-green-800">
                {plant.name}
              </h1>
              {plant.scientificName && (
                <p className="text-xl italic text-gray-500">
                  {plant.scientificName}
                </p>
              )}
            </div>
            {plant.isFavorite && (
              <div className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                ❤️ Favorita
              </div>
            )}
          </div>

          {/* Metadata Tags */}
          <div className="flex flex-wrap gap-2">
            {plant.category && (
              <span className="rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-700">
                {plant.category}
              </span>
            )}
            {plant.difficulty && (
              <span className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
                {plant.difficulty}
              </span>
            )}
            {plant.sunlight && (
              <span className="rounded-full bg-yellow-100 px-4 py-1.5 text-sm font-medium text-yellow-700">
                ☀️ {plant.sunlight}
              </span>
            )}
            {plant.watering && (
              <span className="rounded-full bg-cyan-100 px-4 py-1.5 text-sm font-medium text-cyan-700">
                💧 {plant.watering}
              </span>
            )}
            {plant.origin && (
              <span className="rounded-full bg-purple-100 px-4 py-1.5 text-sm font-medium text-purple-700">
                📍 {plant.origin}
              </span>
            )}
          </div>
        </div>

        {/* Galería de Imágenes */}
        <div className="mb-8">
          {plant.imageUrls && plant.imageUrls.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {plant.imageUrls.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative h-80 overflow-hidden rounded-xl bg-gray-100 shadow-md"
                >
                  <Image
                    src={imageUrl}
                    alt={`${plant.name} - Imagen ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative h-96 overflow-hidden rounded-xl bg-gray-100 shadow-md">
              <Image
                src={plant.mainImageUrl || defaultImage}
                alt={plant.name}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Historia y Descripción */}
        {plant.description && (
          <section className="mb-8 rounded-xl bg-white p-6 shadow-md md:p-8">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-800">
              <span>💚</span> Mi historia con esta planta
            </h2>
            <div className="whitespace-pre-wrap text-lg leading-relaxed text-gray-700">
              {plant.description}
            </div>
          </section>
        )}

        {/* Cuidados */}
        {plant.careInstructions && (
          <section className="mb-8 rounded-xl bg-white p-6 shadow-md md:p-8">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-800">
              <span>🌱</span> Cuidados y consejos
            </h2>
            <div className="whitespace-pre-wrap text-lg leading-relaxed text-gray-700">
              {plant.careInstructions}
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="mt-12 rounded-xl bg-white p-6 text-center shadow-md">
          <p className="mb-4 text-gray-600">
            ¿Te gustó esta planta? Visita mi perfil para ver más
          </p>
          <Link
            href={`/${username}/plantas`}
            className="inline-block rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600"
          >
            Ver todas mis plantas
          </Link>
        </div>

        {/* Metadata Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Agregada el{' '}
            {new Date(plant.createdAt).toLocaleDateString('es-CL', {
              day: 'numeric',
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
export async function generateMetadata({ params }: PlantPageProps) {
  const { username, slug } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, name: true },
  });

  if (!user) {
    return {
      title: 'Planta no encontrada | degux.cl',
    };
  }

  const plant = await prisma.plant.findFirst({
    where: {
      slug,
      userId: user.id,
    },
    select: {
      name: true,
      scientificName: true,
      description: true,
      mainImageUrl: true,
    },
  });

  if (!plant) {
    return {
      title: 'Planta no encontrada | degux.cl',
    };
  }

  return {
    title: `${plant.name} | ${user.name} | degux.cl`,
    description:
      plant.description?.substring(0, 160) ||
      `${plant.name} ${plant.scientificName ? `(${plant.scientificName})` : ''} - Planta de ${user.name} en degux.cl`,
    openGraph: {
      title: plant.name,
      description: plant.description?.substring(0, 160),
      images: plant.mainImageUrl ? [plant.mainImageUrl] : [],
    },
  };
}
