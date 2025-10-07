import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/property-listings
 * Endpoint público para obtener ofertas scrapeadas de portales externos
 *
 * Query params:
 * - comuna: Filtrar por comuna
 * - region: Filtrar por región
 * - source: Filtrar por fuente (PORTAL_INMOBILIARIO, TOCTOC, etc)
 * - minPrice: Precio mínimo
 * - maxPrice: Precio máximo
 * - limit: Límite de resultados (default: 100, max: 500)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const comuna = searchParams.get('comuna');
    const region = searchParams.get('region');
    const source = searchParams.get('source');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);

    // Construir filtros
    const where: any = {
      isActive: true,
    };

    if (comuna) {
      where.commune = {
        contains: comuna,
        mode: 'insensitive',
      };
    }

    if (region) {
      where.region = {
        contains: region,
        mode: 'insensitive',
      };
    }

    if (source) {
      where.source = source;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = BigInt(minPrice);
      }
      if (maxPrice) {
        where.price.lte = BigInt(maxPrice);
      }
    }

    // Obtener listings
    const listings = await prisma.propertyListing.findMany({
      where,
      take: limit,
      orderBy: {
        scrapedAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        currency: true,
        address: true,
        commune: true,
        region: true,
        lat: true,
        lng: true,
        totalSurface: true,
        builtSurface: true,
        bedrooms: true,
        bathrooms: true,
        parkingSpots: true,
        propertyType: true,
        source: true,
        sourceUrl: true,
        mainImage: true,
        images: true,
        publishedAt: true,
        scrapedAt: true,
      },
    });

    // Convertir BigInt a string para JSON
    const listingsWithStringPrice = listings.map(listing => ({
      ...listing,
      price: listing.price ? listing.price.toString() : null,
    }));

    return NextResponse.json({
      success: true,
      count: listingsWithStringPrice.length,
      data: listingsWithStringPrice,
    });
  } catch (error) {
    console.error('Error fetching property listings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener ofertas de propiedades',
      },
      { status: 500 }
    );
  }
}