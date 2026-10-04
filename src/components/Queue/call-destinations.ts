import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { QueueCallDestination, QueueEntry } from '@/types/Queue';

export type CallDestinationOption = {
  value: QueueCallDestination;
  label: string;
  Icon: typeof ArrowLeft;
  variant: 'default' | 'outline';
  className: string;
};

const receptionCallDestinations: CallDestinationOption[] = [
  {
    value: 'RECEPCION',
    label: 'Recepción',
    Icon: ArrowLeft,
    variant: 'outline',
    className:
      'border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900',
  },
  {
    value: 'VENTANILLA',
    label: 'Ventanilla',
    Icon: ArrowRight,
    variant: 'default',
    className:
      'bg-greenPrimary text-white hover:bg-greenSecondary hover:text-white',
  },
];

// El laboratorio queda a la derecha de la sala: misma flecha que en la TV.
const laboratoryCallDestinations: CallDestinationOption[] = [
  {
    value: 'LABORATORIO',
    label: 'Laboratorio',
    Icon: ArrowRight,
    variant: 'default',
    className:
      'bg-greenPrimary text-white hover:bg-greenSecondary hover:text-white',
  },
];

export const isLaboratoryEntry = (entry: QueueEntry): boolean =>
  entry.appointmentType === 'LABORATORY';

/** A un paciente del laboratorio se lo llama solo al laboratorio. */
export const getCallDestinationOptions = (
  entry: QueueEntry,
): CallDestinationOption[] =>
  isLaboratoryEntry(entry) ? laboratoryCallDestinations : receptionCallDestinations;
