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
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="isPublicProfile"
              name="isPublicProfile"
              type="checkbox"
              checked={formData.isPublicProfile}
              onChange={onChange}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="isPublicProfile" className="font-medium text-gray-700">
              Perfil público
            </label>
            <p className="text-sm text-gray-500">
              Permite que otros usuarios vean tu perfil en{' '}
              <code className="bg-gray-100 px-1 rounded">
                /{user.username || 'tu-usuario'}
              </code>
              . Si desactivas esto, solo tú podrás ver tu perfil.
            </p>
          </div>
        </div>
      </FormSection>
    </>
  );
}
