import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { redirect } from 'next/navigation';
import NotasContent from './NotasContent';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Mis Notas - degux.cl',
  description: 'Gestiona tus publicaciones y contenido',
};

export default async function NotasPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Obtener posts del usuario
  const posts = await prisma.post.findMany({
    where: {
      userId: session.user.id,
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
      session={session}
      initialPosts={posts}
    />
  );
}
