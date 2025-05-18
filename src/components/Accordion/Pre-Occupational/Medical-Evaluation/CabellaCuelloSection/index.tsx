import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface CabezaCuello {
  sinAlteraciones: boolean;
  observaciones: string;
}

interface CabezaCuelloSectionProps {
  isEditing: boolean;
  data: CabezaCuello;
  onChange: (field: keyof CabezaCuello, value: boolean | string) => void;
}

export const CabezaCuelloSection: React.FC<CabezaCuelloSectionProps> = ({
  isEditing,
  data,
  onChange,
}) => (
  <div className="space-y-4">
    <h4 className="font-bold text-base text-greenPrimary">Cabeza y Cuello</h4>

    {/* Sin alteraciones */}
    <div className="flex items-center space-x-2 text-black">
      <Checkbox
        id="cabeza-sin"
        checked={data.sinAlteraciones}
        disabled={!isEditing}
        onCheckedChange={(chk) => onChange('sinAlteraciones', chk)}
      />
      <Label htmlFor="cabeza-sin">Sin alteraciones</Label>
    </div>

    {/* Observaciones */}
    <Input
      id="cabeza-obs"
      className="w-full text-black"
      value={data.observaciones}
      disabled={!isEditing}
      onChange={(e) => onChange('observaciones', e.currentTarget.value)}
      placeholder="Observaciones…"
    />
  </div>
);
