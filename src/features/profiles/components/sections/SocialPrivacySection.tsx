import { FormSection, TextField } from '../FormSection';
import type { ProfileFormData, ProfileUser } from '../../types';

interface Props {
  formData: ProfileFormData;
  user: ProfileUser;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}

export function SocialPrivacySection({ formData, user, onChange }: Props) {
  const username = user.username || 'tu-usuario';
  const profileUrl = `https://www.inmogrid.cl/${username}`;

  return (
    <>
      <FormSection title="🔗 Redes y Sitio Web">
        <div className="space-y-4">
          <TextField
            id="website"
            name="website"
            label="Sitio Web"
            type="url"
            value={formData.website}
            onChange={onChange}
            placeholder="https://ejemplo.cl"
          />
          <TextField
            id="linkedin"
            name="linkedin"
            label="LinkedIn"
            type="url"
            value={formData.linkedin}
            onChange={onChange}
            placeholder="https://linkedin.com/in/tu-perfil"
          />
        </div>
      </FormSection>

      <FormSection title="🔒 Privacidad">
        <div className="space-y-4">
          {/* Toggle de visibilidad */}
          <label
            htmlFor="isPublicProfile"
            className="flex items-start gap-3 cursor-pointer group"
          >
            <div className="mt-0.5">
              <input
                id="isPublicProfile"
                name="isPublicProfile"
                type="checkbox"
                checked={formData.isPublicProfile}
                onChange={onChange}
                className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-400"
              />
            </div>
            <div>
              <span className="font-medium text-gray-700 group-hover:text-gray-900">
                Perfil público
              </span>
              <p className="text-sm text-gray-500 mt-0.5">
                {formData.isPublicProfile
                  ? 'Tu perfil es visible para cualquier persona con el enlace.'
                  : 'Tu perfil está oculto. Solo tú puedes verlo mientras estés conectado.'}
              </p>
            </div>
          </label>

          {/* URL del perfil — siempre visible para que el usuario sepa la URL */}
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
            <p className="text-xs font-medium text-gray-500 mb-1">URL de tu perfil</p>
            <div className="flex items-center gap-2">
              {formData.isPublicProfile ? (
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-yellow-700 hover:underline truncate"
                >
                  {profileUrl}
                </a>
              ) : (
                <span className="font-mono text-sm text-gray-400 truncate line-through">
                  {profileUrl}
                </span>
              )}
            </div>
            {!formData.isPublicProfile && (
              <p className="mt-1 text-xs text-gray-400">
                Activa el perfil público para que esta URL sea accesible.
              </p>
            )}
          </div>
        </div>
      </FormSection>
    </>
  );
}
