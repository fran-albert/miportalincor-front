export interface WaitingRoomRestrictionInput {
  /** El médico no tiene disponibilidad configurada para hoy (horario semanal ni excepción). */
  restrictedBySchedule: boolean;
  /** Hay actividad real hoy: turnos/sobreturnos en agenda o pacientes en cola. */
  hasActivityToday: boolean;
  /** Las queries de actividad del día todavía están cargando. */
  isActivityLoading: boolean;
}

/**
 * La sala de espera se restringe solo si falta el horario configurado Y no hay
 * actividad real del día. Si hay turnos o pacientes en cola, la sala se muestra
 * aunque la disponibilidad no esté cargada (p. ej. excepción de agenda borrada).
 */
export const resolveWaitingRoomRestriction = ({
  restrictedBySchedule,
  hasActivityToday,
  isActivityLoading,
}: WaitingRoomRestrictionInput): boolean =>
  restrictedBySchedule && !isActivityLoading && !hasActivityToday;
