// Esta feature no está disponible en degux.cl
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'Not available' }, { status: 404 });
}
