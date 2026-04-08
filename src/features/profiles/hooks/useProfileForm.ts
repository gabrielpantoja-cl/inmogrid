'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProfileUser, ProfileFormData } from '../types';

function initialFormData(user: ProfileUser): ProfileFormData {
  return {
    fullName: user.fullName || '',
    bio: user.bio || '',
    tagline: user.tagline || '',
    profession: user.profession || '',
    company: user.company || '',
    phone: user.phone || '',
    region: user.region || '',
    commune: user.commune || '',
    website: user.website || '',
    linkedin: user.linkedin || '',
    location: user.location || '',
    isPublicProfile: user.isPublicProfile,
  };
}

/**
 * Estado + lógica del formulario de edición de perfil.
 * Maneja: estado local, cambio de campos, diff con valores originales,
 * request PUT a /api/users/profile y mensajes de feedback.
 */
export function useProfileForm(user: ProfileUser) {
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileFormData>(() => initialFormData(user));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Diff: solo enviar campos que cambiaron respecto al user original
      const updateData: Record<string, unknown> = {};
      (Object.entries(formData) as Array<[keyof ProfileFormData, unknown]>).forEach(
        ([key, value]) => {
          const original = user[key as keyof ProfileUser];
          const processed = value === '' ? null : value;
          if (processed !== original) {
            updateData[key] = processed;
          }
        }
      );

      if (Object.keys(updateData).length === 0) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        return;
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar perfil');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return { formData, loading, error, success, handleChange, handleSubmit };
}
