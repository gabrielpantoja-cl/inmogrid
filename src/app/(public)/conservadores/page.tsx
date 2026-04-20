import { queryConservadoresDirectory } from '@/shared/lib/queries/referenciales';
import { ConservadoresGrid } from '@/features/conservadores/components/ConservadoresGrid';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Conservadores',
  description:
    'Directorio de Conservadores de Bienes Raíces de Chile con información de contacto, jurisdicción y transacciones disponibles en inmogrid.cl.',
};

export default async function ConservadoresPage() {
  const conservadores = await queryConservadoresDirectory();

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Conservadores de Bienes Raíces
        </h1>
        <p className="mt-2 text-gray-600 max-w-2xl">
          Directorio oficial de CBR de Chile. El número junto a cada nombre
          indica las transacciones disponibles en inmogrid.cl.
        </p>
      </header>

      <ConservadoresGrid conservadores={conservadores} />
    </main>
  );
}
