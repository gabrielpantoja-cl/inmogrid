'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProfessionType } from '@prisma/client';

interface User {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  image: string | null;
  bio: string | null;
  tagline: string | null;
  profession: ProfessionType | null;
  company: string | null;
  phone: string | null;
  region: string | null;
  commune: string | null;
  website: string | null;
  linkedin: string | null;
  isPublicProfile: boolean;
  location: string | null;
  identityTags: string[];
}

interface ProfileEditFormProps {
  user: User;
}

// Opciones de profesión
const PROFESSION_OPTIONS = [
  { value: '', label: 'Selecciona una opción' },
  { value: 'CORREDOR', label: 'Corredor de Propiedades' },
  { value: 'TASADOR', label: 'Tasador / Perito' },
  { value: 'ARQUITECTO', label: 'Arquitecto' },
  { value: 'CONSTRUCTOR', label: 'Constructor' },
  { value: 'INGENIERO', label: 'Ingeniero' },
  { value: 'INVERSIONISTA', label: 'Inversionista' },
  { value: 'ABOGADO', label: 'Abogado' },
  { value: 'OTRO', label: 'Otro' },
];

// Regiones de Chile
const REGIONES = [
  'Región de Arica y Parinacota',
  'Región de Tarapacá',
  'Región de Antofagasta',
  'Región de Atacama',
  'Región de Coquimbo',
  'Región de Valparaíso',
  'Región Metropolitana',
  'Región del Libertador General Bernardo O\'Higgins',
  'Región del Maule',
  'Región de Ñuble',
  'Región del Biobío',
  'Región de La Araucanía',
  'Región de Los Ríos',
  'Región de Los Lagos',
  'Región de Aysén',
  'Región de Magallanes',
];

export default function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: user.name || '',
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
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Preparar datos para enviar
      const updateData: Record<string, unknown> = {};

      // Solo incluir campos que cambiaron
      Object.entries(formData).forEach(([key, value]) => {
        const originalValue = user[key as keyof User];

        // Convertir strings vacíos a null
        const processedValue = value === '' ? null : value;

        if (processedValue !== originalValue) {
          updateData[key] = processedValue;
        }
      });

      // Si no hay cambios, no hacer nada
      if (Object.keys(updateData).length === 0) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar perfil');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        // Recargar la página para reflejar cambios
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Mensajes de estado */}
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

      {/* Sección: Información Básica */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          📝 Información Básica
        </h2>

        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Tu nombre completo"
            />
          </div>

          {/* Tagline */}
          <div>
            <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-1">
              Tagline (Frase corta)
            </label>
            <input
              type="text"
              id="tagline"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ej: Desarrollador full stack apasionado por PropTech"
            />
            <p className="mt-1 text-xs text-gray-500">
              Máximo 100 caracteres. Aparece debajo de tu nombre en el perfil.
            </p>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Biografía
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Cuéntanos sobre ti, tu experiencia, tus intereses..."
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.bio.length}/500 caracteres
            </p>
          </div>
        </div>
      </div>

      {/* Sección: Información Profesional */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          💼 Información Profesional
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Profesión */}
          <div>
            <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
              Profesión
            </label>
            <select
              id="profession"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {PROFESSION_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Empresa */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Empresa / Organización
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ej: Degux SpA"
            />
          </div>
        </div>
      </div>

      {/* Sección: Contacto y Ubicación */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          📍 Contacto y Ubicación
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Teléfono */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              maxLength={20}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+56 9 1234 5678"
            />
          </div>

          {/* Ubicación */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación (texto libre)
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ej: Santiago, Chile"
            />
          </div>

          {/* Región */}
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
              Región
            </label>
            <select
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Selecciona una región</option>
              {REGIONES.map(region => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* Comuna */}
          <div>
            <label htmlFor="commune" className="block text-sm font-medium text-gray-700 mb-1">
              Comuna
            </label>
            <input
              type="text"
              id="commune"
              name="commune"
              value={formData.commune}
              onChange={handleChange}
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ej: Santiago, Providencia, Las Condes..."
            />
          </div>
        </div>
      </div>

      {/* Sección: Redes Sociales */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          🔗 Redes y Sitio Web
        </h2>

        <div className="space-y-4">
          {/* Sitio Web */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
              Sitio Web
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://ejemplo.cl"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn
            </label>
            <input
              type="url"
              id="linkedin"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://linkedin.com/in/tu-perfil"
            />
          </div>
        </div>
      </div>

      {/* Sección: Privacidad */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          🔒 Privacidad
        </h2>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="isPublicProfile"
              name="isPublicProfile"
              type="checkbox"
              checked={formData.isPublicProfile}
              onChange={handleChange}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="isPublicProfile" className="font-medium text-gray-700">
              Perfil público
            </label>
            <p className="text-sm text-gray-500">
              Permite que otros usuarios vean tu perfil en{' '}
              <code className="bg-gray-100 px-1 rounded">/{user.username || 'tu-usuario'}</code>.
              Si desactivas esto, solo tú podrás ver tu perfil.
            </p>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
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

      {/* Información de la cuenta (solo lectura) */}
      <div className="rounded-xl bg-gray-50 p-6 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          📧 Información de la Cuenta (solo lectura)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Email:</span>{' '}
            <span className="font-medium text-gray-900">{user.email}</span>
          </div>
          <div>
            <span className="text-gray-500">Username:</span>{' '}
            <span className="font-medium text-gray-900">{user.username || 'No asignado'}</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          El email y username no se pueden cambiar desde esta página.
        </p>
      </div>
    </form>
  );
}
