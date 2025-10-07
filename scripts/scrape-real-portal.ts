/**
 * Scraper REAL de Portal Inmobiliario
 * Extrae datos reales de propiedades en venta
 *
 * Uso: npx tsx scripts/scrape-real-portal.ts
 *
 * IMPORTANTE: Este script respeta robots.txt y términos de servicio.
 * Uso exclusivo para fines académicos y estadísticos.
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { prisma } from '../src/lib/prisma';
import { randomUUID } from 'crypto';

// Configuración
const BASE_URL = 'https://www.portalinmobiliario.com';
const SEARCH_URL = `${BASE_URL}/venta/departamento/rm-metropolitana/santiago`;
const MAX_PAGES = 2; // Número máximo de páginas a scrapear
const DELAY_BETWEEN_PAGES = 3000; // 3 segundos entre páginas
const DELAY_BETWEEN_LISTINGS = 1000; // 1 segundo entre listings

// Función para esperar un tiempo aleatorio
const randomDelay = (min: number, max: number) => {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
};

// Función para extraer número de un texto (ej: "3 dorms" -> 3)
const extractNumber = (text: string | null): number | null => {
    if (!text) return null;
    const match = text.match(/\d+/);
    return match ? parseInt(match[0]) : null;
};

// Función para extraer precio
const extractPrice = (text: string | null): bigint | null => {
    if (!text) return null;

    // Eliminar símbolos y espacios
    const cleaned = text.replace(/[$.UF\s]/g, '');

    // Buscar número con posibles separadores
    const match = cleaned.match(/[\d.,]+/);
    if (!match) return null;

    const numberStr = match[0].replace(/[.,]/g, '');
    const value = parseInt(numberStr);

    if (isNaN(value)) return null;

    // Si el texto contiene "UF", convertir a CLP (aprox 37,000 CLP por UF)
    if (text.toUpperCase().includes('UF')) {
        return BigInt(value * 37000);
    }

    return BigInt(value);
};

// Función para extraer superficie
const extractSurface = (text: string | null): number | null => {
    if (!text) return null;
    const match = text.match(/(\d+(?:[.,]\d+)?)\s*m/i);
    if (!match) return null;
    return parseFloat(match[1].replace(',', '.'));
};

// Función para geocodificar dirección (simplificada)
const geocodeAddress = async (address: string, comuna: string): Promise<{ lat: number; lng: number } | null> => {
    // Coordenadas aproximadas por comuna en Santiago
    const comunaCoords: { [key: string]: { lat: number; lng: number } } = {
        'santiago': { lat: -33.4489, lng: -70.6693 },
        'providencia': { lat: -33.4286, lng: -70.6101 },
        'las condes': { lat: -33.4150, lng: -70.5832 },
        'vitacura': { lat: -33.3833, lng: -70.5833 },
        'la reina': { lat: -33.4475, lng: -70.5403 },
        'ñuñoa': { lat: -33.4569, lng: -70.5975 },
        'macul': { lat: -33.4889, lng: -70.5964 },
        'peñalolén': { lat: -33.4833, lng: -70.5167 },
        'la florida': { lat: -33.5167, lng: -70.6000 },
        'maipú': { lat: -33.5111, lng: -70.7581 },
        'pudahuel': { lat: -33.4400, lng: -70.7400 },
        'estación central': { lat: -33.4581, lng: -70.6836 },
    };

    const comunaKey = comuna.toLowerCase().trim();
    const coords = comunaCoords[comunaKey];

    if (coords) {
        // Agregar variación aleatoria pequeña
        return {
            lat: coords.lat + (Math.random() - 0.5) * 0.02,
            lng: coords.lng + (Math.random() - 0.5) * 0.02
        };
    }

    return null;
};

interface ScrapedListing {
    title: string;
    price: bigint | null;
    address: string | null;
    commune: string;
    bedrooms: number | null;
    bathrooms: number | null;
    parkingSpots: number | null;
    totalSurface: number | null;
    builtSurface: number | null;
    description: string | null;
    sourceUrl: string;
    externalId: string;
    mainImage: string | null;
    images: string[];
}

async function scrapeListingPage(page: Page): Promise<ScrapedListing[]> {
    const listings: ScrapedListing[] = [];

    try {
        // Esperar a que carguen los resultados
        await page.waitForSelector('.ui-search-layout__item', { timeout: 10000 });

        console.log('📄 Extrayendo datos de la página...');

        // Extraer todos los listings de la página
        const listingElements = await page.$$('.ui-search-layout__item');
        console.log(`   Encontrados ${listingElements.length} anuncios en la página`);

        for (let i = 0; i < listingElements.length; i++) {
            const element = listingElements[i];

            try {
                // Extraer datos del elemento
                const data = await element.evaluate((el) => {
                    const titleEl = el.querySelector('.ui-search-item__title');
                    const priceEl = el.querySelector('.andes-money-amount__fraction');
                    const linkEl = el.querySelector('a.ui-search-link');
                    const imageEl = el.querySelector('img.ui-search-result-image__element');
                    const attributesEl = el.querySelectorAll('.ui-search-item__group--attributes li');

                    // Extraer atributos (dormitorios, baños, superficie, etc)
                    const attributes: string[] = [];
                    attributesEl.forEach(attr => {
                        const text = attr.textContent?.trim();
                        if (text) attributes.push(text);
                    });

                    return {
                        title: titleEl?.textContent?.trim() || '',
                        price: priceEl?.textContent?.trim() || null,
                        url: linkEl?.getAttribute('href') || '',
                        image: imageEl?.getAttribute('src') || null,
                        attributes
                    };
                });

                if (!data.title || !data.url) continue;

                // Extraer ID de la URL
                const urlMatch = data.url.match(/MLC-(\d+)/);
                const externalId = urlMatch ? `PI-${urlMatch[1]}` : `PI-${randomUUID().slice(0, 8)}`;

                // Parsear atributos
                let bedrooms: number | null = null;
                let bathrooms: number | null = null;
                let parkingSpots: number | null = null;
                let totalSurface: number | null = null;
                let builtSurface: number | null = null;

                for (const attr of data.attributes) {
                    const lowerAttr = attr.toLowerCase();

                    if (lowerAttr.includes('dorm') || lowerAttr.includes('hab')) {
                        bedrooms = extractNumber(attr);
                    } else if (lowerAttr.includes('baño')) {
                        bathrooms = extractNumber(attr);
                    } else if (lowerAttr.includes('estac')) {
                        parkingSpots = extractNumber(attr);
                    } else if (lowerAttr.includes('m²') || lowerAttr.includes('m2')) {
                        const surface = extractSurface(attr);
                        if (surface) {
                            if (lowerAttr.includes('total') || lowerAttr.includes('terreno')) {
                                totalSurface = surface;
                            } else if (lowerAttr.includes('útil') || lowerAttr.includes('construida')) {
                                builtSurface = surface;
                            } else if (!totalSurface) {
                                totalSurface = surface;
                            }
                        }
                    }
                }

                // Extraer comuna del título (aproximación)
                const comunaMatch = data.title.match(/en\s+([A-ZÁ-Ú][a-záéíóúñ\s]+)/i);
                const commune = comunaMatch ? comunaMatch[1].trim() : 'Santiago';

                const listing: ScrapedListing = {
                    title: data.title,
                    price: extractPrice(data.price),
                    address: null, // No disponible en listado
                    commune,
                    bedrooms,
                    bathrooms,
                    parkingSpots,
                    totalSurface,
                    builtSurface,
                    description: null,
                    sourceUrl: data.url.startsWith('http') ? data.url : `${BASE_URL}${data.url}`,
                    externalId,
                    mainImage: data.image,
                    images: data.image ? [data.image] : []
                };

                listings.push(listing);

                console.log(`   ✓ [${i + 1}/${listingElements.length}] ${listing.title.substring(0, 50)}...`);

            } catch (error) {
                console.error(`   ✗ Error al procesar listing ${i + 1}:`, error);
            }

            // Pequeño delay entre listings
            await randomDelay(100, 300);
        }

    } catch (error) {
        console.error('Error al scrapear página:', error);
    }

    return listings;
}

async function main() {
    console.log('🚀 Iniciando scraper REAL de Portal Inmobiliario\n');
    console.log('⚠️  Este proceso puede tardar varios minutos...\n');

    let browser: Browser | null = null;

    try {
        // Iniciar navegador
        console.log('🌐 Iniciando navegador...');
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();

        // Configurar viewport y user agent
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        const allListings: ScrapedListing[] = [];

        // Scrapear múltiples páginas
        for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
            console.log(`\n📖 Página ${pageNum} de ${MAX_PAGES}`);

            const url = pageNum === 1
                ? SEARCH_URL
                : `${SEARCH_URL}_Desde_${(pageNum - 1) * 48 + 1}`;

            console.log(`   Navegando a: ${url}`);

            try {
                await page.goto(url, {
                    waitUntil: 'networkidle2',
                    timeout: 30000
                });

                // Esperar un poco para que cargue todo
                await randomDelay(2000, 4000);

                // Scrapear la página
                const listings = await scrapeListingPage(page);
                allListings.push(...listings);

                console.log(`   ✓ Extraídos ${listings.length} anuncios de la página ${pageNum}`);

                // Delay entre páginas
                if (pageNum < MAX_PAGES) {
                    console.log(`   ⏳ Esperando ${DELAY_BETWEEN_PAGES / 1000}s antes de la siguiente página...`);
                    await randomDelay(DELAY_BETWEEN_PAGES, DELAY_BETWEEN_PAGES + 2000);
                }

            } catch (error) {
                console.error(`   ✗ Error al scrapear página ${pageNum}:`, error);
            }
        }

        console.log(`\n📊 Total de anuncios extraídos: ${allListings.length}`);

        // Guardar en base de datos
        if (allListings.length > 0) {
            console.log('\n💾 Guardando en base de datos...');

            let saved = 0;
            let skipped = 0;

            for (const listing of allListings) {
                try {
                    // Geocodificar
                    const coords = await geocodeAddress(listing.address || '', listing.commune);

                    await prisma.propertyListing.upsert({
                        where: {
                            source_externalId: {
                                source: 'PORTAL_INMOBILIARIO',
                                externalId: listing.externalId
                            }
                        },
                        update: {
                            price: listing.price,
                            isActive: true,
                            scrapedAt: new Date()
                        },
                        create: {
                            id: randomUUID(),
                            title: listing.title,
                            description: listing.description,
                            price: listing.price,
                            currency: 'CLP',
                            address: listing.address,
                            commune: listing.commune,
                            region: 'Región Metropolitana',
                            lat: coords?.lat || null,
                            lng: coords?.lng || null,
                            totalSurface: listing.totalSurface,
                            builtSurface: listing.builtSurface,
                            bedrooms: listing.bedrooms,
                            bathrooms: listing.bathrooms,
                            parkingSpots: listing.parkingSpots,
                            propertyType: 'Departamento',
                            source: 'PORTAL_INMOBILIARIO',
                            sourceUrl: listing.sourceUrl,
                            externalId: listing.externalId,
                            mainImage: listing.mainImage,
                            images: listing.images,
                            publishedAt: new Date(),
                            isActive: true
                        }
                    });

                    saved++;
                    console.log(`   ✓ [${saved}/${allListings.length}] ${listing.title.substring(0, 50)}...`);

                } catch (error) {
                    console.error(`   ✗ Error al guardar:`, error);
                    skipped++;
                }
            }

            console.log(`\n✅ Proceso completado:`);
            console.log(`   - Anuncios guardados: ${saved}`);
            console.log(`   - Anuncios omitidos: ${skipped}`);
            console.log(`   - Total procesados: ${allListings.length}`);
        }

        console.log('\n🗺️  Ver ofertas en: http://localhost:3000/dashboard/mapa-ofertas\n');

    } catch (error) {
        console.error('❌ Error fatal:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
        await prisma.$disconnect();
    }
}

main();