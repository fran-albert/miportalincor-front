import React from "react";
import { Neurologico } from "@/store/Pre-Occupational/preOccupationalSlice";
import {
  BooleanChoiceField,
  ClinicalBlock,
  NotesField,
} from "../FormPrimitives";

interface NeurologicoSectionProps {
  isEditing: boolean;
  data: Neurologico;
  onChange: (field: keyof Neurologico, value: boolean | string | undefined) => void;
  onBatchChange?: (updates: Partial<Neurologico>) => void;
}

export const NeurologicoSection: React.FC<NeurologicoSectionProps> = ({
  isEditing,
  data,
  onChange,
  onBatchChange,
}) => {
  const handleSinAlteracionesChange = (checked: boolean) => {
    if (checked && onBatchChange) {
      onBatchChange({ sinAlteraciones: true, observaciones: '' });
    } else {
      onChange('sinAlteraciones', checked);
    }
  };

  const handleObservacionesChange = (value: string) => {
    if (value.trim() && data.sinAlteraciones && onBatchChange) {
      onBatchChange({ sinAlteraciones: false, observaciones: value });
    } else {
      onChange('observaciones', value);
    }
  };

  const obsDisabled = !isEditing || data.sinAlteraciones;
  const sinAlteracionesValue =
    data.sinAlteraciones === true ? "si" : data.sinAlteraciones === false ? "no" : "";

  return (
    <div className="space-y-4">
      <ClinicalBlock
        title="Estado neurológico"
        description="Marcá si el examen está sin alteraciones o si requiere detallar hallazgos."
      >
        <BooleanChoiceField
          idPrefix="neu-sin"
          label="Resultado"
          value={
            sinAlteracionesValue === "si"
              ? true
              : sinAlteracionesValue === "no"
                ? false
                : undefined
          }
          disabled={!isEditing}
          positiveLabel="Sin alteraciones"
          negativeLabel="Con hallazgos"
          onChange={(value) => handleSinAlteracionesChange(value === true)}
        />
        <NotesField
          id="neu-obs"
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
