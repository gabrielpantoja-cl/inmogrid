import { requireAuth } from '@/shared/lib/supabase/auth';
import CrearNotaForm from './CrearNotaForm';

export const metadata = {
  title: 'Nueva Publicación - degux.cl',
  description: 'Crea una nueva publicación',
};

export default async function CrearNotaPage() {
  // Ensures the user is authenticated; redirects to /auth/login otherwise
  await requireAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <CrearNotaForm />
    </div>
  );
}
