'use client';

import Image from 'next/image';
import Link from 'next/link';

interface PlantCardProps {
  plant: {
    slug: string;
    name: string;
    scientificName?: string | null;
    description?: string | null;
    mainImageUrl?: string | null;
    category?: string | null;
    difficulty?: string | null;
    isFavorite: boolean;
  };
  username?: string | null;
}

export default function PlantCard({ plant, username }: PlantCardProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=400&h=300&fit=crop';

  return (
    <Link
      href={`/${username}/plantas/${plant.slug}`}
      className="group relative overflow-hidden rounded-xl bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Badge de favorita */}
      {plant.isFavorite && (
        <div className="absolute right-3 top-3 z-10 rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white shadow-lg">
          ❤️ Favorita
        </div>
      )}

      {/* Imagen */}
      <div className="relative h-56 w-full overflow-hidden bg-gray-100">
        <Image
          src={plant.mainImageUrl || defaultImage}
          alt={plant.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      {/* Contenido */}
      <div className="p-5">
        <h3 className="mb-1 text-xl font-bold text-green-800">
          {plant.name}
        </h3>
        {plant.scientificName && (
          <p className="mb-3 text-sm italic text-gray-500">
            {plant.scientificName}
          </p>
        )}
        {plant.description && (
          <p className="mb-4 line-clamp-2 text-gray-700">
            {plant.description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-3">
          {plant.category && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              {plant.category}
            </span>
          )}
          {plant.difficulty && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {plant.difficulty}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
