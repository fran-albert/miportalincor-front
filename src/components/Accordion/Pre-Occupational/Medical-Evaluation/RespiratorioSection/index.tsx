import React from "react";
import { Input } from "@/components/ui/input";
import { Respiratorio } from "@/store/Pre-Occupational/preOccupationalSlice";
import {
  BooleanChoiceField,
  ClinicalBlock,
  NotesField,
} from "../FormPrimitives";

interface RespiratorioSectionProps {
  isEditing: boolean;
  data: Respiratorio;
  onChange: (field: keyof Respiratorio, value: boolean | string | undefined) => void;
  onBatchChange?: (updates: Partial<Respiratorio>) => void;
}

export const RespiratorioSection: React.FC<RespiratorioSectionProps> = ({
  isEditing,
  data,
  onChange,
  onBatchChange,
}) => {
  // Si marca "Sin alteraciones", limpiar observaciones
  const handleSinAlteracionesChange = (checked: boolean) => {
    if (checked && onBatchChange) {
      onBatchChange({
        sinAlteraciones: true,
        observaciones: '',
      });
    } else {
      onChange("sinAlteraciones", checked);
    }
  };

  const handleObservacionesChange = (value: string) => {
    if (value.trim() && data.sinAlteraciones && onBatchChange) {
      onBatchChange({
        sinAlteraciones: false,
        observaciones: value,
      });
    } else {
      onChange("observaciones", value);
    }
  };

  const obsDisabled = !isEditing || data.sinAlteraciones;

  return (
    <div className="space-y-4">
      <ClinicalBlock
        title="Mediciones"
        description="Registrá la frecuencia respiratoria y la oximetría antes de definir el estado general."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="resp-frecuencia"
              className="text-sm font-medium text-slate-700"
            >
              Frecuencia respiratoria
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="resp-frecuencia"
                className="w-24 bg-white"
                value={data.frecuenciaRespiratoria}
                disabled={!isEditing}
                onChange={(e) =>
                  onChange("frecuenciaRespiratoria", e.currentTarget.value)
                }
                placeholder="15"
              />
              <span className="text-sm text-slate-500">x minuto</span>
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="resp-oximetria"
              className="text-sm font-medium text-slate-700"
            >
              Oximetría
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="resp-oximetria"
                className="w-24 bg-white"
                value={data.oximetria}
                disabled={!isEditing}
                onChange={(e) => onChange("oximetria", e.currentTarget.value)}
                placeholder="98"
              />
              <span className="text-sm text-slate-500">%</span>
            </div>
          </div>
        </div>
      </ClinicalBlock>

      <ClinicalBlock
        title="Estado general"
        description="Definí si el sistema respiratorio está sin alteraciones o si requiere observaciones."
      >
        <BooleanChoiceField
          idPrefix="resp-sinalt"
          label="Resultado"
          value={data.sinAlteraciones}
          disabled={!isEditing}
          positiveLabel="Sin alteraciones"
          negativeLabel="Con hallazgos"
          onChange={(value) => handleSinAlteracionesChange(value === true)}
        />
        <NotesField
          id="resp-observaciones"
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
