'use client';

import {
  PowerIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { NavbarLink } from './NavbarLink';
import { navigationLinks } from './constants';

interface MobileMenuProps {
  pathname: string;
  displayName?: string | null;
  isSignedIn: boolean;
  isSigningOut: boolean;
  isDeleting: boolean;
  onLinkClick: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
}

/**
 * Menú móvil colapsable del Navbar (visible solo cuando isMobileMenuOpen).
 */
export function MobileMenu({
  pathname,
  displayName,
  isSignedIn,
  isSigningOut,
  isDeleting,
  onLinkClick,
  onSignOut,
  onDeleteAccount,
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

          <button
            onClick={onSignOut}
            disabled={isSigningOut}
            className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 ${
              isSigningOut ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <PowerIcon className={`w-5 h-5 mr-3 ${isSigningOut ? 'animate-spin' : ''}`} />
            {isSigningOut ? 'Cerrando...' : 'Cerrar Sesión'}
          </button>

          <button
            onClick={onDeleteAccount}
            disabled={isDeleting}
            className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors duration-200 ${
              isDeleting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ExclamationTriangleIcon
              className={`w-5 h-5 mr-3 ${isDeleting ? 'animate-pulse' : ''}`}
            />
            {isDeleting ? 'Eliminando...' : 'Eliminar Cuenta'}
          </button>
        </div>
      </div>
    </div>
  );
}
