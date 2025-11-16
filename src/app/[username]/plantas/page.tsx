// Colección completa de plantas del usuario
// Ruta: /{username}/plantas (sin autenticación requerida)

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PlantCard from '@/components/ui/profile/PlantCard';

interface PlantsPageProps {
  params: {
    username: string;
  };
}

export default async function PlantsPage({ params }: PlantsPageProps) {
  const { username } = params;

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

  // Obtener todas las plantas
  const [favoritePlants, allPlants] = await Promise.all([
    // Plantas favoritas
    prisma.plant.findMany({
      where: {
        userId: user.id,
        isFavorite: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    // Resto de plantas
    prisma.plant.findMany({
      where: {
        userId: user.id,
        isFavorite: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  const totalPlants = favoritePlants.length + allPlants.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-500 py-12 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <a
            href={`/${username}`}
            className="mb-4 inline-block text-sm opacity-90 hover:opacity-100"
          >
            ← Volver al perfil
          </a>
          <h1 className="mb-2 text-4xl font-bold">🌱 Colección de Plantas</h1>
          <p className="text-lg opacity-90">
            {totalPlants} plantas en total
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        {/* Plantas Favoritas */}
        {favoritePlants.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-bold text-green-800">
              💚 Mis Favoritas ({favoritePlants.length})
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favoritePlants.map((plant) => (
                <PlantCard key={plant.id} plant={plant} username={username} />
              ))}
            </div>
          </section>
        )}

        {/* Todas las Plantas */}
        {allPlants.length > 0 && (
          <section>
            <h2 className="mb-6 text-3xl font-bold text-gray-800">
              🌿 Todas las Plantas ({allPlants.length})
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allPlants.map((plant) => (
                <PlantCard key={plant.id} plant={plant} username={username} />
              ))}
            </div>
          </section>
        )}

        {/* Sin plantas */}
        {totalPlants === 0 && (
          <div className="rounded-xl bg-white p-12 text-center shadow-md">
            <p className="text-xl text-gray-600">
              Aún no hay plantas en esta colección
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
