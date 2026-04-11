'use client';

import { useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useDeleteAccount } from '@/shared/hooks/useDeleteAccount';

/**
 * Hook que combina `useAuth` + `useDeleteAccount` y expone el estado
 * presentacional necesario para renderizar `AccountMenu` y
 * `DeleteAccountDialog`.
 *
 * Diseñado para ser el **único** punto de acoplamiento entre la lógica de
 * sesión/cuenta y los componentes presentacionales del menú de cuenta. Se
 * consume desde el navbar del dashboard y desde el `PublicHeader` de las
 * rutas públicas — garantiza que ambos lados compartan exactamente el mismo
 * comportamiento (mismas transiciones de estado, mismo signOut, mismo delete).
 */
export function useAccountActions() {
  const { user, profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const {
    deleteAccount,
    isDeleting,
    showModal,
    setShowModal,
    handleConfirmDelete,
  } = useDeleteAccount();

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

  const handleDeleteAccount = () => {
    setIsUserMenuOpen(false);
    deleteAccount();
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
    isDeleting,
    showModal,
    setShowModal,
    handleSignOut,
    handleDeleteAccount,
    handleConfirmDelete,
    closeAllMenus,
  };
}
