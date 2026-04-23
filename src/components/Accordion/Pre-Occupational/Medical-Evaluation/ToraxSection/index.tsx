import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Torax } from '@/store/Pre-Occupational/preOccupationalSlice';

interface ToraxSectionProps {
  isEditing: boolean;
  data: Torax;
  onChange: (field: keyof Torax, value: "si" | "no" | string | undefined) => void;
}

export const ToraxSection: React.FC<ToraxSectionProps> = ({ isEditing, data, onChange }) => (
  <div className="space-y-4">
    <h4 className="font-bold text-base text-greenPrimary">Tórax</h4>

    {/* Deformaciones */}
    <div className="flex items-center space-x-2 text-black">
      <Label>Deformaciones:</Label>
      <Checkbox
        id="torax-def-si"
        checked={data.deformaciones === 'si'}
        disabled={!isEditing}
        onCheckedChange={(chk) => onChange('deformaciones', chk ? 'si' : (data.deformaciones === 'si' ? undefined : data.deformaciones))}
      />
      <Label htmlFor="torax-def-si">Sí</Label>
      <Checkbox
        id="torax-def-no"
        checked={data.deformaciones === 'no'}
        disabled={!isEditing}
        onCheckedChange={(chk) => onChange('deformaciones', chk ? 'no' : (data.deformaciones === 'no' ? undefined : data.deformaciones))}
      />
      <Label htmlFor="torax-def-no">No</Label>
      <Input
        id="torax-def-obs"
        className="flex-1 ml-4"
        value={data.deformacionesObs}
        disabled={!isEditing}
        onChange={(e) => onChange('deformacionesObs', e.currentTarget.value)}
        placeholder="Observaciones…"
      />
    </div>

    {/* Cicatrices */}
    <div className="flex items-center space-x-2 text-black">
      <Label>Cicatrices:</Label>
      <Checkbox
        id="torax-cic-si"
        checked={data.cicatrices === 'si'}
        disabled={!isEditing}
        onCheckedChange={(chk) => onChange('cicatrices', chk ? 'si' : (data.cicatrices === 'si' ? undefined : data.cicatrices))}
      />
      <Label htmlFor="torax-cic-si">Sí</Label>
      <Checkbox
        id="torax-cic-no"
        checked={data.cicatrices === 'no'}
        disabled={!isEditing}
        onCheckedChange={(chk) => onChange('cicatrices', chk ? 'no' : (data.cicatrices === 'no' ? undefined : data.cicatrices))}
      />
      <Label htmlFor="torax-cic-no">No</Label>
      <Input
        id="torax-cic-obs"
        className="flex-1 ml-4"
        value={data.cicatricesObs}
        disabled={!isEditing}
        onChange={(e) => onChange('cicatricesObs', e.currentTarget.value)}
        placeholder="Observaciones…"
      />
    </div>
  </div>
);
