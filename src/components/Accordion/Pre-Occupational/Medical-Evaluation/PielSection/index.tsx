import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface Piel {
  normocoloreada: "si" | "no";
  tatuajes: "si" | "no";
  observaciones: string;
}

interface PielSectionProps {
  isEditing: boolean;
  data: Piel;
  onChange: (field: keyof Piel, value: "si" | "no" | string) => void;
}

export const PielSection: React.FC<PielSectionProps> = ({
  isEditing,
  data,
  onChange,
}) => (
  <div className="space-y-4">
    <h4 className="font-bold text-base text-greenPrimary">Piel</h4>

    {/* Checkboxes alineados */}
    <div className="flex flex-wrap gap-6 text-black">
      <div className="flex items-center space-x-2">
        <Label>Normocoloreada:</Label>
        <Checkbox
          id="piel-normo-si"
          checked={data.normocoloreada === "si"}
          disabled={!isEditing}
          onCheckedChange={(chk) => onChange("normocoloreada", chk ? "si" : "no")}
        />
        <Label htmlFor="piel-normo-si">Sí</Label>
        <Checkbox
          id="piel-normo-no"
          checked={data.normocoloreada === "no"}
          disabled={!isEditing}
          onCheckedChange={(chk) => onChange("normocoloreada", chk ? "no" : "si")}
        />
        <Label htmlFor="piel-normo-no">No</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Label>Tatuajes:</Label>
        <Checkbox
          id="piel-tatuajes-si"
          checked={data.tatuajes === "si"}
          disabled={!isEditing}
          onCheckedChange={(chk) => onChange("tatuajes", chk ? "si" : "no")}
        />
        <Label htmlFor="piel-tatuajes-si">Sí</Label>
        <Checkbox
          id="piel-tatuajes-no"
          checked={data.tatuajes === "no"}
          disabled={!isEditing}
          onCheckedChange={(chk) => onChange("tatuajes", chk ? "no" : "si")}
        />
        <Label htmlFor="piel-tatuajes-no">No</Label>
      </div>
    </div>

    {/* Observaciones abajo */}
    <div className="space-y-1 text-black">
      <Input
        id="piel-obs"
        className="w-full"
        value={data.observaciones}
        disabled={!isEditing}
        onChange={(e) => onChange("observaciones", e.currentTarget.value)}
        placeholder="Observaciones…"
      />
    </div>
  </div>
);
