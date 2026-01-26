import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface CabezaCuello {
  sinAlteraciones?: boolean;
  observaciones: string;
}

interface CabezaCuelloSectionProps {
  isEditing: boolean;
  data: CabezaCuello;
  onChange: (field: keyof CabezaCuello, value: boolean | string | undefined) => void;
  onBatchChange?: (updates: Partial<CabezaCuello>) => void;
}

export const CabezaCuelloSection: React.FC<CabezaCuelloSectionProps> = ({
  isEditing,
  data,
  onChange,
  onBatchChange,
}) => {
  const handleSinAlteracionesChange = (checked: boolean) => {
    if (checked && onBatchChange) {
      onBatchChange({ sinAlteraciones: true, observaciones: '' });
    } else {
      onChange("sinAlteraciones", checked ? true : undefined);
    }
  };

  const handleObservacionesChange = (value: string) => {
    if (value.trim() && data.sinAlteraciones && onBatchChange) {
      onBatchChange({ sinAlteraciones: undefined, observaciones: value });
    } else {
      onChange("observaciones", value);
    }
  };

  const obsDisabled = !isEditing || data.sinAlteraciones;

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-base text-greenPrimary">Cabeza y Cuello</h4>

      {/* Sin alteraciones */}
      <div className="flex items-center space-x-2 text-black">
        <Checkbox
          id="cabeza-sin"
          checked={data.sinAlteraciones}
          disabled={!isEditing}
          onCheckedChange={(chk) => handleSinAlteracionesChange(chk === true)}
        />
        <Label htmlFor="cabeza-sin">Sin alteraciones</Label>
      </div>

      {/* Observaciones */}
      <Input
        id="cabeza-obs"
        className="w-full text-black"
        value={data.observaciones}
        disabled={obsDisabled}
        onChange={(e) => handleObservacionesChange(e.currentTarget.value)}
        placeholder={data.sinAlteraciones ? "Sin observaciones (sin alteraciones)" : "Observaciones…"}
      />
    </div>
  );
};
