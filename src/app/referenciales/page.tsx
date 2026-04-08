'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  fetchReferenciales,
  fetchComunas,
  type Referencial,
} from '@/lib/referenciales-api';
import ReferencialesStats from '@/components/referenciales/ReferencialesStats';

// Leaflet es browser-only → import dinámico sin SSR
const ReferencialesMap = dynamic(
  () => import('@/components/referenciales/ReferencialesMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-500">
        Cargando mapa…
      </div>
    ),
  }
);

interface Comuna {
  comuna: string;
  count: number;
}

export default function ReferencialesPage() {
  const [referenciales, setReferenciales] = useState<Referencial[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedComuna, setSelectedComuna] = useState<string>('');
  const [selectedAnio, setSelectedAnio] = useState<string>('');
  const [limit, setLimit] = useState<number>(2000);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 15 }, (_, i) => currentYear - i);
  }, []);

  // Carga inicial de comunas (una vez)
  useEffect(() => {
    fetchComunas()
      .then((res) => setComunas(res.data ?? []))
      .catch(() => setComunas([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchReferenciales({
        comuna: selectedComuna || undefined,
        anio: selectedAnio ? Number(selectedAnio) : undefined,
        limit,
      });
      setReferenciales(res.data ?? []);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'No fue posible cargar datos desde referenciales.cl'
      );
      setReferenciales([]);
    } finally {
      setLoading(false);
    }
  }, [selectedComuna, selectedAnio, limit]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 md:px-8">
        <div className="max-w-7xl mx-auto h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight text-gray-900">
            DEG<span className="text-yellow-500">UX</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Inicio
            </Link>
            <span className="font-medium text-gray-900">Referenciales</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mapa de Referenciales</h1>
          <p className="mt-2 max-w-3xl text-gray-600">
            Datos abiertos de transacciones inmobiliarias en Chile, provistos por la comunidad
            colaborativa de{' '}
            <a
              href="https://referenciales.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-600 hover:text-yellow-700 font-medium"
            >
              referenciales.cl
            </a>
            . En degux.cl los exponemos de forma <strong>abierta y sin autenticación</strong>,
            como parte de un ecosistema generoso para todo Chile.
          </p>
        </header>

        {/* Filtros */}
        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Comuna</label>
              <select
                value={selectedComuna}
                onChange={(e) => setSelectedComuna(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Todas las comunas</option>
                {comunas.map((c) => (
                  <option key={c.comuna} value={c.comuna}>
                    {c.comuna} ({c.count})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Año</label>
              <select
                value={selectedAnio}
                onChange={(e) => setSelectedAnio(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Todos los años</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Máx. resultados
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value={500}>500</option>
                <option value={2000}>2.000</option>
                <option value={5000}>5.000</option>
                <option value={10000}>10.000</option>
                <option value={20000}>20.000 (máximo)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedComuna('');
                  setSelectedAnio('');
                  setLimit(2000);
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            {loading
              ? 'Cargando datos desde referenciales.cl…'
              : `${referenciales.length.toLocaleString('es-CL')} registros cargados`}
          </div>

          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        {/* Mapa + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="relative h-[600px] overflow-hidden rounded-xl border border-gray-200 bg-white">
              <ReferencialesMap referenciales={referenciales} />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                  <div className="text-sm font-medium text-gray-700">Cargando…</div>
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-1">
            <ReferencialesStats referenciales={referenciales} />
          </aside>
        </div>

        {/* Tabla */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Últimos registros</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-2 text-left">Comuna</th>
                  <th className="px-4 py-2 text-left">Predio</th>
                  <th className="px-4 py-2 text-left">ROL</th>
                  <th className="px-4 py-2 text-right">Superficie</th>
                  <th className="px-4 py-2 text-right">Monto</th>
                  <th className="px-4 py-2 text-left">Escritura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {referenciales.slice(0, 50).map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900">{r.comuna ?? '—'}</td>
                    <td className="px-4 py-2 text-gray-700">{r.predio ?? '—'}</td>
                    <td className="px-4 py-2 text-gray-700">{r.rol ?? '—'}</td>
                    <td className="px-4 py-2 text-right text-gray-700">
                      {typeof r.superficie === 'number' ? `${r.superficie} m²` : '—'}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900 font-medium">
                      {r.monto ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-gray-600">{r.fechaescritura ?? '—'}</td>
                  </tr>
                ))}
                {!loading && referenciales.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      No hay registros para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {referenciales.length > 50 && (
            <p className="mt-2 text-xs text-gray-500">
              Mostrando los primeros 50 de {referenciales.length.toLocaleString('es-CL')}{' '}
              registros. Ajusta los filtros para refinar.
            </p>
          )}
        </section>

        <footer className="mt-10 border-t border-gray-200 pt-6 text-xs text-gray-500">
          Datos © comunidad{' '}
          <a
            href="https://referenciales.cl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-600 hover:text-yellow-700"
          >
            referenciales.cl
          </a>
          . Fuente primaria: Conservadores de Bienes Raíces (CBR). Publicado en degux.cl bajo un
          espíritu de datos abiertos — Ley 19.628 y atribución CBR respetadas.
        </footer>
      </main>
    </div>
  );
}
