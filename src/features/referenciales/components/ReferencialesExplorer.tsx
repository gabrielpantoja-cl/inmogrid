'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  fetchReferenciales,
  fetchComunas,
  fetchReferencialesAuth,
  fetchComunasAuth,
  type MapDataExtendedFilters,
  type Referencial,
} from '../lib/api';
import { downloadCSV } from '../lib/csv';
import ReferencialesStats from './ReferencialesStats';

const ReferencialesMap = dynamic(() => import('./ReferencialesMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-500">
      Cargando mapa…
    </div>
  ),
});

type Comuna = { comuna: string; count: number };

export type ExplorerMode = 'public' | 'authenticated';

interface Props {
  /**
   * `public` — usa `/api/v1/map-data` (rate-limited, CAP 50k, sin filtros avanzados).
   * `authenticated` — usa `/api/referenciales/map-data` (sin rate-limit, CAP 200k,
   * filtros avanzados, export CSV, badge visible).
   */
  mode: ExplorerMode;
  /** Callback para reportar datos dudosos. Solo se usa en modo auth. */
  onReport?: (r: Referencial) => void;
  /** Contenido opcional antes de los filtros (ej: H1 + intro). */
  header?: ReactNode;
  /** Contenido opcional después de la tabla (ej: disclaimer legal). */
  footer?: ReactNode;
}

/**
 * Experiencia unificada del mapa de referenciales.
 *
 * Comparte filtros básicos (comuna, año), mapa con clustering, stats y
 * tabla entre las vistas pública y autenticada. En modo `authenticated`
 * añade:
 *   - Panel colapsable de filtros avanzados (fechas, rangos de monto y
 *     superficie, búsqueda libre, toggle "solo área visible" — bbox).
 *   - Botón "Exportar CSV" que serializa el resultado actual.
 *   - Badge "Autenticado · sin límites" y tip sobre los beneficios.
 *
 * El componente es intencionalmente tonto respecto a la ruta en la que
 * vive — la diferencia de backend (pública vs autenticada) se resuelve
 * enteramente acá vía `mode`.
 */
