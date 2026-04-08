'use client';

import { Dialog } from '@/shared/components/ui/dialog';

interface DeleteAccountDialogProps {
  open: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Modal de confirmación para eliminar cuenta. Reutilizable desde cualquier
 * punto del layout que necesite disparar `useDeleteAccount`.
 */
export function DeleteAccountDialog({
  open,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteAccountDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="¿Estás seguro?"
      description="Esta acción eliminará permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer."
      buttons={[
        { label: 'Cancelar', onClick: onClose, variant: 'secondary' },
        {
          label: isDeleting ? 'Eliminando...' : 'Eliminar Cuenta',
          onClick: onConfirm,
          variant: 'danger',
        },
      ]}
    />
  );
}
