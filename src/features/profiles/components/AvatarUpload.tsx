'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/shared/lib/supabase/client';

/**
 * Componente de subida de avatar.
 *
 * Estrategia: el usuario autenticado hace un upload directo desde el browser
 * a Supabase Storage usando el cliente de Supabase (respetando las RLS
 * policies del bucket). Una vez subida la imagen, la URL pública se envía
 * a PUT /api/users/profile para persistirla en `inmogrid_profiles.avatar_url`.
 *
 * Requisitos de infraestructura:
 *  - Bucket `avatars` en Supabase Storage (ver docs de setup).
 *  - RLS policy que permita a usuarios autenticados escribir dentro de su
 *    carpeta `${userId}/...` y lectura pública (bucket configurado como
 *    "public" para lecturas).
 *
 * El upload es inmediato e independiente del submit del form de edición de
 * perfil — por eso este componente se renderiza fuera del `<form>` normal.
 */

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  fullName: string;
}

const AVATAR_BUCKET = 'avatars';
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export function AvatarUpload({ userId, currentAvatarUrl, fullName }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);

    // Validaciones de cliente (el server también debería validar en un caso más maduro)
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Formato no soportado. Usa PNG, JPG o WebP.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(`La imagen supera los 2 MB (pesa ${(file.size / (1024 * 1024)).toFixed(1)} MB). Comprimila e intentá de nuevo.`);
      return;
    }

    // Vista previa local inmediata mientras sube
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);

    try {
      const supabase = createClient();
      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      // Namespacing por userId para que las RLS puedan restringir por carpeta
      const objectPath = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(objectPath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        throw new Error(
          `No se pudo subir la imagen al storage: ${uploadError.message}. Verifica que el bucket "${AVATAR_BUCKET}" exista y tenga RLS policies correctas.`
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(objectPath);
      const publicUrl = publicUrlData.publicUrl;

      // Persistir la URL en el perfil via API privada
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: publicUrl }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'La imagen se subió pero no pudimos actualizar tu perfil.');
      }

      // Revocar el preview local y usar la URL pública de Supabase
      URL.revokeObjectURL(localPreview);
      setPreviewUrl(publicUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      // Rollback del preview
      URL.revokeObjectURL(localPreview);
      setPreviewUrl(currentAvatarUrl);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const initial = (fullName || 'U').trim().charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 bg-white rounded-xl border border-gray-200">
      {/* Avatar actual / preview */}
      <div className="relative self-start sm:self-center">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={fullName || 'Avatar'}
            width={96}
            height={96}
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
            unoptimized
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-yellow-100 border-2 border-gray-200 flex items-center justify-center text-3xl font-bold text-yellow-700">
            {initial}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-medium">Subiendo…</span>
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="flex-1 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Foto de perfil</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            PNG, JPG o WebP · máximo 2 MB · recomendado al menos 256×256 px
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Subiendo…' : previewUrl ? 'Cambiar foto' : 'Subir foto'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            onChange={handleFileSelect}
            className="sr-only"
            aria-label="Subir foto de perfil"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600" role="alert">❌ {error}</p>
        )}
        {success && (
          <p className="text-xs text-green-600">✅ Foto actualizada</p>
        )}
      </div>
    </div>
  );
}
