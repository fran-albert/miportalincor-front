// src/components/PielSection.tsx
import React from "react";
import {
  BooleanChoiceField,
  ClinicalBlock,
  NotesField,
} from "../FormPrimitives";

export interface Piel {
  normocoloreada?: "si" | "no";
  tatuajes?: "si" | "no";
  observaciones: string;
}

interface PielSectionProps {
  isEditing: boolean;
  data: Piel;
  onChange?: (field: keyof Piel, value: "si" | "no" | string | undefined) => void;
}

export const PielSection: React.FC<PielSectionProps> = ({
  isEditing,
  data,
  onChange = () => {},
}) => {
  // En modo view (!isEditing), no mostrar si no hay datos
  const hasData = data.normocoloreada !== undefined ||
    data.tatuajes !== undefined ||
    data.observaciones?.trim();

  if (!isEditing && !hasData) return null;

  return (
    <div className="space-y-4">
      <ClinicalBlock
        title="Piel"
        description="Marcá los hallazgos relevantes y agregá observaciones solo si aportan contexto clínico."
      >
        {(isEditing || data.normocoloreada !== undefined) && (
          <BooleanChoiceField
            idPrefix="piel-normo"
            label="Normocoloreada"
            value={
              data.normocoloreada === "si"
                ? true
                : data.normocoloreada === "no"
                  ? false
                  : undefined
            }
            disabled={!isEditing}
            onChange={(value) =>
              onChange(
                "normocoloreada",
                value === true ? "si" : value === false ? "no" : undefined
              )
            }
          />
        )}

        {(isEditing || data.tatuajes !== undefined) && (
          <BooleanChoiceField
            idPrefix="piel-tatuajes"
            label="Tatuajes"
            value={
              data.tatuajes === "si"
                ? true
                : data.tatuajes === "no"
                  ? false
                  : undefined
            }
            disabled={!isEditing}
            onChange={(value) =>
              onChange(
                "tatuajes",
                value === true ? "si" : value === false ? "no" : undefined
              )
            }
          />
        )}

        {(isEditing || data.observaciones?.trim()) && (
          <NotesField
            id="piel-obs"
            label="Observaciones"
            value={data.observaciones}
            disabled={!isEditing}
            onChange={(value) => onChange("observaciones", value)}
            placeholder="Detalle clínico o aclaraciones"
          />
        )}
      </ClinicalBlock>
    </div>
  );
};
