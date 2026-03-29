import React from "react";
import {
  BooleanChoiceField,
  ClinicalBlock,
  NotesField,
} from "../FormPrimitives";

export interface CabezaCuello {
  sinAlteraciones?: boolean;
  observaciones: string;
}

interface CabezaCuelloSectionProps {
  isEditing: boolean;
  data: CabezaCuello;
  onChange: (field: keyof CabezaCuello, value: boolean | string | undefined) => void;
  onBatchChange?: (updates: Partial<CabezaCuello>) => void;
}

export const CabezaCuelloSection: React.FC<CabezaCuelloSectionProps> = ({
  isEditing,
  data,
  onChange,
  onBatchChange,
}) => {
  const handleSinAlteracionesChange = (checked: boolean) => {
    if (checked && onBatchChange) {
      onBatchChange({ sinAlteraciones: true, observaciones: '' });
    } else {
      onChange("sinAlteraciones", checked);
    }
  };

  const handleObservacionesChange = (value: string) => {
    if (value.trim() && data.sinAlteraciones && onBatchChange) {
      onBatchChange({ sinAlteraciones: false, observaciones: value });
    } else {
      onChange("observaciones", value);
    }
  };

  const obsDisabled = !isEditing || data.sinAlteraciones;

  return (
    <div className="space-y-4">
      <ClinicalBlock
        title="Cabeza y cuello"
        description="Indicá si el examen está sin alteraciones o registrá los hallazgos relevantes."
      >
        <BooleanChoiceField
          idPrefix="cabeza-sin"
          label="Resultado"
          value={data.sinAlteraciones}
          disabled={!isEditing}
          positiveLabel="Sin alteraciones"
          negativeLabel="Con hallazgos"
          onChange={(value) => handleSinAlteracionesChange(value === true)}
        />
        <NotesField
          id="cabeza-obs"
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
