'use client';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import './mapa.css';
import { OfertaMarker, PropertyListingPoint } from '@/components/ui/mapa/OfertaMarker';
import LocationButton from '@/components/ui/mapa/LocationButton';
import { Icon } from 'leaflet';

const redIcon = new Icon({
  iconUrl: '/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: '/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [12, 41]
});

const SearchField = (): null => {
    const map = useMap();

    useEffect(() => {
        const provider = new OpenStreetMapProvider({
            params: {
                'accept-language': 'es',
                countrycodes: 'cl',
            },
            searchUrl: '/api/geocode',
        });

        const searchControl = new (GeoSearchControl as any)({
            provider: provider,
            style: 'bar',
            searchLabel: 'Buscar dirección...',
            autoComplete: true,
            autoCompleteDelay: 250,
            showMarker: true,
            showPopup: false,
            retainZoomLevel: false,
            animateZoom: true,
            keepResult: false,
            maxMarkers: 1,
            marker: {
                icon: redIcon
            }
        });

        map.addControl(searchControl);
        return () => {
            map.removeControl(searchControl);
        };
    }, [map]);

    return null;
};

const MapaOfertas = () => {
    const [listings, setListings] = useState<PropertyListingPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/property-listings?limit=500');

                if (!response.ok) {
                    throw new Error('Error al cargar las ofertas');
                }

                const data = await response.json();

                if (data.success && data.data) {
                    // Filtrar solo los que tienen coordenadas válidas
                    const validListings = data.data.filter(
                        (listing: PropertyListingPoint) =>
                            typeof listing.lat === 'number' &&
                            typeof listing.lng === 'number' &&
                            !isNaN(listing.lat) &&
                            !isNaN(listing.lng)
                    );
                    setListings(validListings);
                } else {
                    throw new Error('Formato de respuesta inválido');
                }
            } catch (err) {
                console.error('Error fetching listings:', err);
                setError(err instanceof Error ? err.message : 'Error desconocido');
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando ofertas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center text-red-600">
                    <p className="text-xl font-semibold">Error al cargar ofertas</p>
                    <p className="mt-2">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full">
            {/* Header con información */}
            <div className="bg-white p-4 rounded-t-lg shadow-sm border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Mapa de Ofertas Inmobiliarias</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Datos recopilados de portales inmobiliarios chilenos con fines estadísticos y académicos
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">{listings.length}</p>
                        <p className="text-sm text-gray-600">ofertas disponibles</p>
                    </div>
                </div>
            </div>

            <MapContainer
                center={[-33.4489, -70.6693]}
                zoom={12}
                style={{
                    height: "calc(85vh - 100px)",
                    width: "100%",
                    borderRadius: "0 0 8px 8px"
                }}
            >
                <SearchField />
                <LocationButton />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    maxZoom={19}
                    minZoom={5}
                    tileSize={256}
                    keepBuffer={2}
                    updateWhenZooming={false}
                    updateWhenIdle={true}
                />
                {listings.map(listing => (
                    <OfertaMarker key={listing.id} listing={listing} />
                ))}
            </MapContainer>
        </div>
    );
};

export default MapaOfertas;