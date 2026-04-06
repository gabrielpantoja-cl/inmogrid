import { requireAuth, getProfile } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import NotasContent from './NotasContent';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Mis Notas - degux.cl',
  description: 'Gestiona tus publicaciones y contenido',
};

export default async function NotasPage() {
  const user = await requireAuth();

  // Obtener el perfil del usuario para el username
  const profile = await getProfile(user.id);

  if (!profile) {
    redirect('/auth/login');
  }

  // Obtener posts del usuario
  const posts = await prisma.post.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImageUrl: true,
      published: true,
      publishedAt: true,
      tags: true,
      readTime: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <NotasContent
      username={profile.username}
      initialPosts={posts}
    />
  );
}
