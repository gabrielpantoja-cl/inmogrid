import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { redirect } from 'next/navigation';
import CrearNotaForm from './CrearNotaForm';

export const metadata = {
  title: 'Nueva Publicación - degux.cl',
  description: 'Crea una nueva publicación',
};

export default async function CrearNotaPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <CrearNotaForm session={session} />
    </div>
  );
}
