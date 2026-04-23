import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Respiratorio } from "@/store/Pre-Occupational/preOccupationalSlice";

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
      <h4 className="font-bold text-base text-greenPrimary">
        Aparato Respiratorio
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-black">
        {/* Frecuencia Respiratoria */}
        <div className="flex items-center space-x-2">
          <Label htmlFor="resp-frecuencia">Frecuencia Respiratoria</Label>
          <Input
            id="resp-frecuencia"
            className="w-20"
            value={data.frecuenciaRespiratoria}
            disabled={!isEditing}
            onChange={(e) =>
              onChange("frecuenciaRespiratoria", e.currentTarget.value)
            }
            placeholder="15"
          />
          <span>x minuto</span>
        </div>

        {/* Oximetría */}
        <div className="flex items-center space-x-2 text-black">
          <Label htmlFor="resp-oximetria">Oximetría</Label>
          <Input
            id="resp-oximetria"
            className="w-16"
            value={data.oximetria}
            disabled={!isEditing}
            onChange={(e) => onChange("oximetria", e.currentTarget.value)}
            placeholder="98"
          />
          <span>%</span>
        </div>

        {/* Sin alteraciones */}
        <div className="flex items-center space-x-2 text-black">
          <Checkbox
            id="resp-sinalt"
            checked={data.sinAlteraciones}
            disabled={!isEditing}
            onCheckedChange={(chk) => handleSinAlteracionesChange(chk === true)}
          />
          <Label htmlFor="resp-sinalt">Sin alteraciones</Label>
        </div>
      </div>

      {/* Observaciones */}
      <div className="space-y-1 text-black">
        <Textarea
          id="resp-observaciones"
          value={data.observaciones}
          disabled={obsDisabled}
          onChange={(e) => handleObservacionesChange(e.currentTarget.value)}
          placeholder={data.sinAlteraciones ? "Sin observaciones (sin alteraciones)" : "Escribe aquí…"}
        />
      </div>
    </div>
  );
};
