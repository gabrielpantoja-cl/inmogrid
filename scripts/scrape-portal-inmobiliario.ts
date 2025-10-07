/**
 * Script de scraping para Portal Inmobiliario
 * Uso: npx tsx scripts/scrape-portal-inmobiliario.ts
 *
 * IMPORTANTE: Este script está diseñado para fines académicos y estadísticos.
 * Respeta las políticas de robots.txt y términos de servicio de cada portal.
 */

import { prisma } from '../src/lib/prisma';
import { randomUUID } from 'crypto';

// Comunas de Santiago para generar datos de ejemplo
const SANTIAGO_COMUNAS = [
    { nombre: 'Santiago', lat: -33.4489, lng: -70.6693 },
    { nombre: 'Providencia', lat: -33.4286, lng: -70.6101 },
    { nombre: 'Las Condes', lat: -33.4150, lng: -70.5832 },
    { nombre: 'Vitacura', lat: -33.3833, lng: -70.5833 },
    { nombre: 'La Reina', lat: -33.4475, lng: -70.5403 },
    { nombre: 'Ñuñoa', lat: -33.4569, lng: -70.5975 },
    { nombre: 'Macul', lat: -33.4889, lng: -70.5964 },
    { nombre: 'Peñalolén', lat: -33.4833, lng: -70.5167 },
    { nombre: 'La Florida', lat: -33.5167, lng: -70.6000 },
    { nombre: 'Maipú', lat: -33.5111, lng: -70.7581 },
    { nombre: 'Pudahuel', lat: -33.4400, lng: -70.7400 },
    { nombre: 'Estación Central', lat: -33.4581, lng: -70.6836 },
    { nombre: 'Recoleta', lat: -33.4167, lng: -70.6333 },
    { nombre: 'Independencia', lat: -33.4167, lng: -70.6667 },
    { nombre: 'Conchalí', lat: -33.3833, lng: -70.6667 },
    { nombre: 'Huechuraba', lat: -33.3667, lng: -70.6333 },
    { nombre: 'Quilicura', lat: -33.3600, lng: -70.7300 },
    { nombre: 'Renca', lat: -33.4000, lng: -70.7167 },
    { nombre: 'Cerro Navia', lat: -33.4167, lng: -70.7333 },
    { nombre: 'Lo Prado', lat: -33.4433, lng: -70.7264 },
];

const PROPERTY_TYPES = [
    'Casa',
    'Departamento',
    'Oficina',
    'Local Comercial',
    'Terreno',
    'Parcela'
];

const STREET_TYPES = ['Avenida', 'Calle', 'Pasaje'];
const STREET_NAMES = [
    'Los Leones', 'Providencia', 'Apoquindo', 'Las Condes', 'Kennedy',
    'Grecia', 'Bilbao', 'Irarrázaval', 'Vicuña Mackenna', 'Santa Rosa',
    'Gran Avenida', 'Américo Vespucio', 'Pajaritos', 'Mapocho'
];

function randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function generateAddress(comuna: string): string {
    const streetType = randomElement(STREET_TYPES);
    const streetName = randomElement(STREET_NAMES);
    const number = randomBetween(100, 9999);
    return `${streetType} ${streetName} ${number}, ${comuna}`;
}

