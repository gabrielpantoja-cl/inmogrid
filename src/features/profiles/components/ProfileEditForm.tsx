'use client';

import { useRouter } from 'next/navigation';
import { useProfileForm } from '../hooks/useProfileForm';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { ProfessionalSection } from './sections/ProfessionalSection';
import { SocialPrivacySection } from './sections/SocialPrivacySection';
import type { ProfileUser } from '../types';

interface ProfileEditFormProps {
  user: ProfileUser;
}

/**
 * Orquestador del formulario de edición de perfil.
 * La lógica vive en `useProfileForm`; cada sección es un componente presentacional.
 */
export default function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter();
  const { formData, loading, error, success, handleChange, handleSubmit } =
    useProfileForm(user);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">❌ {error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-green-700">✅ Perfil actualizado correctamente</p>
        </div>
      )}

      <BasicInfoSection formData={formData} onChange={handleChange} />
      <ProfessionalSection formData={formData} onChange={handleChange} />
      <SocialPrivacySection formData={formData} user={user} onChange={handleChange} />

      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="rounded-xl bg-gray-50 p-6 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          📧 Información de la Cuenta (solo lectura)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Username:</span>{' '}
            <span className="font-medium text-gray-900">
              {user.username || 'No asignado'}
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          El email y username no se pueden cambiar desde esta página.
        </p>
      </div>
    </form>
  );
}
