import React from 'react';
import {
  BooleanChoiceField,
  ClinicalBlock,
  NotesField,
} from '../FormPrimitives';

export interface Bucodental {
  sinAlteraciones?: boolean;
  caries?: boolean;
  faltanPiezas?: boolean;
  observaciones: string;
}

interface BucodentalSectionProps {
  isEditing: boolean;
  data: Bucodental;
  onChange: (field: keyof Bucodental, value: boolean | string | undefined) => void;
  onBatchChange?: (updates: Partial<Bucodental>) => void;
}

export const BucodentalSection: React.FC<BucodentalSectionProps> = ({
  isEditing,
  data,
  onChange,
  onBatchChange,
}) => {
  const handleSinAlteracionesChange = (checked: boolean) => {
    if (checked && onBatchChange) {
      onBatchChange({
        sinAlteraciones: true,
        caries: false,
        faltanPiezas: false,
        observaciones: '',
      });
    } else {
      onChange('sinAlteraciones', checked);
    }
  };

  const handleAlteracionChange = (field: 'caries' | 'faltanPiezas', checked: boolean) => {
    if (checked && data.sinAlteraciones && onBatchChange) {
      onBatchChange({
        sinAlteraciones: false,
        [field]: true,
      });
    } else {
      onChange(field, checked);
    }
  };

  const handleObservacionesChange = (value: string) => {
    if (value.trim() && data.sinAlteraciones && onBatchChange) {
      onBatchChange({
        sinAlteraciones: false,
        observaciones: value,
      });
    } else {
      onChange('observaciones', value);
    }
  };

  // Solo las observaciones se deshabilitan, los checkboxes siempre habilitados
  const obsDisabled = !isEditing || data.sinAlteraciones;

  return (
    <div className="space-y-4">
      <ClinicalBlock
        title="Examen bucodental"
        description="Definí si el examen está sin alteraciones y marcá hallazgos específicos cuando corresponda."
      >
        <BooleanChoiceField
          idPrefix="buc-sin"
          label="Estado general"
          value={data.sinAlteraciones}
          disabled={!isEditing}
          positiveLabel="Sin alteraciones"
          negativeLabel="Con hallazgos"
          onChange={(value) => handleSinAlteracionesChange(value === true)}
        />

        <div className="grid gap-3 md:grid-cols-2">
          <BooleanChoiceField
            idPrefix="buc-caries"
            label="Caries"
            value={data.caries}
            disabled={!isEditing}
            onChange={(value) => handleAlteracionChange('caries', value === true)}
          />
          <BooleanChoiceField
            idPrefix="buc-faltan"
            label="Faltan piezas"
            value={data.faltanPiezas}
            disabled={!isEditing}
            onChange={(value) =>
              handleAlteracionChange('faltanPiezas', value === true)
            }
          />
        </div>

        <NotesField
          id="buc-obs"
          label="Observaciones"
          value={data.observaciones}
          disabled={obsDisabled}
          onChange={handleObservacionesChange}
          placeholder={
            data.sinAlteraciones
              ? "Sin observaciones"
              : "Describí los hallazgos observados"
          }
        />
      </ClinicalBlock>
    </div>
  );
};
