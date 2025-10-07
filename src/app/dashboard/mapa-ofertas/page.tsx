'use client';

import dynamic from 'next/dynamic';

const MapaOfertas = dynamic(() => import('@/components/ui/mapa/MapaOfertas'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando mapa de ofertas...</p>
            </div>
        </div>
    )
});

const MapaOfertasPage = () => {
    return (
        <div id="map-ofertas-container" className="p-4">
            <MapaOfertas />
        </div>
    );
};

export default MapaOfertasPage;