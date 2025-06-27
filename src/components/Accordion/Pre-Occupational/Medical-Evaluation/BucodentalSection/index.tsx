import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface Bucodental {
  sinAlteraciones: boolean;
  caries: boolean;
  faltanPiezas: boolean;
  observaciones: string;
}

interface BucodentalSectionProps {
  isEditing: boolean;
  data: Bucodental;
  onChange: (field: keyof Bucodental, value: boolean | string) => void;
}

export const BucodentalSection: React.FC<BucodentalSectionProps> = ({
  isEditing,
  data,
  onChange,
}) => (
  <div className="space-y-4">
    <h4 className="font-bold text-base text-greenPrimary">Examen Bucodental</h4>

    {/* Checkboxes alineados */}
    <div className="flex flex-wrap gap-6 text-black">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="buc-sin"
          checked={data.sinAlteraciones}
          disabled={!isEditing}
          onCheckedChange={(chk) => onChange('sinAlteraciones', chk)}
        />
        <Label htmlFor="buc-sin">Sin alteraciones</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="buc-caries"
          checked={data.caries}
          disabled={!isEditing}
          onCheckedChange={(chk) => onChange('caries', chk)}
        />
        <Label htmlFor="buc-caries">Caries</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="buc-faltan"
          checked={data.faltanPiezas}
          disabled={!isEditing}
          onCheckedChange={(chk) => onChange('faltanPiezas', chk)}
        />
        <Label htmlFor="buc-faltan">Faltan piezas</Label>
      </div>
    </div>

    {/* Observaciones abajo */}
    <div className="space-y-1 text-black">
      <Input
        id="buc-obs"
        className="w-full"
        value={data.observaciones}
        disabled={!isEditing}
        onChange={(e) => onChange('observaciones', e.currentTarget.value)}
        placeholder="Observaciones…"
      />
    </div>
  </div>
);
