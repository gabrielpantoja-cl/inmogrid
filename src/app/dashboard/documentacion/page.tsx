import { DocsViewer } from '@/components/features/docs/DocsViewer';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { redirect } from 'next/navigation';

export default async function DocumentacionPage() {
  const session = await getServerSession(authOptions);

  // Proteger la ruta solo para administradores
  if (!session?.user || session.user.role !== 'admin') {
    // Si no es admin, redirigir a una página de acceso denegado o al dashboard
    // console.log('Acceso denegado a la documentación. Rol de usuario:', session?.user?.role);
    redirect('/dashboard');
  }

  // Si es admin, renderizar la documentación
  return <DocsViewer />;
}