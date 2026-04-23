import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Genitourinario } from "@/store/Pre-Occupational/preOccupationalSlice";

interface GenitourinarioSectionProps {
  isEditing: boolean;
  data: Genitourinario;
  onChange: (
    field: keyof Genitourinario,
    value: boolean | string | undefined
  ) => void;
  onBatchChange?: (updates: Partial<Genitourinario>) => void;
}

export const GenitourinarioSection: React.FC<GenitourinarioSectionProps> = ({
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
        varicocele: false,
        varicoceleObs: '',
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

  const handleVaricoceleChange = (value: boolean | undefined) => {
    if (value === true && data.sinAlteraciones && onBatchChange) {
      onBatchChange({ sinAlteraciones: false, varicocele: true });
    } else {
      onChange("varicocele", value);
    }
  };

  const handleVaricoceleObsChange = (value: string) => {
    if (value.trim() && data.sinAlteraciones && onBatchChange) {
      onBatchChange({ sinAlteraciones: false, varicoceleObs: value });
    } else {
      onChange("varicoceleObs", value);
    }
  };

  // Solo las observaciones se deshabilitan, los checkboxes Sí/No siempre habilitados
  const obsDisabled = !isEditing || data.sinAlteraciones;

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-base text-greenPrimary">
        Aparato Genitourinario
      </h4>

      {/* Sin alteraciones */}
      <div className="flex items-center space-x-2 text-black">
        <Checkbox
          id="gen-sin"
          checked={data.sinAlteraciones === true}
          disabled={!isEditing}
          onCheckedChange={(chk) => handleSinAlteracionesChange(chk === true)}
        />
        <Label htmlFor="gen-sin">Sin alteraciones</Label>
      </div>

      {/* Observaciones generales */}
      <Input
        id="gen-obs"
        className="w-full text-black"
        value={data.observaciones}
        disabled={obsDisabled}
        onChange={(e) => handleObservacionesChange(e.currentTarget.value)}
        placeholder={data.sinAlteraciones ? "Sin observaciones (sin alteraciones)" : "Observaciones…"}
      />

      {/* Varicocele - checkboxes siempre habilitados */}
      <div className="flex items-center space-x-2 text-black">
        <Label>Varicocele:</Label>
        <Checkbox
          id="gen-varicocele-si"
          checked={data.varicocele === true}
          disabled={!isEditing}
          onCheckedChange={(chk) => handleVaricoceleChange(chk ? true : undefined)}
        />
        <Label htmlFor="gen-varicocele-si">Sí</Label>
        <Checkbox
          id="gen-varicocele-no"
          checked={data.varicocele === false}
          disabled={!isEditing}
          onCheckedChange={(chk) => onChange("varicocele", chk ? false : undefined)}
        />
        <Label htmlFor="gen-varicocele-no">No</Label>

        {/* Observaciones varicocele */}
        <Input
          id="gen-varicocele-obs"
          className="flex-1 ml-4"
          value={data.varicoceleObs}
          disabled={obsDisabled}
          onChange={(e) => handleVaricoceleObsChange(e.currentTarget.value)}
          placeholder={data.sinAlteraciones ? "Sin observaciones" : "Observaciones…"}
        />
      </div>

      {/* F.U.M | Partos */}
      {/* Embarazos | Cesárea */}
      <div className="grid grid-cols-[max-content,1fr,max-content,1fr] gap-x-6 gap-y-4 items-center text-black">
        {/* Row 1 */}
        <Label htmlFor="gen-fum" className="text-right">
          F.U.M
        </Label>
        <Input
          id="gen-fum"
          type="date"
          className="w-full"
          value={data.fum}
          disabled={!isEditing}
          onChange={(e) => onChange("fum", e.currentTarget.value)}
        />
        <Label htmlFor="gen-partos" className="text-right">
          Partos
        </Label>
        <Input
          id="gen-partos"
          type="text"
          className="w-full"
          value={data.partos}
          disabled={!isEditing}
          onChange={(e) => onChange("partos", e.currentTarget.value)}
          placeholder="Observaciones..."
        />

        {/* Row 2 */}
        <Label htmlFor="gen-embarazos" className="text-right">
          Embarazos
        </Label>
        <Input
          id="gen-embarazos"
          type="text"
          className="w-full"
          value={data.embarazos}
          disabled={!isEditing}
          onChange={(e) => onChange("embarazos", e.currentTarget.value)}
          placeholder="Observaciones..."
        />
        <Label htmlFor="gen-cesarea" className="text-right">
          Cesárea
        </Label>
        <Input
          id="gen-cesarea"
          type="text"
          className="w-full"
          value={data.cesarea}
          disabled={!isEditing}
          onChange={(e) => onChange("cesarea", e.currentTarget.value)}
          placeholder="Observaciones..."
        />
      </div>
    </div>
  );
};
