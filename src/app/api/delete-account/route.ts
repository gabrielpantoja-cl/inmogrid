// DELETE /api/delete-account
//
// Elimina **definitivamente** la cuenta del usuario autenticado:
//  1. Valida que el body contenga `{ confirmation }` y que `confirmation`
//     matchee exactamente el email del usuario (protección tipo GitHub).
//  2. En una transacción Postgres, borra todas las filas que el usuario
//     poseía en las tablas de `public.*` (posts, inmogrid_*, profiles legacy
//     de pantojapropiedades.cl) y finalmente borra la fila de `auth.users`.
//  3. Devuelve 200 si todo fue atómico. El cliente es responsable de
//     hacer un hard reload a `/` — las cookies stale las limpia el
//     middleware en el siguiente request.
//
// Notas importantes:
//  - NO usamos `prisma.post.*` ni `prisma.profile.delete` tipados porque
//    el schema `public.posts` tiene columnas divergentes del Prisma schema
//    (ver `docs/deuda-tecnica.md` P0 #1). Usamos `$executeRaw` con
//    parámetros posicionales en todas las tablas para evitar cualquier
//    dependencia del mapping de columnas.
//  - El role `postgres.SUPABASE_PROJECT_REF` con el que corre Prisma tiene
//    permisos sobre `auth.users` (lo verificamos en la consolidación de
//    usuarios del 2026-04-11), así que no necesitamos un admin client con
//    `SUPABASE_SERVICE_ROLE_KEY` separado.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser } from '@/shared/lib/supabase/auth';
import { prisma } from '@/shared/lib/prisma';

const deleteBodySchema = z.object({
  confirmation: z.string().min(1),
});

export async function DELETE(request: NextRequest) {
  // 1. Autenticación
  const authUser = await getUser();

  if (!authUser?.id || !authUser?.email) {
    return NextResponse.json(
      {
        success: false,
        message: 'No tienes autorización para realizar esta acción. Por favor, inicia sesión.',
        error: 'UNAUTHORIZED',
      },
      { status: 401 }
    );
  }

  // 2. Parse + validación del body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'El cuerpo de la petición no es JSON válido.',
        error: 'INVALID_BODY',
      },
      { status: 400 }
    );
  }

  const parsed = deleteBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: 'Falta el campo `confirmation` en el cuerpo de la petición.',
        error: 'MISSING_CONFIRMATION',
      },
      { status: 400 }
    );
  }

  // 3. La confirmación debe matchear el email del usuario exactamente.
  //    Case-sensitive — forzamos al usuario a copiar/escribir el email tal
  //    cual para que sea un gesto deliberado.
  if (parsed.data.confirmation !== authUser.email) {
    return NextResponse.json(
      {
        success: false,
        message: 'El texto de confirmación no coincide con tu email. Escríbelo exactamente como aparece en la pantalla.',
        error: 'CONFIRMATION_MISMATCH',
      },
      { status: 400 }
    );
  }

  // 4. Borrado transaccional. Orden:
  //    - Data de public.* que referencia al user (posts, inmogrid_*)
  //    - Tabla profiles legacy de pantojapropiedades.cl (no-op si no existe fila)
  //    - Finalmente auth.users (al último para que si algo falla antes, el
  //      usuario pueda reintentar — auth.users sigue vivo)
  const userId = authUser.id;

  try {
    await prisma.$transaction([
      // Posts (schema compartido con pantojapropiedades.cl — columna `author_id`)
      prisma.$executeRaw`DELETE FROM public.posts WHERE author_id = ${userId}::uuid`,

      // Tablas de inmogrid — columna `user_id` o `id`
      prisma.$executeRaw`DELETE FROM public.inmogrid_audit_logs            WHERE user_id = ${userId}::uuid`,
      prisma.$executeRaw`DELETE FROM public.inmogrid_chat_messages         WHERE user_id = ${userId}::uuid`,
      prisma.$executeRaw`DELETE FROM public.inmogrid_events                WHERE user_id = ${userId}::uuid`,
      prisma.$executeRaw`DELETE FROM public.inmogrid_professional_profiles WHERE user_id = ${userId}::uuid`,
      prisma.$executeRaw`
        DELETE FROM public.inmogrid_connections
        WHERE requester_id = ${userId}::uuid OR receiver_id = ${userId}::uuid
      `,
      prisma.$executeRaw`DELETE FROM public.inmogrid_profiles              WHERE id = ${userId}::uuid`,

      // Profiles legacy de pantojapropiedades.cl (FK a auth.users con ON
      // DELETE CASCADE, así que el DELETE de auth.users de abajo también
      // limpiaría esto — pero lo hacemos explícito para ser defensivos
      // contra schemas futuros que pierdan el cascade)
      prisma.$executeRaw`DELETE FROM public.profiles WHERE user_id = ${userId}::uuid`,

      // auth.users (al final — si algo explotó antes, el usuario sigue
      // existiendo y puede volver a intentarlo)
      prisma.$executeRaw`DELETE FROM auth.users WHERE id = ${userId}::uuid`,
    ]);
  } catch (error) {
    console.error('[DELETE /api/delete-account] Transaction failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ocurrió un error al intentar eliminar tu cuenta. No se eliminó nada. Por favor, intenta de nuevo.',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: 'Tu cuenta y todos tus datos fueron eliminados. Serás redirigido a la página principal.',
    },
    { status: 200 }
  );
}
