import { FormSection, TextField, SelectField } from '../FormSection';
import { PROFESSION_OPTIONS, REGIONES } from '../../lib/constants';
import type { ProfileFormData } from '../../types';

interface Props {
  formData: ProfileFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}

const REGION_OPTIONS = [
  { value: '', label: 'Selecciona una región' },
  ...REGIONES.map((r) => ({ value: r, label: r })),
];

export function ProfessionalSection({ formData, onChange }: Props) {
  return (
    <>
      <FormSection title="💼 Información Profesional">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            id="profession"
            name="profession"
            label="Profesión"
            value={formData.profession}
            onChange={onChange}
            options={PROFESSION_OPTIONS}
          />
          <TextField
            id="company"
            name="company"
            label="Empresa / Organización"
            value={formData.company}
            onChange={onChange}
            maxLength={100}
            placeholder="Ej: Degux SpA"
          />
        </div>
      </FormSection>

      <FormSection title="📍 Contacto y Ubicación">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            id="phone"
            name="phone"
            label="Teléfono"
            type="tel"
            value={formData.phone}
            onChange={onChange}
            maxLength={20}
            placeholder="+56 9 1234 5678"
          />
          <TextField
            id="location"
            name="location"
            label="Ubicación (texto libre)"
            value={formData.location}
            onChange={onChange}
            maxLength={100}
            placeholder="Ej: Santiago, Chile"
          />
          <SelectField
            id="region"
            name="region"
            label="Región"
            value={formData.region}
            onChange={onChange}
            options={REGION_OPTIONS}
          />
          <TextField
            id="commune"
            name="commune"
            label="Comuna"
            value={formData.commune}
            onChange={onChange}
            maxLength={100}
            placeholder="Ej: Santiago, Providencia, Las Condes..."
          />
        </div>
      </FormSection>
    </>
  );
}
