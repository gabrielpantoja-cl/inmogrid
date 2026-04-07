// Feature "plantas" no disponible en degux.cl — redirige al perfil
import { redirect } from 'next/navigation';

interface PlantsPageProps {
  params: Promise<{ username: string }>;
}

export default async function PlantsPage({ params }: PlantsPageProps) {
  const { username } = await params;
  redirect(`/${username}`);
}
