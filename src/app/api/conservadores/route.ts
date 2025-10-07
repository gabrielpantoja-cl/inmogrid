import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Obtener todos los conservadores (acceso público)
    const conservadores = await prisma.conservadores.findMany({
      orderBy: [
        { region: 'asc' },
        { comuna: 'asc' },
        { nombre: 'asc' }
      ]
    });

    return NextResponse.json(conservadores);
  } catch (error) {
    console.error('Error fetching conservadores:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}