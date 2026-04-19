'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Supercluster from 'supercluster';
import type { Referencial } from '../lib/api';

interface Props {
  referenciales: Referencial[];
  center?: [number, number];
  zoom?: number;
  onReport?: (r: Referencial) => void;
  /**
   * Callback con el bbox actual del viewport `[minLng, minLat, maxLng, maxLat]`.
   * Se invoca en `moveend`/`zoomend` y en el mount inicial. Solo el consumidor
   * autenticado lo usa (para el filtro "solo área visible").
   */
  onBoundsChange?: (bbox: [number, number, number, number]) => void;
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

type PointProps = { referencial: Referencial };

function ClusteredMarkers({
  points,
  onReport,
  onBoundsChange,
}: {
  points: Referencial[];
  onReport?: (r: Referencial) => void;
  onBoundsChange?: (bbox: [number, number, number, number]) => void;
}) {
  const map = useMap();

  const [viewport, setViewport] = useState(() => {
    const b = map.getBounds();
    return {
      bounds: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()] as [number, number, number, number],
      zoom: Math.round(map.getZoom()),
    };
  });

  // Publicar el bbox inicial y en cada cambio. El consumidor decide si lo
  // consume (solo el modo autenticado lo usa para el filtro "solo área
  // visible"). Disparamos una vez en mount para no requerir que el usuario
  // mueva el mapa antes de aplicar el filtro.
  useEffect(() => {
    onBoundsChange?.(viewport.bounds);
  }, [viewport.bounds, onBoundsChange]);

  useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      setViewport({
        bounds: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
        zoom: Math.round(map.getZoom()),
      });
    },
    zoomend: () => {
      const b = map.getBounds();
      setViewport({
        bounds: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
        zoom: Math.round(map.getZoom()),
      });
    },
  });

  const supercluster = useMemo(() => {
    const sc = new Supercluster<PointProps>({ radius: 60, maxZoom: 16 });
    sc.load(
      points.map((r) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [r.lng, r.lat] as [number, number] },
        properties: { referencial: r },
      }))
    );
    return sc;
  }, [points]);

  const clusters = useMemo(
    () => supercluster.getClusters(viewport.bounds, viewport.zoom),
    [supercluster, viewport]
  );

  return (
    <>
      {clusters.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const props = feature.properties as Record<string, unknown>;
        const isCluster = Boolean(props.cluster);

        if (isCluster) {
          const count = props.point_count as number;
          const clusterId = props.cluster_id as number;
          const size = Math.min(12 + Math.sqrt(count) * 2.5, 36);

          return (
            <CircleMarker
              key={`cluster-${clusterId}`}
              center={[lat, lng]}
              radius={size}
              pathOptions={{ color: '#d97706', fillColor: '#f59e0b', fillOpacity: 0.85, weight: 2 }}
              eventHandlers={{
                click: () => {
                  const expansionZoom = Math.min(
                    supercluster.getClusterExpansionZoom(clusterId),
                    18
                  );
                  map.flyTo([lat, lng], expansionZoom, { animate: true, duration: 0.5 });
                },
              }}
            >
              <Popup>
                <div className="text-sm font-medium text-gray-800">
                  {count.toLocaleString('es-CL')} registros
                  <br />
                  <span className="text-xs text-gray-500">Haz clic para acercar</span>
                </div>
              </Popup>
            </CircleMarker>
          );
        }

        const r = (props as PointProps).referencial;
        return (
          <CircleMarker
            key={r.id}
            center={[lat, lng]}
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
                {onReport && (
                  <button
                    onClick={() => onReport(r)}
                    className="mt-2 w-full rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                  >
                    ⚠ Reportar dato dudoso
                  </button>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

export default function ReferencialesMap({
  referenciales,
  center = [-33.4489, -70.6693],
  zoom = 10,
  onReport,
  onBoundsChange,
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
      <ClusteredMarkers
        points={valid}
        onReport={onReport}
        onBoundsChange={onBoundsChange}
      />
    </MapContainer>
  );
}
