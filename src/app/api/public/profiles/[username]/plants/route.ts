// API pública para obtener plantas de un usuario
// GET /api/public/profiles/[username]/plants
// NO requiere autenticación

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const { searchParams } = new URL(request.url);

    // Parámetros opcionales
    const onlyFavorites = searchParams.get('favorites') === 'true';
    const category = searchParams.get('category');

    // Buscar usuario por username
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, isPublicProfile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (!user.isPublicProfile) {
      return NextResponse.json(
        { error: 'Este perfil es privado' },
        { status: 403 }
      );
    }

    // Construir filtros
    const where: any = {
      userId: user.id,
    };

    if (onlyFavorites) {
      where.isFavorite = true;
    }

    if (category) {
      where.category = category;
    }

    // Obtener plantas
    const plants = await prisma.plant.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        scientificName: true,
        description: true,
        careInstructions: true,
        mainImageUrl: true,
        imageUrls: true,
        category: true,
        difficulty: true,
        sunlight: true,
        watering: true,
        origin: true,
        isFavorite: true,
        featured: true,
        createdAt: true,
      },
      orderBy: [
        { featured: 'desc' },
        { isFavorite: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      plants,
      count: plants.length,
    });
  } catch (error) {
    console.error('[API Public Plants Error]:', error);
    return NextResponse.json(
      { error: 'Error al obtener plantas' },
      { status: 500 }
    );
  }
}
