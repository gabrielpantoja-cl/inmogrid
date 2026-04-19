import { queryCBRDirectory } from '@/shared/lib/queries/referenciales';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Conservadores',
  description:
    'Directorio de Conservadores de Bienes Raíces de Chile con cantidad de transacciones disponibles en inmogrid.cl.',
};

export default async function ConservadoresPage() {
  const rows = await queryCBRDirectory();

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Conservadores de Bienes Raíces</h1>
        <p className="mt-2 text-gray-600 max-w-2xl">
          Directorio de Conservadores de Bienes Raíces (CBR) de Chile con datos disponibles en
          inmogrid.cl. Los registros provienen de fuentes oficiales y se actualizan periódicamente.
        </p>
      </header>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-700">Conservador (CBR)</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-right">Transacciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.cbr} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-900">{row.cbr}</td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                  {row.count.toLocaleString('es-CL')}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-gray-400">
                  No hay datos disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="mt-6 text-xs text-gray-400">
        Fuente: Conservadores de Bienes Raíces de Chile. Datos de carácter referencial — Ley 19.628.
      </footer>
    </main>
  );
}
