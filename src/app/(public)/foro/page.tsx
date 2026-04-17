import { Metadata } from 'next';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { ComingSoon } from '@/shared/components/layout/public/ComingSoon';

export const metadata: Metadata = {
  title: 'Foro · inmogrid.cl',
  description:
    'Foro de discusión del ecosistema inmobiliario chileno. Hilos por especialidad: tasación, peritajes, corretaje, inversión y más. Próximamente.',
};

export default function ForoPage() {
  return (
    <ComingSoon
      title="Foro de la comunidad"
      description="Hilos de discusión organizados por especialidad: tasación, peritajes, corretaje, inversión, desarrollo inmobiliario y más. Un espacio para preguntar, aprender y compartir experiencia."
      icon={<UserGroupIcon className="w-8 h-8" aria-hidden="true" />}
    />
  );
}
