'use client';

import LatestReferenciales from '@/components/ui/dashboard/latest-referenciales';
import { lusitana } from '@/lib/styles/fonts';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { CardsSkeleton, LatestReferencialesSkeleton } from '@/components/ui/primitives/skeletons';
import { Session } from 'next-auth';
import UfDisplay from '@/components/ui/dashboard/UfDisplay';

const TopCommunesChart = dynamic(
  () => import('@/components/ui/dashboard/TopComunasChart'),
  { ssr: false }
);

interface DashboardContentProps {
  session: Session | null; // ✅ Permitir sesión nula para modo anónimo
  latestReferenciales: any[];
  totalReferenciales: number;
}

export default function DashboardContent({
  session,
  latestReferenciales,
}: DashboardContentProps) {
  return (
    <main className="flex flex-col space-y-6">
      {/* Breadcrumb */}
      <div className="border-b pb-2">
        <h1 className={`${lusitana.className} text-xl md:text-2xl`}>
          Inicio
        </h1>
      </div>

      {/* Contenedor principal */}
      <div className="flex flex-col space-y-6">
        {/* Bienvenida */}
        {session?.user ? (
          <div className="space-y-2">
            <div className="text-lg text-primary">
              👋 ¡Hola! <span className="font-bold">{session.user.name}</span>
            </div>
            <div className="text-sm text-gray-600">
              Cuenta: <span className="font-medium">{session.user.email}</span>
            </div>
            <div className="text-base text-primary">
              Bienvenid@ a referenciales.cl
            </div>
          </div>
        ) : (
          <div className="space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-lg text-blue-800">
              👤 Navegando como <span className="font-bold">Incógnito</span>
            </div>
            <div className="text-sm text-blue-600">
              Estás explorando el dashboard sin autenticación.
              <a href="/auth/signin" className="ml-1 underline hover:text-blue-700">
                Inicia sesión
              </a> para acceder a todas las funciones.
            </div>
          </div>
        )}

        {/* Valor UF */}
        <div className="w-full">
          <Suspense fallback={<CardsSkeleton />}>
            <UfDisplay />
          </Suspense>
        </div>

        {/* Gráficos y referencias */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
          <Suspense fallback={<LatestReferencialesSkeleton />}>
            <LatestReferenciales data={latestReferenciales} />
          </Suspense>
          <Suspense fallback={<LatestReferencialesSkeleton />}>
            <TopCommunesChart />
          </Suspense>
        </div>
      </div>
    </main>
  );
}