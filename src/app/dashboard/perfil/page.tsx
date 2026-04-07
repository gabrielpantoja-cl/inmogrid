// Página de edición de perfil del usuario
// Ruta: /dashboard/perfil (autenticado)

import { requireAuth } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProfileEditForm from '@/components/forms/ProfileEditForm';

export const metadata = {
  title: 'Editar Perfil | degux.cl',
  description: 'Edita tu perfil y personaliza tu presencia en degux.cl',
};

export default async function ProfileEditPage() {
  const authUser = await requireAuth();

  const profile = await prisma.profile.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      fullName: true,
      avatarUrl: true,
      username: true,
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

  if (!profile) {
    redirect('/auth/login');
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Editar Mi Perfil
        </h1>
        <p className="mt-2 text-gray-600">
          Personaliza tu perfil y define cómo te ven los demás en degux.cl
        </p>
      </div>

      <ProfileEditForm user={profile} />
    </div>
  );
}
