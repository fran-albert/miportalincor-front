// components/Accordion/Pre-Occupational/Medical-Evaluation/OsteoarticularSection.tsx
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Osteoarticular } from "@/store/Pre-Occupational/preOccupationalSlice";

interface OsteoarticularSectionProps {
  isEditing: boolean;
  data: Osteoarticular;
  onChange: (field: keyof Osteoarticular, value: boolean | string) => void;
}

export const OsteoarticularSection: React.FC<OsteoarticularSectionProps> = ({
  isEditing,
  data,
  onChange,
}) => (
  <div className="space-y-4">
    <h4 className="font-bold text-base text-greenPrimary">
      Aparato Osteoarticular
    </h4>

    {/* MMSS */}
    <div className="flex items-center space-x-2 text-black">
      <Label htmlFor="osteo-mmss-sin">MMSS</Label>
      <Label htmlFor="osteo-mmss-sin">Sin Alteraciones:</Label>
      <Checkbox
        id="osteo-mmss-sin"
        checked={data.mmssSin}
        disabled={!isEditing}
        onCheckedChange={(chk) => onChange("mmssSin", chk)}
      />
      <Input
        id="osteo-mmss-obs"
        className="flex-1 ml-4"
        placeholder="Observaciones…"
        value={data.mmssObs}
        disabled={!isEditing}
        onChange={(e) => onChange("mmssObs", e.currentTarget.value)}
      />
    </div>

    {/* MMII */}
    <div className="flex items-center space-x-2 text-black">
      <Label htmlFor="osteo-mmii-sin">MMII</Label>
      <Label htmlFor="osteo-mmii-sin">Sin Alteraciones:</Label>
      <Checkbox
        id="osteo-mmii-sin"
        checked={data.mmiiSin}
        disabled={!isEditing}
        onCheckedChange={(chk) => onChange("mmiiSin", chk)}
      />
      <Input
        id="osteo-mmii-obs"
        className="flex-1 ml-4"
        placeholder="Observaciones…"
        value={data.mmiiObs}
        disabled={!isEditing}
        onChange={(e) => onChange("mmiiObs", e.currentTarget.value)}
      />
    </div>

    {/* Columna */}
    <div className="flex items-center space-x-2 text-black">
      <Label htmlFor="osteo-columna-sin">Columna</Label>
      <Label htmlFor="osteo-columna-sin">Sin Alteraciones:</Label>
      <Checkbox
        id="osteo-columna-sin"
        checked={data.columnaSin}
        disabled={!isEditing}
        onCheckedChange={(chk) => onChange("columnaSin", chk)}
      />
      <Input
        id="osteo-columna-obs"
        className="flex-1 ml-4"
        placeholder="Observaciones…"
        value={data.columnaObs}
        disabled={!isEditing}
        onChange={(e) => onChange("columnaObs", e.currentTarget.value)}
      />
    </div>

    {/* Amputaciones */}
    <div className="flex items-center space-x-2 text-black">
      <Label htmlFor="osteo-amputaciones">Amputaciones</Label>
      <Label htmlFor="osteo-amputaciones">SI:</Label>
      <Checkbox
        id="osteo-amputaciones"
        checked={data.amputaciones}
        disabled={!isEditing}
        onCheckedChange={(chk) => onChange("amputaciones", chk)}
      />
      <Input
        id="osteo-amputaciones-obs"
        className="flex-1 ml-4"
        placeholder="Observaciones…"
        value={data.amputacionesObs}
        disabled={!isEditing}
        onChange={(e) => onChange("amputacionesObs", e.currentTarget.value)}
      />
    </div>
  </div>
);
