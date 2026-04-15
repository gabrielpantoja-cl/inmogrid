'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileForm } from '../hooks/useProfileForm';
import { AvatarUpload } from './AvatarUpload';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { ProfessionalSection } from './sections/ProfessionalSection';
import { SocialPrivacySection } from './sections/SocialPrivacySection';
import type { ProfileUser } from '../types';

interface ProfileEditFormProps {
  user: ProfileUser;
}

function ProfileUrlBanner({
  username,
  isPublic,
}: {
  username: string | null;
  isPublic: boolean;
}) {
  const [copied, setCopied] = useState(false);

  if (!username) {
    return (
      <div className="rounded-xl bg-yellow-50 border border-yellow-200 px-5 py-4 text-sm text-yellow-800">
        Tu perfil no tiene un username asignado aún. Contacta al administrador.
      </div>
    );
  }

  const profileUrl = `https://www.inmogrid.cl/${username}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silencioso
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Tu perfil público
          </span>
          {isPublic ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Visible
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              Privado
            </span>
          )}
        </div>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm text-yellow-700 hover:text-yellow-800 hover:underline truncate block"
        >
          {profileUrl}
        </a>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {copied ? '✓ Copiado' : 'Copiar enlace'}
        </button>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-600 transition-colors"
        >
          Ver perfil →
        </a>
      </div>
    </div>
  );
}

/**
 * Orquestador del formulario de edición de perfil.
 * La lógica vive en `useProfileForm`; cada sección es un componente presentacional.
 *
 * Nota: `AvatarUpload` queda renderizado ARRIBA del `<form>` porque el avatar
 * se sube de forma inmediata y asíncrona (no espera al submit del resto del
 * form) — así el usuario ve el cambio al toque y no tiene que acordarse de
 * apretar "Guardar".
 */
export default function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter();
  const { formData, loading, error, success, handleChange, handleSubmit } =
    useProfileForm(user);

  return (
    <div className="space-y-8">
      {/* Banner de perfil público — usa el username del form para preview en tiempo real */}
      <ProfileUrlBanner username={formData.username || user.username} isPublic={formData.isPublicProfile} />

      <AvatarUpload
        userId={user.id}
        currentAvatarUrl={user.avatarUrl}
        fullName={formData.fullName || user.fullName || ''}
      />

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
    </div>
  );
}
