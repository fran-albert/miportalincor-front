import React from "react";
import { Input } from "@/components/ui/input";
import { Circulatorio } from "@/store/Pre-Occupational/preOccupationalSlice";
import {
  BooleanChoiceField,
  ClinicalBlock,
  NotesField,
} from "../FormPrimitives";

interface CirculatorioSectionProps {
  isEditing: boolean;
  data: Circulatorio;
  onChange: (
    field: keyof Circulatorio,
    value: boolean | string | undefined
  ) => void;
  onBatchChange?: (updates: Partial<Circulatorio>) => void;
}

export const CirculatorioSection: React.FC<CirculatorioSectionProps> = ({
  isEditing,
  data,
  onChange,
  onBatchChange,
}) => {
  const handleSinAlteracionesChange = (checked: boolean) => {
    if (checked && onBatchChange) {
      onBatchChange({
        sinAlteraciones: true,
        observaciones: '',
        varices: false,
        varicesObs: '',
      });
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

  const handleVaricesChange = (value: boolean | undefined) => {
    if (value === true && data.sinAlteraciones && onBatchChange) {
      onBatchChange({ sinAlteraciones: false, varices: true });
    } else {
      onChange("varices", value);
    }
  };

  const handleVaricesObsChange = (value: string) => {
    if (value.trim() && data.sinAlteraciones && onBatchChange) {
      onBatchChange({ sinAlteraciones: false, varicesObs: value });
    } else {
      onChange("varicesObs", value);
    }
  };

  // Solo las observaciones se deshabilitan, los checkboxes Sí/No siempre habilitados
  const obsDisabled = !isEditing || data.sinAlteraciones;
  const sinAlteracionesValue =
    data.sinAlteraciones === true ? "si" : data.sinAlteraciones === false ? "no" : "";
  const varicesValue =
    data.varices === true ? "si" : data.varices === false ? "no" : "";

  return (
    <div className="space-y-4">
      <ClinicalBlock
        title="Signos y mediciones"
        description="Registrá los valores básicos antes de completar el estado clínico."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="circ-frecuencia"
              className="text-sm font-medium text-slate-700"
            >
              Frecuencia cardíaca
            </label>
            <Input
              id="circ-frecuencia"
              className="w-full bg-white"
              value={data.frecuenciaCardiaca}
              disabled={!isEditing}
              onChange={(e) =>
                onChange("frecuenciaCardiaca", e.currentTarget.value)
              }
              placeholder="100 x minuto"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="circ-presion"
              className="text-sm font-medium text-slate-700"
            >
              Tensión arterial
            </label>
            <Input
              id="circ-presion"
              className="w-full bg-white"
              value={data.presion}
              disabled={!isEditing}
              onChange={(e) => onChange("presion", e.currentTarget.value)}
              placeholder="112/89"
            />
          </div>
        </div>
      </ClinicalBlock>

      <ClinicalBlock
        title="Estado general"
        description="Definí si el sistema circulatorio está sin alteraciones o si requiere observaciones."
      >
        <BooleanChoiceField
          idPrefix="circ-sinalt"
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
          id="circ-observaciones"
          label="Observaciones generales"
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

      <ClinicalBlock title="Varices">
        <BooleanChoiceField
          idPrefix="circ-varices"
          label="Presencia"
          value={
            varicesValue === "si"
              ? true
              : varicesValue === "no"
                ? false
                : undefined
          }
          disabled={!isEditing}
          onChange={handleVaricesChange}
        />
        <NotesField
          id="circ-varices-obs"
          label="Observaciones"
          value={data.varicesObs || ""}
          disabled={obsDisabled}
          onChange={handleVaricesObsChange}
          placeholder="Detalle clínico o aclaraciones"
        />
      </ClinicalBlock>
    </div>
  );
};
