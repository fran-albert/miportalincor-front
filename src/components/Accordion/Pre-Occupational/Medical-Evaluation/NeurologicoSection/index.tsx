import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Neurologico } from '@/store/Pre-Occupational/preOccupationalSlice';

interface NeurologicoSectionProps {
  isEditing: boolean;
  data: Neurologico;
  onChange: (field: keyof Neurologico, value: boolean | string) => void;
}

export const NeurologicoSection: React.FC<NeurologicoSectionProps> = ({
  isEditing,
  data,
  onChange,
}) => (
  <div className="space-y-4">
    <h4 className="font-bold text-base text-greenPrimary">
      Aparato Neurológico
    </h4>

    {/* Sin alteraciones */}
    <div className="flex items-center space-x-2 text-black">
      <Checkbox
        id="neu-sin"
        checked={data.sinAlteraciones}
        disabled={!isEditing}
        onCheckedChange={(chk) => onChange('sinAlteraciones', chk)}
      />
      <Label htmlFor="neu-sin">Sin alteraciones</Label>
    </div>

    {/* Observaciones */}
    <Input
      id="neu-obs"
      className="w-full"
      value={data.observaciones}
      disabled={!isEditing}
      onChange={(e) => onChange('observaciones', e.currentTarget.value)}
      placeholder="Observaciones…"
    />
  </div>
);
