'use client';

import { useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';

/**
 * Hook que combina `useAuth` y el estado presentacional necesario para
 * renderizar `AccountMenu` (dropdown del navbar / PublicHeader).
 *
 * Diseñado para ser el **único** punto de acoplamiento entre la lógica de
 * sesión y los componentes presentacionales del menú de cuenta. Se
 * consume desde el navbar del dashboard y desde el `PublicHeader` de las
 * rutas públicas — garantiza que ambos lados compartan exactamente el
 * mismo comportamiento (mismas transiciones de estado, mismo signOut).
 *
 * **No incluye lógica de eliminar cuenta**. Esa acción destructiva vive
 * solo en `/dashboard/perfil` via el componente `DangerZone` del feature
 * `profiles`, protegida por un flujo de confirmación GitHub-style que
 * obliga a escribir el email del usuario. Poner la eliminación en un
 * dropdown global sería demasiado fácil de disparar por accidente.
 */
export function useAccountActions() {
  const { user, profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setIsUserMenuOpen(false);
    try {
      await signOut();
    } catch (error) {
      console.error('[useAccountActions] SignOut failed:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const displayName = profile?.full_name ?? user?.email;
  const avatarUrl = profile?.avatar_url ?? user?.user_metadata?.avatar_url;

  return {
    user,
    profile,
    displayName,
    avatarUrl,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isUserMenuOpen,
    setIsUserMenuOpen,
    isSigningOut,
    handleSignOut,
    closeAllMenus,
  };
}
