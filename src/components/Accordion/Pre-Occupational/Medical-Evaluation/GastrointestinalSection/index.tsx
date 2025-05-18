import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface Gastrointestinal {
  sinAlteraciones: boolean;
  observaciones: string;
  cicatrices: boolean;
  cicatricesObs: string;
  hernias: boolean;
  herniasObs: string;
  eventraciones: boolean;
  eventracionesObs: string;
  hemorroides: boolean;
  hemorroidesObs: string;
}

interface GastrointestinalSectionProps {
  isEditing: boolean;
  data: Gastrointestinal;
  onChange: (field: keyof Gastrointestinal, value: boolean | string) => void;
}

export const GastrointestinalSection: React.FC<GastrointestinalSectionProps> = ({
  isEditing,
  data,
  onChange,
}) => (
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
        onCheckedChange={(chk) => onChange('sinAlteraciones', chk)}
      />
      <Label htmlFor="gi-sin">Sin alteraciones</Label>
    </div>

    {/* Observaciones generales */}
    <Input
      id="gi-obs"
      className="w-full"
      value={data.observaciones}
      disabled={!isEditing}
      onChange={(e) => onChange('observaciones', e.currentTarget.value)}
      placeholder="Observaciones…"
    />

    {/* Cicatrices */}
    <div className="flex items-center space-x-2 text-black">
      <Label>Cicatrices:</Label>
      <Checkbox
        id="gi-cic-si"
        checked={data.cicatrices}
        disabled={!isEditing}
        onCheckedChange={(chk) => onChange('cicatrices', chk)}
      />
      <Label htmlFor="gi-cic-si">Sí</Label>
      <Checkbox
        id="gi-cic-no"
        checked={!data.cicatrices}
        disabled={!isEditing}
        onCheckedChange={(chk) => onChange('cicatrices', !chk)}
      />
      <Label htmlFor="gi-cic-no">No</Label>
      <Input
        id="gi-cic-obs"
        className="flex-1 ml-4"
        value={data.cicatricesObs}
        disabled={!isEditing}
        onChange={(e) => onChange('cicatricesObs', e.currentTarget.value)}
        placeholder="Observaciones…"
      />
    </div>

    {/* Hernias */}
    <div className="flex items-center space-x-2 text-black">
      <Label>Hernias:</Label>
      <Checkbox
        id="gi-her-si"
        checked={data.hernias}
        disabled={!isEditing}
        onCheckedChange={(chk) => onChange('hernias', chk)}
      />
      <Label htmlFor="gi-her-si">Sí</Label>
      <Checkbox
        id="gi-her-no"
        checked={!data.hernias}
        disabled={!isEditing}
        onCheckedChange={(chk) => onChange('hernias', !chk)}
      />
      <Label htmlFor="gi-her-no">No</Label>
      <Input
        id="gi-her-obs"
        className="flex-1 ml-4"
        value={data.herniasObs}
        disabled={!isEditing}
        onChange={(e) => onChange('herniasObs', e.currentTarget.value)}
        placeholder="Observaciones…"
      />
    </div>

    {/* Eventraciones */}
    <div className="flex items-center space-x-2 text-black">
      <Label>Eventraciones:</Label>
      <Checkbox
        id="gi-event-si"
        checked={data.eventraciones}
        disabled={!isEditing}
        onCheckedChange={(chk) => onChange('eventraciones', chk)}
      />
      <Label htmlFor="gi-event-si">Sí</Label>
      <Checkbox
        id="gi-event-no"
        checked={!data.eventraciones}
        disabled={!isEditing}
        onCheckedChange={(chk) => onChange('eventraciones', !chk)}
      />
      <Label htmlFor="gi-event-no">No</Label>
      <Input
        id="gi-event-obs"
        className="flex-1 ml-4"
        value={data.eventracionesObs}
        disabled={!isEditing}
        onChange={(e) => onChange('eventracionesObs', e.currentTarget.value)}
        placeholder="Observaciones…"
      />
    </div>

    {/* Hemorroides */}
    <div className="flex items-center space-x-2 text-black">
      <Label>Hemorroides:</Label>
      <Checkbox
        id="gi-hemo-si"
        checked={data.hemorroides}
        disabled={!isEditing}
        onCheckedChange={(chk) => onChange('hemorroides', chk)}
      />
      <Label htmlFor="gi-hemo-si">Sí</Label>
      <Checkbox
        id="gi-hemo-no"
        checked={!data.hemorroides}
        disabled={!isEditing}
        onCheckedChange={(chk) => onChange('hemorroides', !chk)}
      />
      <Label htmlFor="gi-hemo-no">No</Label>
      <Input
        id="gi-hemo-obs"
        className="flex-1 ml-4"
        value={data.hemorroidesObs}
        disabled={!isEditing}
        onChange={(e) => onChange('hemorroidesObs', e.currentTarget.value)}
        placeholder="Observaciones…"
      />
    </div>
  </div>
);
