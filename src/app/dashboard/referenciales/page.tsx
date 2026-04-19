import { requireAuth } from '@/shared/lib/supabase/auth';
import DashboardReferencialesContent from './DashboardReferencialesContent';

export const metadata = {
  title: 'Mapa | inmogrid.cl',
  description: 'Explora y contribuye datos de transacciones inmobiliarias verificadas en Chile.',
};

export default async function DashboardReferencialesPage() {
  await requireAuth();

  return <DashboardReferencialesContent />;
}
