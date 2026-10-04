import { describe, expect, it } from 'vitest';
import type { AppointmentType, QueueEntry } from '@/types/Queue';
import { getCallDestinationOptions, isLaboratoryEntry } from './call-destinations';

const entryOf = (appointmentType: AppointmentType) =>
  ({ id: 1, appointmentType }) as QueueEntry;

describe('destinos de llamado de la cola', () => {
  it('a un paciente del laboratorio se lo llama solo al laboratorio', () => {
    const options = getCallDestinationOptions(entryOf('LABORATORY'));
    expect(options.map((option) => option.value)).toEqual(['LABORATORIO']);
  });

  it.each<AppointmentType>(['SCHEDULED_APPOINTMENT', 'WALK_IN', 'ADMINISTRATIVE'])(
    '%s sigue llamándose a Recepción o Ventanilla',
    (appointmentType) => {
      const options = getCallDestinationOptions(entryOf(appointmentType));
      expect(options.map((option) => option.value)).toEqual(['RECEPCION', 'VENTANILLA']);
    },
  );

  it('reconoce solo los anuncios de laboratorio', () => {
    expect(isLaboratoryEntry(entryOf('LABORATORY'))).toBe(true);
    expect(isLaboratoryEntry(entryOf('ADMINISTRATIVE'))).toBe(false);
  });
});
