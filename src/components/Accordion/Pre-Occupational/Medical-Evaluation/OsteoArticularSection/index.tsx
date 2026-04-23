// components/Accordion/Pre-Occupational/Medical-Evaluation/OsteoarticularSection.tsx
import React from "react";
import { Osteoarticular } from "@/store/Pre-Occupational/preOccupationalSlice";
import {
  BooleanChoiceField,
  ClinicalBlock,
  NotesField,
} from "../FormPrimitives";

interface OsteoarticularSectionProps {
  isEditing: boolean;
  data: Osteoarticular;
  onChange: (field: keyof Osteoarticular, value: boolean | string | undefined) => void;
}

export const OsteoarticularSection: React.FC<OsteoarticularSectionProps> = ({
  isEditing,
  data,
  onChange,
}) => {
  const rows = [
    {
      key: "mmssSin" as const,
      label: "MMSS",
      obsKey: "mmssObs" as const,
    },
    {
      key: "mmiiSin" as const,
      label: "MMII",
      obsKey: "mmiiObs" as const,
    },
    {
      key: "columnaSin" as const,
      label: "Columna",
      obsKey: "columnaObs" as const,
    },
    {
      key: "amputaciones" as const,
      label: "Amputaciones",
      obsKey: "amputacionesObs" as const,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 xl:grid-cols-2">
        {rows.map((row) => (
          <ClinicalBlock
            key={row.key}
            title={row.label}
            description="Indicá si está conservado o si hace falta aclarar hallazgos."
          >
            <BooleanChoiceField
              idPrefix={row.key}
              label="Estado"
              value={data[row.key]}
              disabled={!isEditing}
              positiveLabel="Sin alteraciones"
              negativeLabel="Con hallazgos"
              onChange={(value) => onChange(row.key, value)}
            />
            <NotesField
              id={`${row.obsKey}`}
              label="Observaciones"
              value={String(data[row.obsKey] ?? "")}
              disabled={!isEditing}
              onChange={(value) => onChange(row.obsKey, value)}
              placeholder="Detalle clínico o aclaraciones"
            />
          </ClinicalBlock>
        ))}
      </div>
    </div>
  );
};
