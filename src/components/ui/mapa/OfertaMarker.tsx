// components/ui/mapa/OfertaMarker.tsx
import { CircleMarker, Popup } from 'react-leaflet';
import { ExternalLink } from 'lucide-react';

// Función para formatear números
const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'No disponible';
    return num.toLocaleString('es-CL');
};

// Función para formatear moneda
const formatCurrency = (amount: string | null | undefined) => {
    if (!amount) return 'Consultar';
    const numAmount = BigInt(amount);
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(Number(numAmount));
};

export type PropertyListingPoint = {
    id: string;
    title: string;
    description?: string | null;
    price?: string | null;
    currency: string;
    address?: string | null;
    commune: string;
    region: string;
    lat?: number | null;
    lng?: number | null;
    totalSurface?: number | null;
    builtSurface?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    parkingSpots?: number | null;
    propertyType?: string | null;
    source: string;
    sourceUrl?: string | null;
    mainImage?: string | null;
    publishedAt?: string | null;
    scrapedAt: string;
};

const getSourceBadgeColor = (source: string) => {
    switch (source) {
        case 'PORTAL_INMOBILIARIO':
            return 'bg-blue-500';
        case 'TOCTOC':
            return 'bg-green-500';
        case 'MERCADO_LIBRE':
            return 'bg-yellow-500';
        case 'YAPO':
            return 'bg-purple-500';
        default:
            return 'bg-gray-500';
    }
};

const getSourceName = (source: string) => {
    switch (source) {
        case 'PORTAL_INMOBILIARIO':
            return 'Portal Inmobiliario';
        case 'TOCTOC':
            return 'Toctoc';
        case 'MERCADO_LIBRE':
            return 'Mercado Libre';
        case 'YAPO':
            return 'Yapo';
        default:
            return source;
    }
};

export const OfertaMarker = ({ listing }: { listing: PropertyListingPoint }) => {
    const position: [number, number] = [
        listing.lat || -33.4489,
        listing.lng || -70.6693
    ];

    return (
        <CircleMarker
            key={listing.id}
            center={position}
            radius={8}
            pathOptions={{
                fillColor: '#3B82F6',
                color: '#1E40AF',
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.6
            }}
        >
            <Popup maxWidth={350} className="oferta-popup">
                <div className="popup-content space-y-3 p-2">
                    {/* Badge de fuente */}
                    <div className="flex items-center justify-between">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold text-white rounded ${getSourceBadgeColor(listing.source)}`}>
                            {getSourceName(listing.source)}
                        </span>
                        {listing.sourceUrl && (
                            <a
                                href={listing.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                            >
                                <ExternalLink size={14} />
                                Ver original
                            </a>
                        )}
                    </div>

                    {/* Título */}
                    <h3 className="font-bold text-lg text-gray-800 leading-tight">
                        {listing.title}
                    </h3>

                    {/* Imagen principal */}
                    {listing.mainImage && (
                        <div className="w-full h-40 overflow-hidden rounded-md">
                            <img
                                src={listing.mainImage}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    {/* Precio */}
                    <div className="bg-green-50 p-2 rounded">
                        <p className="text-2xl font-bold text-green-700">
                            {formatCurrency(listing.price)}
                        </p>
                    </div>

                    {/* Características principales */}
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        {listing.bedrooms !== null && listing.bedrooms !== undefined && (
                            <div className="text-center">
                                <p className="font-semibold text-gray-700">{listing.bedrooms}</p>
                                <p className="text-xs text-gray-500">Dorm.</p>
                            </div>
                        )}
                        {listing.bathrooms !== null && listing.bathrooms !== undefined && (
                            <div className="text-center">
                                <p className="font-semibold text-gray-700">{listing.bathrooms}</p>
                                <p className="text-xs text-gray-500">Baños</p>
                            </div>
                        )}
                        {listing.parkingSpots !== null && listing.parkingSpots !== undefined && (
                            <div className="text-center">
                                <p className="font-semibold text-gray-700">{listing.parkingSpots}</p>
                                <p className="text-xs text-gray-500">Estac.</p>
                            </div>
                        )}
                    </div>

                    {/* Superficies */}
                    <div className="space-y-1 text-sm">
                        {listing.totalSurface && (
                            <p>
                                <strong>Sup. Total:</strong> {formatNumber(listing.totalSurface)} m²
                            </p>
                        )}
                        {listing.builtSurface && (
                            <p>
                                <strong>Sup. Edificada:</strong> {formatNumber(listing.builtSurface)} m²
                            </p>
                        )}
                        {listing.propertyType && (
                            <p>
                                <strong>Tipo:</strong> {listing.propertyType}
                            </p>
                        )}
                    </div>

                    {/* Ubicación */}
                    <div className="border-t pt-2 text-sm">
                        {listing.address && (
                            <p className="text-gray-700">{listing.address}</p>
                        )}
                        <p className="text-gray-600">
                            {listing.commune}, {listing.region}
                        </p>
                    </div>

                    {/* Descripción */}
                    {listing.description && (
                        <div className="border-t pt-2">
                            <p className="text-xs text-gray-600 line-clamp-3">
                                {listing.description}
                            </p>
                        </div>
                    )}

                    {/* Fecha de publicación */}
                    {listing.publishedAt && (
                        <p className="text-xs text-gray-500 border-t pt-2">
                            Publicado: {new Date(listing.publishedAt).toLocaleDateString('es-CL')}
                        </p>
                    )}
                </div>
            </Popup>
        </CircleMarker>
    );
};
