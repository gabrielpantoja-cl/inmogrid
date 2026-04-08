'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { parseMontoCLP, formatCLP, type Referencial } from '../lib/api';

interface Props {
  referenciales: Referencial[];
}

export default function ReferencialesStats({ referenciales }: Props) {
  const stats = useMemo(() => {
    const montos = referenciales
      .map((r) => parseMontoCLP(r.monto))
      .filter((n): n is number => n !== null && n > 0);
    const superficies = referenciales
      .map((r) => r.superficie)
      .filter((n): n is number => typeof n === 'number' && n > 0);

    const total = referenciales.length;
    const avgMonto = montos.length
      ? montos.reduce((a, b) => a + b, 0) / montos.length
      : 0;
    const medianMonto = montos.length
      ? [...montos].sort((a, b) => a - b)[Math.floor(montos.length / 2)]
      : 0;
    const avgSuperficie = superficies.length
      ? superficies.reduce((a, b) => a + b, 0) / superficies.length
      : 0;

    // Distribución por año
    const byYear = new Map<number, number>();
    for (const r of referenciales) {
      if (typeof r.anio === 'number') byYear.set(r.anio, (byYear.get(r.anio) ?? 0) + 1);
    }
    const yearData = Array.from(byYear.entries())
      .sort(([a], [b]) => a - b)
      .map(([year, count]) => ({ year: String(year), count }));

    // Top comunas
    const byComuna = new Map<string, number>();
    for (const r of referenciales) {
      if (r.comuna) byComuna.set(r.comuna, (byComuna.get(r.comuna) ?? 0) + 1);
    }
    const topComunas = Array.from(byComuna.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([comuna, count]) => ({ comuna, count }));

    return { total, avgMonto, medianMonto, avgSuperficie, yearData, topComunas };
  }, [referenciales]);

  const Metric = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Total registros" value={stats.total.toLocaleString('es-CL')} />
        <Metric
          label="Superficie prom."
          value={stats.avgSuperficie ? `${stats.avgSuperficie.toFixed(0)} m²` : '—'}
        />
        <Metric label="Monto promedio" value={stats.avgMonto ? formatCLP(stats.avgMonto) : '—'} />
        <Metric label="Monto mediano" value={stats.medianMonto ? formatCLP(stats.medianMonto) : '—'} />
      </div>

      {stats.yearData.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-900 mb-2">Registros por año</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.yearData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {stats.topComunas.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-900 mb-2">Top comunas</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topComunas} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" fontSize={11} />
                <YAxis type="category" dataKey="comuna" width={100} fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#eab308" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
