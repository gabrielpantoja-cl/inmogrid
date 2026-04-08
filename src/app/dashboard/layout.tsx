import React from 'react';
import Navbar from '@/shared/components/layout/dashboard/navbar';
import SignOutTestComponent from '@/shared/components/layout/common/SignOutTestComponent';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación superior */}
      <Navbar />

      {/* Contenedor principal */}
      <main className="flex-1">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <div className="w-full max-w-none">
            {children}
          </div>
        </div>
      </main>

      {/* Componente de test solo en desarrollo */}
      <SignOutTestComponent />
    </div>
  );
}
