import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Circulatorio } from "@/store/Pre-Occupational/preOccupationalSlice";

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

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-base text-greenPrimary">
        Aparato Circulatorio
      </h4>

      {/* Frecuencia / TA / Sin alteraciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-black">
        {/* Frecuencia Cardíaca */}
        <div className="flex items-center space-x-2">
          <Label htmlFor="circ-frecuencia">Frecuencia Cardíaca</Label>
          <Input
            id="circ-frecuencia"
            className="w-20"
            value={data.frecuenciaCardiaca}
            disabled={!isEditing}
            onChange={(e) =>
              onChange("frecuenciaCardiaca", e.currentTarget.value)
            }
            placeholder="100"
          />
          <span>x minuto</span>
        </div>

        {/* Tensión Arterial */}
        <div className="flex items-center space-x-2 text-black">
          <Label htmlFor="circ-presion">TA</Label>
          <Input
            id="circ-presion"
            className="w-24"
            value={data.presion}
            disabled={!isEditing}
            onChange={(e) => onChange("presion", e.currentTarget.value)}
            placeholder="112/89"
          />
          <span>mmHg</span>
        </div>

        {/* Sin alteraciones */}
        <div className="flex items-center space-x-2 text-black">
          <Checkbox
            id="circ-sinalt"
            checked={data.sinAlteraciones}
            disabled={!isEditing}
            onCheckedChange={(chk) => handleSinAlteracionesChange(chk === true)}
          />
          <Label htmlFor="circ-sinalt">Sin alteraciones</Label>
        </div>
      </div>

      {/* Observaciones */}
      <div className="space-y-2 text-black">
        <Input
          id="circ-observaciones"
          className="w-full"
          value={data.observaciones}
          disabled={obsDisabled}
          onChange={(e) => handleObservacionesChange(e.currentTarget.value)}
          placeholder={data.sinAlteraciones ? "Sin observaciones (sin alteraciones)" : "Escribe aquí…"}
        />
      </div>

      {/* Várices - checkboxes siempre habilitados, solo obs se deshabilita */}
      <div className="flex items-center space-x-2 text-black">
        <Label>Várices:</Label>
        <Checkbox
          id="circ-varices-si"
          checked={data.varices === true}
          disabled={!isEditing}
          onCheckedChange={(chk) => handleVaricesChange(chk ? true : undefined)}
        />
        <Label htmlFor="circ-varices-si">Sí</Label>
        <Checkbox
          id="circ-varices-no"
          checked={data.varices === false}
          disabled={!isEditing}
          onCheckedChange={(chk) => onChange("varices", chk ? false : undefined)}
        />
        <Label htmlFor="circ-varices-no">No</Label>
        <Input
          id="circ-varices-obs"
          className="flex-1 ml-4"
          value={data.varicesObs || ""}
          disabled={obsDisabled}
          onChange={(e) => handleVaricesObsChange(e.currentTarget.value)}
          placeholder={data.sinAlteraciones ? "Sin observaciones" : "Observaciones…"}
        />
      </div>
    </div>
  );
};
