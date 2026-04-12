'use client';

import Link from 'next/link';
import { PowerIcon, UserIcon } from '@heroicons/react/24/outline';
import { NavbarLink } from './NavbarLink';
import { navigationLinks } from './constants';

interface MobileMenuProps {
  pathname: string;
  displayName?: string | null;
  isSignedIn: boolean;
  isSigningOut: boolean;
  onLinkClick: () => void;
  onSignOut: () => void;
}

/**
 * Menú móvil colapsable del Navbar (visible solo cuando isMobileMenuOpen).
 *
 * La eliminación de cuenta no vive acá — es un flow destructivo que
 * requiere confirmación GitHub-style y solo está disponible desde el
 * `DangerZone` de `/dashboard/perfil`. Acá linkeamos a "Mi Perfil" para
 * que el usuario llegue naturalmente si busca borrar su cuenta.
 */
export function MobileMenu({
  pathname,
  displayName,
  isSignedIn,
  isSigningOut,
  onLinkClick,
  onSignOut,
}: MobileMenuProps) {
  return (
    <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
      <div className="px-2 pt-2 pb-3 space-y-1">
        {navigationLinks.map((link) => (
          <NavbarLink
            key={link.name}
            link={link}
            isActive={pathname === link.href}
            variant="mobile"
            onClick={onLinkClick}
          />
        ))}

        <div className="border-t border-gray-200 pt-3 mt-3">
          {isSignedIn && (
            <div className="px-3 py-2 text-sm text-gray-600">
              Conectado como <span className="font-medium">{displayName}</span>
            </div>
          )}

          <Link
            href="/dashboard/perfil"
            onClick={onLinkClick}
            className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors duration-200"
          >
            <UserIcon className="w-5 h-5 mr-3" />
            Mi Perfil
          </Link>

          <button
            type="button"
            onClick={onSignOut}
            disabled={isSigningOut}
            className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors duration-200 ${
              isSigningOut ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <PowerIcon className={`w-5 h-5 mr-3 ${isSigningOut ? 'animate-spin' : ''}`} />
            {isSigningOut ? 'Cerrando...' : 'Cerrar Sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
