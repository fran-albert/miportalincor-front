import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gastrointestinal } from "@/store/Pre-Occupational/preOccupationalSlice";

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
  // Si marca "Sin alteraciones", limpiar todo (poner undefined, no false)
  const handleSinAlteracionesChange = (checked: boolean) => {
    if (checked && onBatchChange) {
      onBatchChange({
        sinAlteraciones: true,
        observaciones: '',
        cicatrices: undefined,
        cicatricesObs: '',
        hernias: undefined,
        herniasObs: '',
        eventraciones: undefined,
        eventracionesObs: '',
        hemorroides: undefined,
        hemorroidesObs: '',
      });
    } else {
      onChange("sinAlteraciones", checked);
    }
  };

  // Si marca "Sí" en algún campo, desmarcar "Sin alteraciones" (poner undefined, no false)
  const handleFieldChange = (field: keyof Gastrointestinal, value: boolean | undefined) => {
    if (value === true && data.sinAlteraciones && onBatchChange) {
      onBatchChange({
        sinAlteraciones: undefined,
        [field]: true,
      });
    } else {
      onChange(field, value);
    }
  };

  // Si escribe observaciones, desmarcar "Sin alteraciones" (poner undefined, no false)
  const handleObsChange = (field: keyof Gastrointestinal, value: string) => {
    if (value.trim() && data.sinAlteraciones && onBatchChange) {
      onBatchChange({
        sinAlteraciones: undefined,
        [field]: value,
      });
    } else {
      onChange(field, value);
    }
  };

  // Solo las observaciones se deshabilitan, los checkboxes Sí/No siempre habilitados
  const obsDisabled = !isEditing || data.sinAlteraciones;

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-base text-greenPrimary">
        Aparato Gastrointestinal
      </h4>

      {/* Sin alteraciones */}
      <div className="flex items-center space-x-2 text-black">
        <Checkbox
          id="gi-sin"
          checked={data.sinAlteraciones}
          disabled={!isEditing}
          onCheckedChange={(chk) => handleSinAlteracionesChange(chk === true)}
        />
        <Label htmlFor="gi-sin">Sin alteraciones</Label>
      </div>

      {/* Observaciones generales */}
      <Input
        id="gi-obs"
        className="w-full text-black"
        value={data.observaciones}
        disabled={obsDisabled}
        onChange={(e) => handleObsChange("observaciones", e.currentTarget.value)}
        placeholder={data.sinAlteraciones ? "Sin observaciones (sin alteraciones)" : "Observaciones…"}
      />

      {/* Cicatrices - checkboxes siempre habilitados */}
      <div className="flex items-center space-x-2 text-black">
        <Label>Cicatrices:</Label>
        <Checkbox
          id="gi-cic-si"
          checked={data.cicatrices === true}
          disabled={!isEditing}
          onCheckedChange={(chk) =>
            handleFieldChange("cicatrices", chk ? true : undefined)
          }
        />
        <Label htmlFor="gi-cic-si">Sí</Label>
        <Checkbox
          id="gi-cic-no"
          checked={data.cicatrices === false}
          disabled={!isEditing}
          onCheckedChange={(chk) =>
            onChange("cicatrices", chk ? false : undefined)
          }
        />
        <Label htmlFor="gi-cic-no">No</Label>
        <Input
          id="gi-cic-obs"
          className="flex-1 ml-4"
          value={data.cicatricesObs}
          disabled={obsDisabled}
          onChange={(e) => handleObsChange("cicatricesObs", e.currentTarget.value)}
          placeholder={data.sinAlteraciones ? "Sin observaciones" : "Observaciones…"}
        />
      </div>

      {/* Hernias - checkboxes siempre habilitados */}
      <div className="flex items-center space-x-2 text-black">
        <Label>Hernias:</Label>
        <Checkbox
          id="gi-her-si"
          disabled={!isEditing}
          checked={data.hernias === true}
          onCheckedChange={(chk) => handleFieldChange("hernias", chk ? true : undefined)}
        />
        <Label htmlFor="gi-her-si">Sí</Label>
        <Checkbox
          id="gi-her-no"
          disabled={!isEditing}
          checked={data.hernias === false}
          onCheckedChange={(chk) => onChange("hernias", chk ? false : undefined)}
        />
        <Label htmlFor="gi-her-no">No</Label>
        <Input
          id="gi-her-obs"
          className="flex-1 ml-4"
          value={data.herniasObs}
          disabled={obsDisabled}
          onChange={(e) => handleObsChange("herniasObs", e.currentTarget.value)}
          placeholder={data.sinAlteraciones ? "Sin observaciones" : "Observaciones…"}
        />
      </div>

      {/* Eventraciones - checkboxes siempre habilitados */}
      <div className="flex items-center space-x-2 text-black">
        <Label>Eventraciones:</Label>
        <Checkbox
          id="gi-event-si"
          checked={data.eventraciones === true}
          disabled={!isEditing}
          onCheckedChange={(chk) =>
            handleFieldChange("eventraciones", chk ? true : undefined)
          }
        />
        <Label htmlFor="gi-event-si">Sí</Label>
        <Checkbox
          id="gi-event-no"
          checked={data.eventraciones === false}
          disabled={!isEditing}
          onCheckedChange={(chk) =>
            onChange("eventraciones", chk ? false : undefined)
          }
        />
        <Label htmlFor="gi-event-no">No</Label>
        <Input
          id="gi-event-obs"
          className="flex-1 ml-4"
          value={data.eventracionesObs}
          disabled={obsDisabled}
          onChange={(e) => handleObsChange("eventracionesObs", e.currentTarget.value)}
          placeholder={data.sinAlteraciones ? "Sin observaciones" : "Observaciones…"}
        />
      </div>

      {/* Hemorroides - checkboxes siempre habilitados */}
      <div className="flex items-center space-x-2 text-black">
        <Label>Hemorroides:</Label>
        <Checkbox
          id="gi-hemo-si"
          checked={data.hemorroides === true}
          disabled={!isEditing}
          onCheckedChange={(chk) =>
            handleFieldChange("hemorroides", chk ? true : undefined)
          }
        />
        <Label htmlFor="gi-hemo-si">Sí</Label>
        <Checkbox
          id="gi-hemo-no"
          checked={data.hemorroides === false}
          disabled={!isEditing}
          onCheckedChange={(chk) =>
            onChange("hemorroides", chk ? false : undefined)
          }
        />
        <Label htmlFor="gi-hemo-no">No</Label>
        <Input
          id="gi-hemo-obs"
          className="flex-1 ml-4"
          value={data.hemorroidesObs}
          disabled={obsDisabled}
          onChange={(e) => handleObsChange("hemorroidesObs", e.currentTarget.value)}
          placeholder={data.sinAlteraciones ? "Sin observaciones" : "Observaciones…"}
        />
      </div>
    </div>
  );
};
