'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Referencial } from '../lib/api';

interface Props {
  referenciales: Referencial[];
  center?: [number, number];
  zoom?: number;
}

/** Ajusta el viewport del mapa a los datos cargados */
function FitBounds({ points }: { points: Referencial[] }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
  }, [points, map]);
  return null;
}

export default function ReferencialesMap({
  referenciales,
  center = [-33.4489, -70.6693],
  zoom = 10,
}: Props) {
  const valid = useMemo(
    () => referenciales.filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng)),
    [referenciales]
  );

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &middot; datos: CBR Chile'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={valid} />
      {valid.map((r) => (
        <CircleMarker
          key={r.id}
          center={[r.lat, r.lng]}
          radius={6}
          pathOptions={{ color: '#eab308', fillColor: '#facc15', fillOpacity: 0.75, weight: 1.5 }}
        >
          <Popup>
            <div className="text-sm space-y-1 min-w-[200px]">
              <div className="font-semibold text-gray-900">
                {r.comuna ?? 'Sin comuna'} {r.anio ? `· ${r.anio}` : ''}
              </div>
              {r.predio && <div className="text-gray-700">{r.predio}</div>}
              {r.monto && <div className="text-yellow-700 font-medium">{r.monto}</div>}
              {typeof r.superficie === 'number' && (
                <div className="text-gray-600">{r.superficie} m²</div>
              )}
              {r.rol && <div className="text-xs text-gray-500">ROL: {r.rol}</div>}
              {(r.fojas || r.numero || r.anio) && (
                <div className="text-xs text-gray-500">
                  Fojas {r.fojas ?? '—'} · Nº {r.numero ?? '—'} · Año {r.anio ?? '—'}
                </div>
              )}
              {r.cbr && <div className="text-xs text-gray-500">CBR: {r.cbr}</div>}
              {r.fechaescritura && (
                <div className="text-xs text-gray-500">Escritura: {r.fechaescritura}</div>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
