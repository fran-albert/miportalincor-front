/**
 * Tipos de recurrencia para disponibilidad de médicos
 */
export enum RecurrenceType {
  NONE = 'NONE',       // Fecha específica única
  DAILY = 'DAILY',     // Todos los días
  WEEKLY = 'WEEKLY',   // Días específicos de la semana
  MONTHLY = 'MONTHLY', // Día específico del mes
}

export const RecurrenceTypeLabels: Record<RecurrenceType, string> = {
  [RecurrenceType.NONE]: 'Fecha específica',
  [RecurrenceType.DAILY]: 'Diario',
  [RecurrenceType.WEEKLY]: 'Semanal',
  [RecurrenceType.MONTHLY]: 'Mensual',
};

/**
 * Días de la semana
 */
export enum WeekDays {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export const WeekDaysLabels: Record<WeekDays, string> = {
  [WeekDays.MONDAY]: 'Lunes',
  [WeekDays.TUESDAY]: 'Martes',
  [WeekDays.WEDNESDAY]: 'Miércoles',
  [WeekDays.THURSDAY]: 'Jueves',
  [WeekDays.FRIDAY]: 'Viernes',
  [WeekDays.SATURDAY]: 'Sábado',
  [WeekDays.SUNDAY]: 'Domingo',
};

export const WeekDaysShort: Record<WeekDays, string> = {
  [WeekDays.MONDAY]: 'Lun',
  [WeekDays.TUESDAY]: 'Mar',
  [WeekDays.WEDNESDAY]: 'Mié',
  [WeekDays.THURSDAY]: 'Jue',
  [WeekDays.FRIDAY]: 'Vie',
  [WeekDays.SATURDAY]: 'Sáb',
  [WeekDays.SUNDAY]: 'Dom',
};

/**
 * DTO para crear disponibilidad de médico
 */
export interface CreateDoctorAvailabilityDto {
  doctorId: number;
  recurrenceType: RecurrenceType;
  specificDate?: string;      // Requerido si recurrenceType es NONE
  daysOfWeek?: WeekDays[];    // Requerido si recurrenceType es WEEKLY
  dayOfMonth?: number;        // Requerido si recurrenceType es MONTHLY (1-31)
  startTime: string;          // Formato HH:mm
  endTime: string;            // Formato HH:mm
  slotDuration?: number;      // Duración en minutos (default 30)
  validFrom?: string;         // Fecha desde
  validUntil?: string;        // Fecha hasta
}

/**
 * DTO para actualizar disponibilidad de médico
 */
export interface UpdateDoctorAvailabilityDto {
  recurrenceType?: RecurrenceType;
  specificDate?: string;
  daysOfWeek?: WeekDays[];
  dayOfMonth?: number;
  startTime?: string;
  endTime?: string;
  slotDuration?: number;
  validFrom?: string;
  validUntil?: string;
}

/**
 * DTO de respuesta de disponibilidad de médico
 */
export interface DoctorAvailabilityResponseDto {
  id: number;
  doctorId: number;
  recurrenceType: RecurrenceType;
  specificDate?: string;
  daysOfWeek?: WeekDays[];
  dayOfMonth?: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  validFrom?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}