export default function ReferencialesExplorer({
  mode,
  onReport,
  header,
  footer,
}: Props) {
  const isAuth = mode === 'authenticated';

  const [referenciales, setReferenciales] = useState<Referencial[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbTotal, setDbTotal] = useState<number | null>(null);

  // Filtros base (ambos modos)
  const [selectedComuna, setSelectedComuna] = useState('');
  const [selectedAnio, setSelectedAnio] = useState('');

  // Filtros avanzados (solo modo auth)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [montoMin, setMontoMin] = useState('');
  const [montoMax, setMontoMax] = useState('');
  const [superficieMin, setSuperficieMin] = useState('');
  const [superficieMax, setSuperficieMax] = useState('');
  const [q, setQ] = useState('');
  const [onlyVisibleArea, setOnlyVisibleArea] = useState(false);
  const [mapBbox, setMapBbox] = useState<[number, number, number, number] | null>(null);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 15 }, (_, i) => current - i);
  }, []);

  // Carga inicial de comunas (una vez por mount). En modo auth usa la
  // variante privada — mismo dataset, respuesta sin rate-limit.
  useEffect(() => {
    const fetcher = isAuth ? fetchComunasAuth : fetchComunas;
    fetcher()
      .then((res) => setComunas(res.data ?? []))
      .catch(() => setComunas([]));
  }, [isAuth]);

  const buildAuthFilters = useCallback((): MapDataExtendedFilters => {
    const f: MapDataExtendedFilters = {
      comuna: selectedComuna || undefined,
      anio: selectedAnio ? Number(selectedAnio) : undefined,
      limit: 50000,
    };
    if (fechaDesde) f.fechaDesde = new Date(fechaDesde);
    if (fechaHasta) f.fechaHasta = new Date(fechaHasta);
    if (montoMin) f.montoMin = Number(montoMin);
    if (montoMax) f.montoMax = Number(montoMax);
    if (superficieMin) f.superficieMin = Number(superficieMin);
    if (superficieMax) f.superficieMax = Number(superficieMax);
    if (q.trim()) f.q = q.trim();
    if (onlyVisibleArea && mapBbox) f.bbox = mapBbox;
    return f;
  }, [
    selectedComuna,
    selectedAnio,
    fechaDesde,
    fechaHasta,
    montoMin,
    montoMax,
    superficieMin,
    superficieMax,
    q,
    onlyVisibleArea,
    mapBbox,
  ]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = isAuth
        ? await fetchReferencialesAuth(buildAuthFilters())
        : await fetchReferenciales({
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
          : 'No fue posible cargar los datos. Intenta nuevamente.'
      );
      setReferenciales([]);
    } finally {
      setLoading(false);
    }
  }, [isAuth, selectedComuna, selectedAnio, buildAuthFilters]);

  useEffect(() => {
    load();
  }, [load]);

  const clearAll = () => {
    setSelectedComuna('');
    setSelectedAnio('');
    setFechaDesde('');
    setFechaHasta('');
    setMontoMin('');
    setMontoMax('');
    setSuperficieMin('');
    setSuperficieMax('');
    setQ('');
    setOnlyVisibleArea(false);
  };

  const handleExport = () => {
    if (!referenciales.length) return;
    downloadCSV(referenciales, 'referenciales');
  };

  return (
    <div className="space-y-6">
      {header}

      {/* Badge + CTAs solo en modo auth */}
      {isAuth && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 ring-1 ring-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Autenticado · sin límites de consulta
          </span>
          <span className="text-gray-500">
            Hasta 200 000 registros por query · filtros avanzados · export CSV
          </span>
        </div>
      )}

      {/* Filtros base */}
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label
              htmlFor={`explorer-comuna-${mode}`}
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Comuna
            </label>
            <select
              id={`explorer-comuna-${mode}`}
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
            <label
              htmlFor={`explorer-anio-${mode}`}
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Año
            </label>
            <select
              id={`explorer-anio-${mode}`}
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

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Limpiar filtros
            </button>
            {isAuth && (
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                aria-expanded={showAdvanced}
                className="shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {showAdvanced ? 'Ocultar avanzados' : 'Filtros avanzados'}
              </button>
            )}
          </div>
        </div>

        {/* Panel filtros avanzados — solo auth */}
        {isAuth && showAdvanced && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-medium text-gray-700 mb-1">
                  Fecha desde
                </span>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-gray-700 mb-1">
                  Fecha hasta
                </span>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-gray-700 mb-1">
                  Monto mínimo (CLP)
                </span>
                <input
                  type="number"
                  min={0}
                  value={montoMin}
                  onChange={(e) => setMontoMin(e.target.value)}
                  placeholder="Ej: 100000000"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-gray-700 mb-1">
                  Monto máximo (CLP)
                </span>
                <input
                  type="number"
                  min={0}
                  value={montoMax}
                  onChange={(e) => setMontoMax(e.target.value)}
                  placeholder="Ej: 500000000"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-gray-700 mb-1">
                  Superficie mínima (m²)
                </span>
                <input
                  type="number"
                  min={0}
                  value={superficieMin}
                  onChange={(e) => setSuperficieMin(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-gray-700 mb-1">
                  Superficie máxima (m²)
                </span>
                <input
                  type="number"
                  min={0}
                  value={superficieMax}
                  onChange={(e) => setSuperficieMax(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </label>
            </div>

            <label className="block">
              <span className="block text-xs font-medium text-gray-700 mb-1">
                Búsqueda libre (predio o ROL)
              </span>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ej: Fundo La Esperanza"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={onlyVisibleArea}
                onChange={(e) => setOnlyVisibleArea(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
              />
              Solo registros en el área visible del mapa
              {onlyVisibleArea && !mapBbox && (
                <span className="text-xs text-gray-500">
                  (mové el mapa para capturar el área)
                </span>
              )}
            </label>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600 disabled:opacity-50"
              >
                {loading ? 'Aplicando…' : 'Aplicar filtros'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            {loading ? (
              <span>Cargando datos…</span>
            ) : (
              <span>
                Mostrando{' '}
                <strong>{referenciales.length.toLocaleString('es-CL')}</strong> registros
                {dbTotal != null && dbTotal > referenciales.length && (
                  <>
                    {' '}
                    de un total de{' '}
                    <strong>{dbTotal.toLocaleString('es-CL')}</strong> en la base de datos
                  </>
                )}
              </span>
            )}
          </div>
          {isAuth && (
            <button
              type="button"
              onClick={handleExport}
              disabled={loading || referenciales.length === 0}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
                />
              </svg>
              Exportar CSV
            </button>
          )}
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Invitación a autenticarse — solo en modo público */}
        {!isAuth && (
          <div className="mt-3 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800 flex flex-wrap items-center justify-between gap-3">
            <span>
              Inicia sesión para acceder a filtros avanzados (fechas, rangos de
              monto y superficie, búsqueda libre) y exportar a CSV.
            </span>
            <Link
              href="/auth/login"
              className="shrink-0 font-medium underline underline-offset-2 hover:text-yellow-900"
            >
              Acceder →
            </Link>
          </div>
        )}
      </section>

      {/* Mapa + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="relative h-[600px] overflow-hidden rounded-xl border border-gray-200 bg-white">
            <ReferencialesMap
              referenciales={referenciales}
              onReport={onReport}
              onBoundsChange={isAuth ? setMapBbox : undefined}
            />
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
      <section>
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
                {isAuth && <th className="px-4 py-2 text-left">Observaciones</th>}
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
                  {isAuth && (
                    <td className="px-4 py-2 text-gray-500 max-w-[200px] truncate">
                      {r.observaciones ?? '—'}
                    </td>
                  )}
                </tr>
              ))}
              {!loading && referenciales.length === 0 && (
                <tr>
                  <td
                    colSpan={isAuth ? 7 : 6}
                    className="px-4 py-6 text-center text-gray-500"
                  >
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
            registros. Ajustá los filtros para refinar.
          </p>
        )}
      </section>

      {footer}
    </div>
  );
}
