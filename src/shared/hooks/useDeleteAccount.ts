import { useState, useCallback } from 'react';
import { createClient } from '@/shared/lib/supabase/client';
import { toast } from 'react-hot-toast';

interface DeleteAccountResponse {
  success: boolean;
  message: string;
  error?: string;
  recordCount?: number;
}

export const useDeleteAccount = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleConfirmDelete = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error('Debes iniciar sesión para realizar esta acción');
      return;
    }

    const toastId = toast.loading('Procesando eliminación de cuenta...');

    try {
      setIsDeleting(true);

      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data: DeleteAccountResponse = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.error === 'HAS_ASSOCIATED_RECORDS') {
          toast.error(
            `No se puede eliminar tu cuenta. Tienes ${data.recordCount} registro(s) asociado(s). Por favor, elimínalos primero.`,
            { id: toastId, duration: 5000 }
          );
        } else {
          throw new Error(data.message || 'Error al eliminar la cuenta');
        }
        return;
      }

      toast.success(data.message, { id: toastId });

      // Sign out from Supabase after account deletion
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al eliminar la cuenta',
        { id: toastId }
      );
    } finally {
      setIsDeleting(false);
      setShowModal(false);
    }
  }, []);

  const deleteAccount = useCallback(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        toast.error('Debes iniciar sesión para realizar esta acción');
        return;
      }
      setShowModal(true);
    });
  }, []);

  return {
    deleteAccount,
    isDeleting,
    showModal,
    setShowModal,
    handleConfirmDelete
  };
};
