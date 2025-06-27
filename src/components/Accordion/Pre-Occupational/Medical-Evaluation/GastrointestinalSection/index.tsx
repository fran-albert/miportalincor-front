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
}

export const GastrointestinalSection: React.FC<
  GastrointestinalSectionProps
> = ({ isEditing, data, onChange }) => (
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
        onCheckedChange={(chk) => onChange("sinAlteraciones", chk)}
      />
      <Label htmlFor="gi-sin">Sin alteraciones</Label>
    </div>

    {/* Observaciones generales */}
    <Input
      id="gi-obs"
      className="w-full text-black"
      value={data.observaciones}
      disabled={!isEditing}
      onChange={(e) => onChange("observaciones", e.currentTarget.value)}
      placeholder="Observaciones…"
    />

    {/* Cicatrices */}
    <div className="flex items-center space-x-2 text-black">
      <Label>Cicatrices:</Label>
      <Checkbox
        id="gi-cic-si"
        checked={data.cicatrices === true}
        disabled={!isEditing}
        onCheckedChange={(chk) =>
          onChange("cicatrices", chk ? true : undefined)
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
        disabled={!isEditing}
        onChange={(e) => onChange("cicatricesObs", e.currentTarget.value)}
        placeholder="Observaciones…"
      />
    </div>

    {/* Hernias */}
    <div className="flex items-center space-x-2 text-black">
      <Label>Hernias:</Label>
      <Checkbox
        id="gi-her-si"
        disabled={!isEditing}
        checked={data.hernias === true}
        onCheckedChange={(chk) => onChange("hernias", chk ? true : undefined)}
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
        disabled={!isEditing}
        onChange={(e) => onChange("herniasObs", e.currentTarget.value)}
        placeholder="Observaciones…"
      />
    </div>

    {/* Eventraciones */}
    <div className="flex items-center space-x-2 text-black">
      <Label>Eventraciones:</Label>
      <Checkbox
        id="gi-event-si"
        checked={data.eventraciones === true}
        disabled={!isEditing}
        onCheckedChange={(chk) =>
          onChange("eventraciones", chk ? true : undefined)
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
        disabled={!isEditing}
        onChange={(e) => onChange("eventracionesObs", e.currentTarget.value)}
        placeholder="Observaciones…"
      />
    </div>

    {/* Hemorroides */}
    <div className="flex items-center space-x-2 text-black">
      <Label>Hemorroides:</Label>
      <Checkbox
        id="gi-hemo-si"
        checked={data.hemorroides === true}
        disabled={!isEditing}
        onCheckedChange={(chk) =>
          onChange("hemorroides", chk ? true : undefined)
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
        disabled={!isEditing}
        onChange={(e) => onChange("hemorroidesObs", e.currentTarget.value)}
        placeholder="Observaciones…"
      />
    </div>
  </div>
);
