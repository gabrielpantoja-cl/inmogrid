'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ReferencialesExplorer,
  ReportModal,
  type Referencial,
} from '@/features/referenciales';
import ContributeModal from './ContributeModal';

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

export default function DashboardReferencialesContent() {
  const [activeTab, setActiveTab] = useState<Tab>('explorar');

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

  // ─── Modal contribución ─────────────────────────────────────
  const [showModal, setShowModal] = useState(false);

  const handleContributeSuccess = () => {
    setShowModal(false);
    loadContributions();
    setActiveTab('mis-contribuciones');
  };

  // ─── Modal reporte (disparado desde el popup del mapa) ──────
  const [reportTarget, setReportTarget] = useState<Referencial | null>(null);

  const handleReportSuccess = () => {
    setReportTarget(null);
    loadContributions();
    setActiveTab('mis-contribuciones');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mapa</h1>
          <p className="mt-1 text-gray-600">
            Transacciones inmobiliarias verificadas. Filtros avanzados, export y
            contribuciones a la comunidad.
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
        <ReferencialesExplorer mode="authenticated" onReport={setReportTarget} />
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
          onSuccess={handleContributeSuccess}
        />
      )}

      {/* Modal reporte */}
      {reportTarget && (
        <ReportModal
          referencial={reportTarget}
          onClose={() => setReportTarget(null)}
          onSuccess={handleReportSuccess}
        />
      )}
    </div>
  );
}
