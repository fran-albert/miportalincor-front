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
  onBatchChange?: (updates: Partial<Osteoarticular>) => void;
}

export const OsteoarticularSection: React.FC<OsteoarticularSectionProps> = ({
  isEditing,
  data,
  onChange,
  onBatchChange,
}) => {
  // El valor que no deja nada para describir bloquea y limpia la observación:
  // "Sin alteraciones" (true) en MMSS, MMII y Columna; "No" (false) en Amputaciones.
  const handleChoiceChange = (
    key: keyof Osteoarticular,
    obsKey: keyof Osteoarticular,
    value: boolean | undefined,
    clearsObsWhen: boolean
  ) => {
    if (value === clearsObsWhen && onBatchChange) {
      onBatchChange({ [key]: value, [obsKey]: "" } as Partial<Osteoarticular>);
    } else {
      onChange(key, value);
    }
  };

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
  ];

  const amputacionesObsDisabled = !isEditing || data.amputaciones !== true;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 xl:grid-cols-2">
        {rows.map((row) => {
          const obsDisabled = !isEditing || data[row.key] === true;
          return (
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
                onChange={(value) =>
                  handleChoiceChange(row.key, row.obsKey, value, true)
                }
              />
              <NotesField
                id={`${row.obsKey}`}
                label="Observaciones"
                value={String(data[row.obsKey] ?? "")}
                disabled={obsDisabled}
                onChange={(value) => onChange(row.obsKey, value)}
                placeholder={
                  obsDisabled
                    ? "Sin observaciones"
                    : "Detalle clínico o aclaraciones"
                }
              />
            </ClinicalBlock>
          );
        })}
        {/* Amputaciones pregunta por presencia: true = tiene amputaciones, como lo imprime el informe. */}
        <ClinicalBlock
          title="Amputaciones"
          description="Indicá si tiene amputaciones y detallalas si hace falta."
        >
          <BooleanChoiceField
            idPrefix="amputaciones"
            label="Presencia"
            value={data.amputaciones}
            disabled={!isEditing}
            onChange={(value) =>
              handleChoiceChange("amputaciones", "amputacionesObs", value, false)
            }
          />
          <NotesField
            id="amputacionesObs"
            label="Observaciones"
            value={data.amputacionesObs ?? ""}
            disabled={amputacionesObsDisabled}
            onChange={(value) => onChange("amputacionesObs", value)}
            placeholder={
              amputacionesObsDisabled
                ? "Sin observaciones"
                : "Detalle clínico o aclaraciones"
            }
          />
        </ClinicalBlock>
      </div>
    </div>
  );
};
