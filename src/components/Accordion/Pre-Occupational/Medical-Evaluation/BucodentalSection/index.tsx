import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface Bucodental {
  sinAlteraciones?: boolean;
  caries?: boolean;
  faltanPiezas?: boolean;
  observaciones: string;
}

interface BucodentalSectionProps {
  isEditing: boolean;
  data: Bucodental;
  onChange: (field: keyof Bucodental, value: boolean | string | undefined) => void;
  onBatchChange?: (updates: Partial<Bucodental>) => void;
}

export const BucodentalSection: React.FC<BucodentalSectionProps> = ({
  isEditing,
  data,
  onChange,
  onBatchChange,
}) => {
  // Si marca "Sin alteraciones", limpiar los otros campos (poner undefined, no false)
  const handleSinAlteracionesChange = (checked: boolean) => {
    if (checked && onBatchChange) {
      onBatchChange({
        sinAlteraciones: true,
        caries: undefined,
        faltanPiezas: undefined,
        observaciones: '',
      });
    } else {
      onChange('sinAlteraciones', checked ? true : undefined);
    }
  };

  // Si marca caries/faltanPiezas, desmarcar "Sin alteraciones" (poner undefined, no false)
  const handleAlteracionChange = (field: 'caries' | 'faltanPiezas', checked: boolean) => {
    if (checked && data.sinAlteraciones && onBatchChange) {
      onBatchChange({
        sinAlteraciones: undefined,
        [field]: true,
      });
    } else {
      onChange(field, checked);
    }
  };

  // Si escribe observaciones, desmarcar "Sin alteraciones" (poner undefined, no false)
  const handleObservacionesChange = (value: string) => {
    if (value.trim() && data.sinAlteraciones && onBatchChange) {
      onBatchChange({
        sinAlteraciones: undefined,
        observaciones: value,
      });
    } else {
      onChange('observaciones', value);
    }
  };

  // Solo las observaciones se deshabilitan, los checkboxes siempre habilitados
  const obsDisabled = !isEditing || data.sinAlteraciones;

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-base text-greenPrimary">Examen Bucodental</h4>

      {/* Checkboxes alineados - siempre habilitados para permitir desmarcar sin alteraciones */}
      <div className="flex flex-wrap gap-6 text-black">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="buc-sin"
            checked={data.sinAlteraciones}
            disabled={!isEditing}
            onCheckedChange={(chk) => handleSinAlteracionesChange(chk === true)}
          />
          <Label htmlFor="buc-sin">Sin alteraciones</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="buc-caries"
            checked={data.caries}
            disabled={!isEditing}
            onCheckedChange={(chk) => handleAlteracionChange('caries', chk === true)}
          />
          <Label htmlFor="buc-caries">Caries</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="buc-faltan"
            checked={data.faltanPiezas}
            disabled={!isEditing}
            onCheckedChange={(chk) => handleAlteracionChange('faltanPiezas', chk === true)}
          />
          <Label htmlFor="buc-faltan">Faltan piezas</Label>
        </div>
      </div>

      {/* Observaciones abajo - se deshabilita solo cuando sin alteraciones está marcado */}
      <div className="space-y-1 text-black">
        <Input
          id="buc-obs"
          className="w-full"
          value={data.observaciones}
          disabled={obsDisabled}
          onChange={(e) => handleObservacionesChange(e.currentTarget.value)}
          placeholder={data.sinAlteraciones ? "Sin observaciones (sin alteraciones)" : "Observaciones…"}
        />
      </div>
    </div>
  );
};
