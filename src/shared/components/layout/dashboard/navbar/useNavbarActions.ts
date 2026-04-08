'use client';

import { useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useDeleteAccount } from '@/shared/hooks/useDeleteAccount';

/**
 * Combina signOut + deleteAccount + estado de menús.
 * Centraliza toda la lógica de acciones del Navbar para que el componente
 * orquestador sea mayormente presentacional.
 */
export function useNavbarActions() {
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
      console.error('SignOut failed in navbar:', error);
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
