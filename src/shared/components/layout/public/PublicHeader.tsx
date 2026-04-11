'use client';

import Link from 'next/link';
import {
  AccountMenu,
  DeleteAccountDialog,
  useAccountActions,
} from '@/shared/components/layout/common/account-menu';
import { useAuth } from '@/shared/hooks/useAuth';
import { createClient } from '@/shared/lib/supabase/client';

/**
 * Header sticky para todas las rutas públicas (landing, detalle de post,
 * perfiles públicos, referenciales, privacy, terms). Se monta una sola
 * vez desde `src/app/(public)/layout.tsx` y provee navegación de cuenta
 * consistente con el dashboard: "Hola, {nombre}" + avatar dropdown cuando
 * hay sesión, o botón "Iniciar sesión con Google" cuando no.
 *
 * Consume los primitivos de `common/account-menu` para garantizar paridad
 * visual y de comportamiento con el navbar del dashboard.
 */
export function PublicHeader() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const actions = useAccountActions();

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 md:px-8">
        <div className="max-w-6xl mx-auto h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-black tracking-tight text-gray-900"
          >
            inmo<span className="text-primary">grid</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/referenciales"
              className="hidden sm:inline text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Referenciales
            </Link>

            {authLoading ? (
              // Skeleton mientras se resuelve la sesión — evita el flash
              // entre "no logueado" y "logueado" al recargar.
              <div
                className="h-8 w-24 rounded-full bg-gray-100 animate-pulse"
                aria-hidden="true"
              />
            ) : isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="hidden md:block text-sm text-gray-600">
                  Hola,{' '}
                  <span className="font-medium text-gray-900">
                    {actions.displayName}
                  </span>
                </div>
                <AccountMenu
                  avatarUrl={actions.avatarUrl}
                  isOpen={actions.isUserMenuOpen}
                  isSigningOut={actions.isSigningOut}
                  isDeleting={actions.isDeleting}
                  onToggle={() =>
                    actions.setIsUserMenuOpen(!actions.isUserMenuOpen)
                  }
                  onSignOut={actions.handleSignOut}
                  onDeleteAccount={actions.handleDeleteAccount}
                  onCloseDropdown={() => actions.setIsUserMenuOpen(false)}
                />
              </>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground transition-colors"
              >
                Iniciar sesión con Google
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Backdrop para cerrar el dropdown al clickear fuera */}
      {actions.isUserMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-transparent"
          onClick={actions.closeAllMenus}
          onKeyDown={(e) => {
            if (e.key === 'Escape') actions.closeAllMenus();
          }}
          aria-label="Cerrar menú"
        />
      )}

      <DeleteAccountDialog
        open={actions.showModal}
        isDeleting={actions.isDeleting}
        onClose={() => actions.setShowModal(false)}
        onConfirm={actions.handleConfirmDelete}
      />
    </>
  );
}
