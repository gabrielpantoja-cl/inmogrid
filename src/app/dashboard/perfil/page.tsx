// Página de edición de perfil del usuario
// Ruta: /dashboard/perfil (autenticado)

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProfileEditForm from '@/components/forms/ProfileEditForm';

export const metadata = {
  title: 'Editar Perfil | degux.cl',
  description: 'Edita tu perfil y personaliza tu presencia en degux.cl',
};

export default async function ProfileEditPage() {
  const session = await getServerSession(authOptions);

  // Redirigir si no está autenticado
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Obtener datos completos del usuario
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      image: true,
      bio: true,
      tagline: true,
      coverImageUrl: true,
      location: true,
      identityTags: true,
      profession: true,
      company: true,
      phone: true,
      region: true,
      commune: true,
      website: true,
      linkedin: true,
      isPublicProfile: true,
      externalLinks: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          ✏️ Editar Mi Perfil
        </h1>
        <p className="mt-2 text-gray-600">
          Personaliza tu perfil y define cómo te ven los demás en degux.cl
        </p>
      </div>

      {/* Formulario de edición */}
      <ProfileEditForm user={user} />
    </div>
  );
}
