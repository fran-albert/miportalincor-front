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
}

export const GenitourinarioSection: React.FC<GenitourinarioSectionProps> = ({
  isEditing,
  data,
  onChange,
}) => (
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
        onCheckedChange={(chk) =>
          onChange("sinAlteraciones", chk ? true : false)
        }
      />
      <Label htmlFor="gen-sin">Sin alteraciones</Label>
    </div>

    {/* Observaciones generales */}
    <Input
      id="gen-obs"
      className="w-full text-black"
      value={data.observaciones}
      disabled={!isEditing}
      onChange={(e) => onChange("observaciones", e.currentTarget.value)}
      placeholder="Observaciones…"
    />

    {/* Varicocele */}
    <div className="flex items-center space-x-2 text-black">
      <Label>Varicocele:</Label>
      <Checkbox
        id="gen-varicocele-si"
        checked={data.varicocele === true}
        disabled={!isEditing}
        onCheckedChange={(chk) =>
          onChange("varicocele", chk ? true : undefined)
        }
      />
      <Label htmlFor="gen-varicocele-si">Sí</Label>
      <Checkbox
        id="gen-varicocele-no"
        checked={data.varicocele === false}
        disabled={!isEditing}
        onCheckedChange={(chk) =>
          onChange("varicocele", chk ? false : undefined)
        }
      />
      <Label htmlFor="gen-varicocele-no">No</Label>

      {/* Observaciones varicocele */}
      <Input
        id="gen-varicocele-obs"
        className="flex-1 ml-4"
        value={data.varicoceleObs}
        disabled={!isEditing}
        onChange={(e) => onChange("varicoceleObs", e.currentTarget.value)}
        placeholder="Observaciones…"
      />
    </div>
    <div className="flex items-center space-x-6 text-black">
      {/* Fecha F.U.M */}
      <div className="flex items-center space-x-2">
        <Label htmlFor="gen-fum">F.U.M</Label>
        <Input
          id="gen-fum"
          type="date"
          value={data.fum}
          disabled={!isEditing}
          onChange={(e) => onChange("fum", e.currentTarget.value)}
        />
      </div>

      {/* Embarazos */}
      <div className="flex items-center space-x-2">
        <Label htmlFor="gen-embarazos">Embarazos</Label>
        <Input
          id="gen-embarazos"
          type="number"
          min="0"
          value={data.embarazos}
          disabled={!isEditing}
          onChange={(e) => onChange("embarazos", e.currentTarget.value)}
          placeholder="n°"
        />
      </div>

      {/* Cesárea */}
      <div className="flex items-center space-x-2">
        <Label htmlFor="gen-cesarea">Cesárea</Label>
        <Input
          id="gen-cesarea"
          type="number"
          min="0"
          value={data.cesarea}
          disabled={!isEditing}
          onChange={(e) => onChange("cesarea", e.currentTarget.value)}
          placeholder="n°"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Label htmlFor="gen-partos">Partos</Label>
        <Input
          id="gen-partos"
          type="number"
          min="0"
          value={data.partos}
          disabled={!isEditing}
          onChange={(e) => onChange("partos", e.currentTarget.value)}
          placeholder="n°"
        />
      </div>
    </div>
  </div>
);
