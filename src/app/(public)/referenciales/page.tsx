'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  fetchReferenciales,
  fetchComunas,
  type Referencial,
} from '@/features/referenciales';
import { ReferencialesStats } from '@/features/referenciales';

// Leaflet es browser-only → import dinámico sin SSR
const ReferencialesMap = dynamic(
  () => import('@/features/referenciales/components/ReferencialesMap'),
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
  const [dbTotal, setDbTotal] = useState<number | null>(null);

  const [selectedComuna, setSelectedComuna] = useState<string>('');
  const [selectedAnio, setSelectedAnio] = useState<string>('');

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
        limit: 20000,
      });
      setReferenciales(res.data ?? []);
      if (res.metadata.dbTotal != null) setDbTotal(res.metadata.dbTotal);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'No fue posible cargar los datos. Intenta nuevamente en unos segundos.'
      );
      setReferenciales([]);
    } finally {
      setLoading(false);
    }
  }, [selectedComuna, selectedAnio]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mapa de Referenciales</h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          La información proviene de fuentes oficiales y públicas como los Conservadores
          de Bienes Raíces (CBR). Los datos se procesan y actualizan periódicamente para
          entregar información confiable y vigente. Esta información es de carácter
          referencial y no constituye tasación ni asesoría profesional.
        </p>
      </header>

      {/* Filtros */}
      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label htmlFor="ref-comuna" className="block text-xs font-medium text-gray-700 mb-1">
              Comuna
            </label>
            <select
              id="ref-comuna"
              value={selectedComuna}
              onChange={(e) => setSelectedComuna(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
            <label htmlFor="ref-anio" className="block text-xs font-medium text-gray-700 mb-1">
              Año
            </label>
            <select
              id="ref-anio"
              value={selectedAnio}
              onChange={(e) => setSelectedAnio(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Todos los años</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedComuna('');
                setSelectedAnio('');
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500 space-y-0.5">
          {loading ? (
            <span>Cargando datos…</span>
          ) : (
            <>
              <span>
                Mostrando{' '}
                <strong>{referenciales.length.toLocaleString('es-CL')}</strong> registros
                {dbTotal != null && dbTotal > referenciales.length && (
                  <> de un total de{' '}
                    <strong>{dbTotal.toLocaleString('es-CL')}</strong> en la base de datos
                  </>
                )}
              </span>
            </>
          )}
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* CTA para profesionales */}
        <div className="mt-3 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800 flex items-center justify-between gap-3">
          <span>¿Eres profesional inmobiliario? Contribuye datos verificados y ayuda a la comunidad.</span>
          <Link
            href="/auth/login"
            className="shrink-0 font-medium underline underline-offset-2 hover:text-yellow-900"
          >
            Acceder →
          </Link>
        </div>
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
        Fuentes: Conservadores de Bienes Raíces (CBR) de Chile.
        Datos procesados y actualizados periódicamente. La información es referencial
        y no garantiza exactitud — consulte a un profesional para decisiones de inversión.
        Cumplimiento Ley 19.628 sobre protección de datos personales.
      </footer>
    </main>
  );
}
