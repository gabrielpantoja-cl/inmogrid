// Feature "plantas" no disponible en degux.cl — redirige al perfil
import { redirect } from 'next/navigation';

interface PlantPageProps {
  params: Promise<{ username: string; slug: string }>;
}

export default async function PlantPage({ params }: PlantPageProps) {
  const { username } = await params;
  redirect(`/${username}`);
}
