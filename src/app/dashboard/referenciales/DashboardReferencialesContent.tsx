'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  fetchReferenciales,
  fetchComunas,
  type Referencial,
} from '@/features/referenciales';
import { ReferencialesStats } from '@/features/referenciales';
import ContributeModal from './ContributeModal';

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

type Tab = 'explorar' | 'mis-contribuciones';

interface Contribution {
  id: string;
  contributionType: string;
  lat: number;
  lng: number;
  comuna: string | null;
  predio: string | null;
  rol: string | null;
  anio: number | null;
  monto: string | null;
  status: string;
  reviewNote: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending:  { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Aprobado',  className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rechazado', className: 'bg-red-100 text-red-800' },
};

interface Comuna {
  comuna: string;
  count: number;
}

export default function DashboardReferencialesContent() {
  const [activeTab, setActiveTab] = useState<Tab>('explorar');

  // ─── Explorar ───────────────────────────────────────────────
  const [referenciales, setReferenciales] = useState<Referencial[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComuna, setSelectedComuna] = useState('');
  const [selectedAnio, setSelectedAnio] = useState('');

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 15 }, (_, i) => current - i);
  }, []);

  useEffect(() => {
    fetchComunas()
      .then((res) => setComunas(res.data ?? []))
      .catch(() => setComunas([]));
  }, []);

  const loadReferenciales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchReferenciales({
        comuna: selectedComuna || undefined,
        anio: selectedAnio ? Number(selectedAnio) : undefined,
        limit: 20000,
      });
      setReferenciales(res.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos.');
      setReferenciales([]);
    } finally {
      setLoading(false);
    }
  }, [selectedComuna, selectedAnio]);

  useEffect(() => {
    loadReferenciales();
  }, [loadReferenciales]);

  // ─── Mis contribuciones ─────────────────────────────────────
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [contribLoading, setContribLoading] = useState(false);
  const [contribError, setContribError] = useState<string | null>(null);

  const loadContributions = useCallback(async () => {
    setContribLoading(true);
    setContribError(null);
    try {
      const res = await fetch('/api/referenciales/my-contributions?limit=50');
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setContributions(data.data ?? []);
    } catch (e) {
      setContribError(e instanceof Error ? e.message : 'Error al cargar contribuciones.');
    } finally {
      setContribLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'mis-contribuciones') loadContributions();
  }, [activeTab, loadContributions]);

  // ─── Modal ──────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);

  const handleSuccess = () => {
    setShowModal(false);
    loadContributions();
    setActiveTab('mis-contribuciones');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Referenciales</h1>
          <p className="mt-1 text-gray-600">
            Explora transacciones inmobiliarias verificadas y contribuye datos a la comunidad.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="shrink-0 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-600"
        >
          + Contribuir
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {([
            { key: 'explorar', label: 'Explorar mapa' },
            { key: 'mis-contribuciones', label: 'Mis contribuciones' },
          ] as { key: Tab; label: string }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab: Explorar ── */}
      {activeTab === 'explorar' && (
        <>
          {/* Filtros */}
          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label htmlFor="dash-ref-comuna" className="block text-xs font-medium text-gray-700 mb-1">
                  Comuna
                </label>
                <select
                  id="dash-ref-comuna"
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
                <label htmlFor="dash-ref-anio" className="block text-xs font-medium text-gray-700 mb-1">
                  Año
                </label>
                <select
                  id="dash-ref-anio"
                  value={selectedAnio}
                  onChange={(e) => setSelectedAnio(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Todos los años</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => { setSelectedComuna(''); setSelectedAnio(''); }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              {loading
                ? 'Cargando datos…'
                : `${referenciales.length.toLocaleString('es-CL')} registros de todo Chile`}
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

          {/* Tabla con observaciones */}
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
                    <th className="px-4 py-2 text-left">Observaciones</th>
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
                      <td className="px-4 py-2 text-gray-500 max-w-[200px] truncate">
                        {r.observaciones ?? '—'}
                      </td>
                    </tr>
                  ))}
                  {!loading && referenciales.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                        No hay registros para los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {referenciales.length > 50 && (
              <p className="mt-2 text-xs text-gray-500">
                Mostrando los primeros 50 de {referenciales.length.toLocaleString('es-CL')} registros.
              </p>
            )}
          </section>
        </>
      )}

      {/* ── Tab: Mis contribuciones ── */}
      {activeTab === 'mis-contribuciones' && (
        <section>
          {contribLoading && (
            <div className="py-12 text-center text-sm text-gray-500">Cargando contribuciones…</div>
          )}
          {contribError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {contribError}
            </div>
          )}
          {!contribLoading && !contribError && contributions.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
              <p className="text-gray-500 text-sm">Todavía no has contribuido ningún referencial.</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
              >
                + Contribuir ahora
              </button>
            </div>
          )}
          {!contribLoading && contributions.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-2 text-left">Estado</th>
                    <th className="px-4 py-2 text-left">Tipo</th>
                    <th className="px-4 py-2 text-left">Comuna</th>
                    <th className="px-4 py-2 text-left">Predio</th>
                    <th className="px-4 py-2 text-left">ROL</th>
                    <th className="px-4 py-2 text-right">Monto</th>
                    <th className="px-4 py-2 text-left">Enviado</th>
                    <th className="px-4 py-2 text-left">Nota revisión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contributions.map((c) => {
                    const status = STATUS_LABELS[c.status] ?? { label: c.status, className: 'bg-gray-100 text-gray-700' };
                    return (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-700 capitalize">{c.contributionType}</td>
                        <td className="px-4 py-2 text-gray-700">{c.comuna ?? '—'}</td>
                        <td className="px-4 py-2 text-gray-700">{c.predio ?? '—'}</td>
                        <td className="px-4 py-2 text-gray-700">{c.rol ?? '—'}</td>
                        <td className="px-4 py-2 text-right text-gray-900 font-medium">
                          {c.monto ? `$${Number(c.monto).toLocaleString('es-CL')}` : '—'}
                        </td>
                        <td className="px-4 py-2 text-gray-500 text-xs">
                          {new Date(c.createdAt).toLocaleDateString('es-CL')}
                        </td>
                        <td className="px-4 py-2 text-gray-500 text-xs max-w-[160px] truncate">
                          {c.reviewNote ?? '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Modal contribución */}
      {showModal && (
        <ContributeModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
