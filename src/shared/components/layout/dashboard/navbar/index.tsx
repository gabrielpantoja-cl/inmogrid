'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import AcmeLogo from '@/shared/components/layout/common/AcmeLogo';
import {
  AccountMenu,
  useAccountActions,
} from '@/shared/components/layout/common/account-menu';
import { navigationLinks } from './constants';
import { NavbarLink } from './NavbarLink';
import { MobileMenu } from './MobileMenu';

/**
 * Navbar principal del dashboard. Orquesta los subcomponentes y delega
 * toda la lógica de cuenta a `useAccountActions`.
 *
 * Descomposición:
 * - constants.ts         — links de navegación del dashboard
 * - NavbarLink.tsx       — link individual (desktop/mobile)
 * - MobileMenu.tsx       — drawer móvil (dashboard-specific)
 * - AccountMenu          — dropdown compartido con rutas públicas (common/)
 * - useAccountActions    — hook compartido de estado de cuenta (common/)
 *
 * La acción de "Eliminar cuenta" **no** vive en este navbar — es un flow
 * destructivo irreversible que requiere confirmación GitHub-style y vive
 * en el `DangerZone` de `/dashboard/perfil`.
 */
export default function Navbar() {
  const pathname = usePathname();
  const actions = useAccountActions();

  return (
    <>
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-[60]">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="flex items-center">
                  <AcmeLogo />
                </Link>
              </div>

              <div className="hidden md:ml-8 md:flex md:space-x-1">
                {navigationLinks.map((link) => (
                  <NavbarLink
                    key={link.name}
                    link={link}
                    isActive={pathname === link.href}
                    variant="desktop"
                  />
                ))}
              </div>
            </div>

            <div className="hidden md:flex md:items-center md:space-x-4">
              {actions.user && (
                <div className="text-sm text-gray-600">
                  Hola, <span className="font-medium">{actions.displayName}</span>
                </div>
              )}

              <AccountMenu
                avatarUrl={actions.avatarUrl}
                isOpen={actions.isUserMenuOpen}
                isSigningOut={actions.isSigningOut}
                onToggle={() => actions.setIsUserMenuOpen(!actions.isUserMenuOpen)}
                onSignOut={actions.handleSignOut}
                onCloseDropdown={() => actions.setIsUserMenuOpen(false)}
              />
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => actions.setIsMobileMenuOpen(!actions.isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors duration-200"
                aria-label="Abrir menú"
              >
                {actions.isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {actions.isMobileMenuOpen && (
          <MobileMenu
            pathname={pathname}
            displayName={actions.displayName}
            isSignedIn={!!actions.user}
            isSigningOut={actions.isSigningOut}
            onLinkClick={() => actions.setIsMobileMenuOpen(false)}
            onSignOut={actions.handleSignOut}
          />
        )}
      </nav>

      {(actions.isMobileMenuOpen || actions.isUserMenuOpen) && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-transparent"
          onClick={actions.closeAllMenus}
          onKeyDown={(e) => {
            if (e.key === 'Escape') actions.closeAllMenus();
          }}
          aria-label="Cerrar menú"
        />
      )}
    </>
  );
}
