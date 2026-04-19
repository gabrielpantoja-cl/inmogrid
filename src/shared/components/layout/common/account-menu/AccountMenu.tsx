'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  PowerIcon,
  UserIcon,
  UserCircleIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  MapIcon,
} from '@heroicons/react/24/outline';

interface AccountMenuProps {
  avatarUrl?: string | null;
  username?: string | null;
  isOpen: boolean;
  isSigningOut: boolean;
  onToggle: () => void;
  onSignOut: () => void;
  onCloseDropdown: () => void;
}

/**
 * Dropdown de cuenta reutilizable: avatar + accesos rápidos del usuario.
 *
 * Usado tanto por el navbar del dashboard como por el `PublicHeader` de las
 * rutas públicas para garantizar una experiencia de sesión consistente en
 * toda la app. Los handlers se inyectan como props — la lógica vive en
 * `useAccountActions`.
 *
 * **No incluye links legales** (Términos / Privacidad) porque ya viven en
 * el footer global y llenar el dropdown con ellos le roba espacio a los
 * accesos útiles (perfil, publicaciones, referenciales).
 *
 * **No incluye "Eliminar cuenta"**. Esa acción es irreversible y vive solo
 * en la zona de peligro de `/dashboard/perfil` (`DangerZone`), detrás de
 * un flujo de confirmación GitHub-style que obliga a escribir el email
 * del usuario. Ponerla en un dropdown global sería demasiado fácil de
 * disparar por accidente.
 */
export function AccountMenu({
  avatarUrl,
  username,
  isOpen,
  isSigningOut,
  onToggle,
  onSignOut,
  onCloseDropdown,
}: AccountMenuProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center p-2 rounded-full text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors duration-200"
        aria-label="Menú de cuenta"
        aria-haspopup="menu"
        aria-expanded={isOpen}
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
        <div
          className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-[60]"
          role="menu"
        >
          {username && (
            <Link
              href={`/${username}`}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              onClick={onCloseDropdown}
              role="menuitem"
            >
              <UserCircleIcon className="w-4 h-4 mr-3 text-gray-500" />
              Ver mi perfil público
            </Link>
          )}

          <Link
            href="/dashboard/perfil"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            onClick={onCloseDropdown}
            role="menuitem"
          >
            <PencilSquareIcon className="w-4 h-4 mr-3 text-gray-500" />
            Editar perfil
          </Link>

          <Link
            href="/dashboard/notas"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            onClick={onCloseDropdown}
            role="menuitem"
          >
            <DocumentTextIcon className="w-4 h-4 mr-3 text-gray-500" />
            Mis publicaciones
          </Link>

          <Link
            href="/dashboard/referenciales"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            onClick={onCloseDropdown}
            role="menuitem"
          >
            <MapIcon className="w-4 h-4 mr-3 text-gray-500" />
            Mapa
          </Link>

          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              type="button"
              onClick={onSignOut}
              disabled={isSigningOut}
              className={`w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 ${
                isSigningOut ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              role="menuitem"
            >
              <PowerIcon className={`w-4 h-4 mr-3 text-gray-500 ${isSigningOut ? 'animate-spin' : ''}`} />
              {isSigningOut ? 'Cerrando...' : 'Cerrar sesión'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
