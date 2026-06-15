import React from 'react';
import { Torax } from '@/store/Pre-Occupational/preOccupationalSlice';
import {
  BooleanChoiceField,
  ClinicalBlock,
  NotesField,
} from '../FormPrimitives';

interface ToraxSectionProps {
  isEditing: boolean;
  data: Torax;
  onChange: (field: keyof Torax, value: "si" | "no" | string | undefined) => void;
  onBatchChange?: (updates: Partial<Torax>) => void;
}

export const ToraxSection: React.FC<ToraxSectionProps> = ({
  isEditing,
  data,
  onChange,
  onBatchChange,
}) => {
  // Las observaciones solo tienen sentido cuando el hallazgo está presente ("Si").
  // Si se marca "No" (ausente), se bloquea y se limpia la observación.
  const handlePresenciaChange = (
    field: "deformaciones" | "cicatrices",
    obsField: "deformacionesObs" | "cicatricesObs",
    value: boolean | undefined
  ) => {
    const next = value === true ? "si" : value === false ? "no" : undefined;
    if (value !== true && onBatchChange) {
      onBatchChange({ [field]: next, [obsField]: "" } as Partial<Torax>);
    } else {
      onChange(field, next);
    }
  };

  const deformacionesObsDisabled = !isEditing || data.deformaciones !== "si";
  const cicatricesObsDisabled = !isEditing || data.cicatrices !== "si";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 xl:grid-cols-2">
        <ClinicalBlock
          title="Deformaciones"
          description="Indicá si hay deformaciones torácicas y agregá observaciones si corresponde."
        >
          <BooleanChoiceField
            idPrefix="torax-def"
            label="Presencia"
            value={
              data.deformaciones === "si"
                ? true
                : data.deformaciones === "no"
                  ? false
                  : undefined
            }
            disabled={!isEditing}
            onChange={(value) =>
              handlePresenciaChange("deformaciones", "deformacionesObs", value)
            }
          />
          <NotesField
            id="torax-def-obs"
            label="Observaciones"
            value={data.deformacionesObs}
            disabled={deformacionesObsDisabled}
            onChange={(value) => onChange('deformacionesObs', value)}
            placeholder={
              deformacionesObsDisabled
                ? "Sin observaciones"
                : "Detalle clínico o aclaraciones"
            }
          />
        </ClinicalBlock>

        <ClinicalBlock
          title="Cicatrices"
          description="Indicá si hay cicatrices y agregá observaciones si hace falta."
        >
          <BooleanChoiceField
            idPrefix="torax-cic"
            label="Presencia"
            value={
              data.cicatrices === "si"
                ? true
                : data.cicatrices === "no"
                  ? false
                  : undefined
            }
            disabled={!isEditing}
            onChange={(value) =>
              handlePresenciaChange("cicatrices", "cicatricesObs", value)
            }
          />
          <NotesField
            id="torax-cic-obs"
            label="Observaciones"
            value={data.cicatricesObs}
            disabled={cicatricesObsDisabled}
            onChange={(value) => onChange('cicatricesObs', value)}
            placeholder={
              cicatricesObsDisabled
                ? "Sin observaciones"
                : "Detalle clínico o aclaraciones"
            }
          />
        </ClinicalBlock>
      </div>
    </div>
  );
};
