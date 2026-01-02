import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Nueva Planta | Dashboard',
  description: 'Agregar una nueva planta a tu colección',
};

export default async function CrearPlantaPage() {
  return (
    <div className="w-full">
      <div className="mb-4">
        <Link
          href="/dashboard/plantas"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver a Mis Plantas
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Nueva Planta</h1>

      <div className="rounded-md bg-white p-6 shadow-sm">
        <p className="text-gray-600">
          🌿 Formulario para agregar una nueva planta.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Próximamente: formulario completo con campos de:
        </p>
        <ul className="mt-2 text-sm text-gray-500 list-disc list-inside">
          <li>Nombre común y científico</li>
          <li>Descripción y cuidados</li>
          <li>Categoría (suculenta, árbol, etc.)</li>
          <li>Dificultad de cuidado</li>
          <li>Requerimientos de luz y riego</li>
          <li>Imágenes</li>
          <li>Stock y precio (si es negocio)</li>
        </ul>
      </div>
    </div>
  );
}
