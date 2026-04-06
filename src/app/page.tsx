// app/page.tsx - VERSIÓN CORREGIDA SIN REDIRECTS AUTOMÁTICOS
"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AcmeLogo from '../components/ui/common/AcmeLogo';
import Image from 'next/image';
import { lusitana } from '../lib/styles/fonts';
import Link from 'next/link';

export default function Page() {
  console.log('[HomePage] Rendering...');

  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated, user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  console.log('[HomePage] Auth status:', { authLoading, isAuthenticated, user });

  // Manejar autenticación con Supabase
  const handleAuth = async () => {
    if (!acceptedTerms) return;

    try {
      setIsLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        toast.error('Error al iniciar sesión. Por favor intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error en inicio de sesión:', error);
      toast.error('Error inesperado al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar navegación manual al dashboard
  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  // Manejar cierre de sesión con Supabase
  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  // Mostrar loading mientras se verifica la sesión (SOLO EN PRODUCCIÓN)
  if (authLoading && process.env.NODE_ENV === 'production') {
    console.log('[HomePage] Auth is loading, showing spinner...');
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  console.log('[HomePage] Rendering main content...');

  const displayName = profile?.full_name ?? user?.email;

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-6 bg-gray-50">
      {/* Header con Logo */}
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-primary p-4 md:h-52 shadow-lg relative">
        <AcmeLogo />
      </div>

      {/* Contenido Principal */}
      <div className="mt-6 flex grow flex-col gap-6 md:flex-row">
        {/* Panel de Información y Login */}
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-white px-6 py-10 md:w-2/5 md:px-20 shadow-lg border border-gray-200">
          <div className="h-0 w-0 border-b-[30px] border-l-[20px] border-r-[20px] border-b-primary border-l-transparent border-r-transparent" />

          <div className="space-y-4">
            <h1 className={`${lusitana.className} text-2xl text-gray-800 md:text-4xl md:leading-normal font-bold`}>
              Crea y comparte en tu propio <span className="text-primary">espacio digital</span>
            </h1>
            <p className="text-lg text-gray-600 md:text-xl">
              Tu lienzo para construir una marca personal auténtica. Publica, conecta y descubre en un ecosistema libre y colaborativo.
            </p>
          </div>

          {/* Mostrar diferentes opciones según el estado de sesión */}
          <div className="flex flex-col gap-4">
            {isAuthenticated ? (
              // Usuario autenticado
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    ¡Hola, {displayName}!
                  </p>
                  <p className="text-green-600 text-sm">
                    Ya tienes sesión iniciada.
                  </p>
                </div>

                <button
                  onClick={handleGoToDashboard}
                  className="flex items-center justify-center gap-3 self-start rounded-lg bg-primary hover:bg-primary/90 px-8 py-4 text-sm font-medium text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 md:text-base min-w-[200px]"
                >
                  <span>Ir al Dashboard</span>
                </button>

                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-3 self-start rounded-lg bg-gray-600 hover:bg-gray-700 px-8 py-4 text-sm font-medium text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 md:text-base min-w-[200px]"
                >
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              // Usuario no autenticado
              <>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-600 leading-relaxed">
                    He leído y acepto los{' '}
                    <Link href="/terms" className="text-primary underline hover:text-primary/80 transition-colors">
                      Términos de Servicio
                    </Link>{' '}
                    y{' '}
                    <Link href="/privacy" className="text-primary underline hover:text-primary/80 transition-colors">
                      Política de Privacidad
                    </Link>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleAuth}
                    className={`flex items-center justify-center gap-3 self-start rounded-lg px-8 py-4 text-sm font-medium transition-all duration-200 md:text-base min-w-[200px] ${
                      !acceptedTerms || isLoading
                        ? 'bg-gray-300 cursor-not-allowed text-gray-600 shadow-none'
                        : 'bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                    disabled={!acceptedTerms || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <span>Iniciar sesión con Google</span>
                    )}
                  </button>

                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-3 self-start rounded-lg bg-gray-100 hover:bg-gray-200 px-8 py-4 text-sm font-medium text-gray-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 md:text-base min-w-[200px]"
                  >
                    <span>Entrar como incógnito</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Panel de Imagen */}
        <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
          <div className="relative w-full max-w-4xl aspect-[16/10] rounded-lg overflow-hidden shadow-2xl border border-gray-200">
            <Image
              src="/images/hero-alternatives/cat-plants-02.jpg"
              alt="degux.cl - ecosistema digital colaborativo"
              fill
              priority
              quality={80}
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
