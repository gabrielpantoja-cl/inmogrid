// API pública para obtener perfil de usuario por username
// GET /api/public/profiles/[username]
// NO requiere autenticación

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // Buscar usuario por username
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        email: false, // NO exponer email en perfil público
        image: true,
        username: true,
        tagline: true,
        bio: true,
        coverImageUrl: true,
        location: true,
        identityTags: true,
        externalLinks: true,
        profession: true,
        company: true,
        website: true,
        linkedin: true,
        isPublicProfile: true,
        createdAt: true,
      },
    });

    // Si no existe el usuario
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Si el perfil no es público
    if (!user.isPublicProfile) {
      return NextResponse.json(
        { error: 'Este perfil es privado' },
        { status: 403 }
      );
    }

    // Devolver perfil público
    return NextResponse.json({
      success: true,
      profile: user,
    });
  } catch (error) {
    console.error('[API Public Profiles Error]:', error);
    return NextResponse.json(
      { error: 'Error al obtener perfil' },
      { status: 500 }
    );
  }
}
