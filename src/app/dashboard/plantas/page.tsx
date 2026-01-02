import { Metadata } from 'next';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Mis Plantas | Dashboard',
  description: 'Gestiona tu colección de plantas',
};

export default async function PlantasPage() {
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Mis Plantas</h1>
        <Link
          href="/dashboard/plantas/crear"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          <PlusIcon className="h-5 w-5" />
          Nueva Planta
        </Link>
      </div>

      <div className="mt-8 rounded-md bg-white p-6 shadow-sm">
        <p className="text-gray-600">
          🌱 Aquí podrás gestionar tu colección de plantas del vivero.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Próximamente: lista de plantas, edición, gestión de inventario.
        </p>
      </div>
    </div>
  );
}
