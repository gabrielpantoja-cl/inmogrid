// API privada para gestionar posts del usuario autenticado.
// Handler delgado — toda la lógica vive en `@/features/posts`.
// GET  /api/posts  → lista posts del usuario
// POST /api/posts  → crea un nuevo post

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/shared/lib/auth';
import {
  listPostsByUser,
  createPostForUser,
  createPostSchema,
} from '@/features/posts';
import { awardPoints } from '@/features/gamification/lib/points';
import { evaluateBadges } from '@/features/gamification/lib/badges';
import { PointReason } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const authUser = await auth();
    if (!authUser?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const publishedParam = searchParams.get('published');
    const published =
      publishedParam === null ? undefined : publishedParam === 'true';

    const posts = await listPostsByUser(authUser.id, { published });

    return NextResponse.json({ success: true, posts, count: posts.length });
  } catch (error) {
    console.error('[API Posts GET Error]:', error);
    return NextResponse.json(
      { error: 'Error al obtener posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await auth();
    if (!authUser?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const post = await createPostForUser(authUser.id, parsed.data);

    if (parsed.data.published) {
      awardPoints(authUser.id, 15, PointReason.POST_PUBLISHED, post.id)
        .then(() => evaluateBadges(authUser.id))
        .catch((err) => console.error('[Gamification] post points error:', err));
    }

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('[API Posts POST Error]:', error);
    return NextResponse.json(
      { error: 'Error al crear post' },
      { status: 500 }
    );
  }
}
