import React from "react";
import { Gastrointestinal } from "@/store/Pre-Occupational/preOccupationalSlice";
import {
  BooleanChoiceField,
  ClinicalBlock,
  NotesField,
} from "../FormPrimitives";

interface GastrointestinalSectionProps {
  isEditing: boolean;
  data: Gastrointestinal;
  onChange: (
    field: keyof Gastrointestinal,
    value: boolean | string | undefined
  ) => void;
  onBatchChange?: (updates: Partial<Gastrointestinal>) => void;
}

export const GastrointestinalSection: React.FC<
  GastrointestinalSectionProps
> = ({ isEditing, data, onChange, onBatchChange }) => {
  const handleSinAlteracionesChange = (checked: boolean) => {
    if (checked && onBatchChange) {
      onBatchChange({
        sinAlteraciones: true,
        observaciones: '',
        cicatrices: false,
        cicatricesObs: '',
        hernias: false,
        herniasObs: '',
        eventraciones: false,
        eventracionesObs: '',
        hemorroides: false,
        hemorroidesObs: '',
      });
    } else {
      onChange("sinAlteraciones", checked);
    }
  };

  const handleFieldChange = (field: keyof Gastrointestinal, value: boolean | undefined) => {
    if (value === true && data.sinAlteraciones && onBatchChange) {
      onBatchChange({
        sinAlteraciones: false,
        [field]: true,
      });
    } else {
      onChange(field, value);
    }
  };

  const handleObsChange = (field: keyof Gastrointestinal, value: string) => {
    if (value.trim() && data.sinAlteraciones && onBatchChange) {
      onBatchChange({
        sinAlteraciones: false,
        [field]: value,
      });
    } else {
      onChange(field, value);
    }
  };

  // Solo las observaciones se deshabilitan, los checkboxes Sí/No siempre habilitados
  const obsDisabled = !isEditing || data.sinAlteraciones;
  const sinAlteracionesValue =
    data.sinAlteraciones === true ? "si" : data.sinAlteraciones === false ? "no" : "";
  const findingValue = (value?: boolean) =>
    value === true ? "si" : value === false ? "no" : "";
  const findings = [
    {
      key: "cicatrices" as const,
      label: "Cicatrices",
      obsKey: "cicatricesObs" as const,
    },
    {
      key: "hernias" as const,
      label: "Hernias",
      obsKey: "herniasObs" as const,
    },
    {
      key: "eventraciones" as const,
      label: "Eventraciones",
      obsKey: "eventracionesObs" as const,
    },
    {
      key: "hemorroides" as const,
      label: "Hemorroides",
      obsKey: "hemorroidesObs" as const,
    },
  ];

  return (
    <div className="space-y-4">
      <ClinicalBlock
        title="Estado general"
        description="Definí si el sistema gastrointestinal está sin alteraciones o si necesitás detallar hallazgos."
      >
        <BooleanChoiceField
          idPrefix="gi-sin"
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
          id="gi-obs"
          label="Observaciones generales"
          value={data.observaciones}
          disabled={obsDisabled}
          onChange={(value) => handleObsChange("observaciones", value)}
          placeholder={
            data.sinAlteraciones
              ? "Sin observaciones"
              : "Describí los hallazgos observados"
          }
        />
      </ClinicalBlock>

      <div className="grid gap-3 xl:grid-cols-2">
        {findings.map((finding) => (
          <ClinicalBlock
            key={finding.key}
            title={finding.label}
            description="Indicá si está presente y agregá observaciones si hace falta."
          >
            <BooleanChoiceField
              idPrefix={`gi-${finding.key}`}
              label="Presencia"
              value={
                findingValue(data[finding.key] as boolean | undefined) === "si"
                  ? true
                  : findingValue(data[finding.key] as boolean | undefined) ===
                      "no"
                    ? false
                    : undefined
              }
              disabled={!isEditing}
              onChange={(value) => handleFieldChange(finding.key, value)}
            />
            <NotesField
              id={`gi-${finding.obsKey}`}
              value={String(data[finding.obsKey] ?? "")}
              label="Observaciones"
              disabled={obsDisabled}
              onChange={(value) => handleObsChange(finding.obsKey, value)}
              placeholder="Detalle clínico o aclaraciones"
            />
          </ClinicalBlock>
        ))}
      </div>
    </div>
  );
};
