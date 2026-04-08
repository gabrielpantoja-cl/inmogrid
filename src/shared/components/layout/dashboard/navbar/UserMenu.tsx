'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  PowerIcon,
  ExclamationTriangleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface UserMenuProps {
  avatarUrl?: string | null;
  isOpen: boolean;
  isSigningOut: boolean;
  isDeleting: boolean;
  onToggle: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  onCloseDropdown: () => void;
}

/**
 * Dropdown de usuario del Navbar desktop. Muestra avatar + menú con
 * cerrar sesión, eliminar cuenta y enlaces legales.
 */
export function UserMenu({
  avatarUrl,
  isOpen,
  isSigningOut,
  isDeleting,
  onToggle,
  onSignOut,
  onDeleteAccount,
  onCloseDropdown,
}: UserMenuProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center p-2 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
        aria-label="Menú de usuario"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Avatar"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <UserIcon className="w-8 h-8" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-[60]">
          <button
            onClick={onSignOut}
            disabled={isSigningOut}
            className={`w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 ${
              isSigningOut ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <PowerIcon className={`w-4 h-4 mr-3 ${isSigningOut ? 'animate-spin' : ''}`} />
            {isSigningOut ? 'Cerrando...' : 'Cerrar Sesión'}
          </button>

          <div className="border-t border-gray-100" />

          <button
            onClick={onDeleteAccount}
            disabled={isDeleting}
            className={`w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 ${
              isDeleting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ExclamationTriangleIcon
              className={`w-4 h-4 mr-3 ${isDeleting ? 'animate-pulse' : ''}`}
            />
            {isDeleting ? 'Eliminando...' : 'Eliminar Cuenta'}
          </button>

          <div className="border-t border-gray-100 mt-1 pt-1">
            <Link
              href="/terms"
              className="block px-4 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
              onClick={onCloseDropdown}
            >
              Términos de Servicio
            </Link>
            <Link
              href="/privacy"
              className="block px-4 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
              onClick={onCloseDropdown}
            >
              Política de Privacidad
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