function generatePropertyData() {
    const comuna = randomElement(SANTIAGO_COMUNAS);
    const propertyType = randomElement(PROPERTY_TYPES);

    // Generar coordenadas cerca de la comuna
    const lat = comuna.lat + randomFloat(-0.02, 0.02, 4);
    const lng = comuna.lng + randomFloat(-0.02, 0.02, 4);

    // Generar características según tipo
    let bedrooms, bathrooms, parkingSpots, totalSurface, builtSurface, price;

    if (propertyType === 'Departamento') {
        bedrooms = randomBetween(1, 4);
        bathrooms = randomBetween(1, 3);
        parkingSpots = randomBetween(0, 2);
        builtSurface = randomBetween(35, 180);
        totalSurface = builtSurface + randomBetween(0, 20); // Incluye terrazas
        price = BigInt(randomBetween(50, 350) * 1000000); // 50M - 350M CLP
    } else if (propertyType === 'Casa') {
        bedrooms = randomBetween(2, 5);
        bathrooms = randomBetween(1, 4);
        parkingSpots = randomBetween(1, 3);
        totalSurface = randomBetween(80, 500);
        builtSurface = Math.floor(totalSurface * randomFloat(0.4, 0.7));
        price = BigInt(randomBetween(80, 600) * 1000000); // 80M - 600M CLP
    } else if (propertyType === 'Terreno') {
        bedrooms = null;
        bathrooms = null;
        parkingSpots = null;
        totalSurface = randomBetween(150, 5000);
        builtSurface = null;
        price = BigInt(randomBetween(30, 400) * 1000000); // 30M - 400M CLP
    } else if (propertyType === 'Oficina') {
        bedrooms = null;
        bathrooms = randomBetween(1, 3);
        parkingSpots = randomBetween(1, 5);
        builtSurface = randomBetween(40, 300);
        totalSurface = builtSurface;
        price = BigInt(randomBetween(60, 500) * 1000000); // 60M - 500M CLP
    } else {
        // Local Comercial o Parcela
        bedrooms = null;
        bathrooms = randomBetween(1, 2);
        parkingSpots = randomBetween(0, 3);
        totalSurface = randomBetween(50, 400);
        builtSurface = Math.floor(totalSurface * randomFloat(0.5, 0.9));
        price = BigInt(randomBetween(40, 350) * 1000000); // 40M - 350M CLP
    }

    const descriptions = [
        `Excelente ${propertyType.toLowerCase()} en ${comuna.nombre}, sector consolidado con todos los servicios.`,
        `Hermoso ${propertyType.toLowerCase()} ubicado en una de las mejores zonas de ${comuna.nombre}.`,
        `${propertyType} en venta, muy buena ubicación y cerca de comercios, colegios y locomoción.`,
        `Oportunidad única: ${propertyType.toLowerCase()} en ${comuna.nombre} con amplios espacios.`,
        `${propertyType} remodelado, listo para habitar en ${comuna.nombre}.`
    ];

    return {
        id: randomUUID(),
        title: `${propertyType} en ${comuna.nombre}`,
        description: randomElement(descriptions),
        price,
        currency: 'CLP',
        address: generateAddress(comuna.nombre),
        commune: comuna.nombre,
        region: 'Región Metropolitana',
        lat,
        lng,
        totalSurface,
        builtSurface,
        bedrooms,
        bathrooms,
        parkingSpots,
        propertyType,
        source: 'PORTAL_INMOBILIARIO',
        sourceUrl: null, // En un scraper real, esto sería la URL del listing
        externalId: `PI-${randomBetween(100000, 999999)}`,
        mainImage: null,
        images: [],
        publishedAt: new Date(Date.now() - randomBetween(1, 60) * 24 * 60 * 60 * 1000), // 1-60 días atrás
        isActive: true,
    };
}

async function main() {
    console.log('🚀 Iniciando scraping de Portal Inmobiliario (modo de ejemplo)...\n');

    const COUNT = parseInt(process.env.COUNT || '50');
    console.log(`📊 Generando ${COUNT} ofertas de ejemplo...\n`);

    const listings = [];
    for (let i = 0; i < COUNT; i++) {
        listings.push(generatePropertyData());
    }

    console.log('💾 Guardando ofertas en la base de datos...\n');

    let created = 0;
    let skipped = 0;

    for (const listing of listings) {
        try {
            await prisma.propertyListing.upsert({
                where: {
                    source_externalId: {
                        source: listing.source as any,
                        externalId: listing.externalId!,
                    },
                },
                update: {
                    price: listing.price,
                    isActive: listing.isActive,
                },
                create: listing,
            });
            created++;
        } catch (error) {
            console.error(`Error al guardar listing ${listing.id}:`, error);
            skipped++;
        }
    }

    console.log(`\n✅ Proceso completado:`);
    console.log(`   - Ofertas creadas: ${created}`);
    console.log(`   - Ofertas omitidas: ${skipped}`);
    console.log(`   - Total procesadas: ${listings.length}\n`);

    console.log('🗺️  Puedes ver las ofertas en: http://localhost:3000/dashboard/mapa-ofertas\n');
}

main()
    .catch((e) => {
        console.error('❌ Error en el script:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
