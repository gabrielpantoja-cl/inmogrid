import { FormSection, TextField, TextAreaField } from '../FormSection';
import type { ProfileFormData } from '../../types';

interface Props {
  formData: ProfileFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}

export function BasicInfoSection({ formData, onChange }: Props) {
  return (
    <FormSection title="📝 Información Básica">
      <div className="space-y-4">
        <TextField
          id="fullName"
          name="fullName"
          label="Nombre"
          value={formData.fullName}
          onChange={onChange}
          required
          maxLength={100}
          placeholder="Tu nombre completo"
        />
        <TextField
          id="tagline"
          name="tagline"
          label="Tagline (Frase corta)"
          value={formData.tagline}
          onChange={onChange}
          maxLength={100}
          placeholder="Ej: Desarrollador full stack apasionado por PropTech"
          hint="Máximo 100 caracteres. Aparece debajo de tu nombre en el perfil."
        />
        <TextAreaField
          id="bio"
          name="bio"
          label="Biografía"
          value={formData.bio}
          onChange={onChange}
          rows={4}
          maxLength={500}
          placeholder="Cuéntanos sobre ti, tu experiencia, tus intereses..."
          hint={`${formData.bio.length}/500 caracteres`}
        />
      </div>
    </FormSection>
  );
}
