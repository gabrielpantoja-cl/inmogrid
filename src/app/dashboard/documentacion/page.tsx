import { DocsViewer } from '@/features/docs/components/DocsViewer';
import { getUser, getProfile } from '@/shared/lib/supabase/auth';
import { redirect } from 'next/navigation';

export default async function DocumentacionPage() {
  const user = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const profile = await getProfile(user.id);

  // Proteger la ruta solo para administradores
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  // Si es admin, renderizar la documentación
  return <DocsViewer />;
}
