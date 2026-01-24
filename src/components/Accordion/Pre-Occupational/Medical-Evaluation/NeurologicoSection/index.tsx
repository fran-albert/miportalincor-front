import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Neurologico } from '@/store/Pre-Occupational/preOccupationalSlice';

interface NeurologicoSectionProps {
  isEditing: boolean;
  data: Neurologico;
  onChange: (field: keyof Neurologico, value: boolean | string) => void;
  onBatchChange?: (updates: Partial<Neurologico>) => void;
}

export const NeurologicoSection: React.FC<NeurologicoSectionProps> = ({
  isEditing,
  data,
  onChange,
  onBatchChange,
}) => {
  const handleSinAlteracionesChange = (checked: boolean) => {
    if (checked && onBatchChange) {
      onBatchChange({ sinAlteraciones: true, observaciones: '' });
    } else {
      onChange('sinAlteraciones', checked);
    }
  };

  const handleObservacionesChange = (value: string) => {
    if (value.trim() && data.sinAlteraciones && onBatchChange) {
      onBatchChange({ sinAlteraciones: false, observaciones: value });
    } else {
      onChange('observaciones', value);
    }
  };

  const obsDisabled = !isEditing || data.sinAlteraciones;

  return (
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
          onCheckedChange={(chk) => handleSinAlteracionesChange(chk === true)}
        />
        <Label htmlFor="neu-sin">Sin alteraciones</Label>
      </div>

      {/* Observaciones */}
      <Input
        id="neu-obs"
        className="w-full text-black"
        value={data.observaciones}
        disabled={obsDisabled}
        onChange={(e) => handleObservacionesChange(e.currentTarget.value)}
        placeholder={data.sinAlteraciones ? "Sin observaciones (sin alteraciones)" : "Observaciones…"}
      />
    </div>
  );
};
