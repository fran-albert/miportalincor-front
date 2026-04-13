import React from 'react';
import { Torax } from '@/store/Pre-Occupational/preOccupationalSlice';
import {
  BooleanChoiceField,
  ClinicalBlock,
  NotesField,
} from '../FormPrimitives';

interface ToraxSectionProps {
  isEditing: boolean;
  data: Torax;
  onChange: (field: keyof Torax, value: "si" | "no" | string | undefined) => void;
}

export const ToraxSection: React.FC<ToraxSectionProps> = ({
  isEditing,
  data,
  onChange,
}) => (
  <div className="space-y-4">
    <div className="grid gap-3 xl:grid-cols-2">
      <ClinicalBlock
        title="Deformaciones"
        description="Indicá si hay deformaciones torácicas y agregá observaciones si corresponde."
      >
        <BooleanChoiceField
          idPrefix="torax-def"
          label="Presencia"
          value={
            data.deformaciones === "si"
              ? true
              : data.deformaciones === "no"
                ? false
                : undefined
          }
          disabled={!isEditing}
          onChange={(value) =>
            onChange(
              'deformaciones',
              value === true ? 'si' : value === false ? 'no' : undefined
            )
          }
        />
        <NotesField
          id="torax-def-obs"
          label="Observaciones"
          value={data.deformacionesObs}
          disabled={!isEditing}
          onChange={(value) => onChange('deformacionesObs', value)}
          placeholder="Detalle clínico o aclaraciones"
        />
      </ClinicalBlock>

      <ClinicalBlock
        title="Cicatrices"
        description="Indicá si hay cicatrices y agregá observaciones si hace falta."
      >
        <BooleanChoiceField
          idPrefix="torax-cic"
          label="Presencia"
          value={
            data.cicatrices === "si"
              ? true
              : data.cicatrices === "no"
                ? false
                : undefined
          }
          disabled={!isEditing}
          onChange={(value) =>
            onChange(
              'cicatrices',
              value === true ? 'si' : value === false ? 'no' : undefined
            )
          }
        />
        <NotesField
          id="torax-cic-obs"
          label="Observaciones"
          value={data.cicatricesObs}
          disabled={!isEditing}
          onChange={(value) => onChange('cicatricesObs', value)}
          placeholder="Detalle clínico o aclaraciones"
        />
      </ClinicalBlock>
    </div>
  </div>
);
