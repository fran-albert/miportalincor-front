import { z } from 'zod';
import { RecurrenceType, WeekDays } from '@/types/DoctorAvailability';

export const CreateDoctorAvailabilitySchema = z.object({
  doctorId: z.number({
    required_error: 'Debe seleccionar un médico',
  }).min(1, 'Debe seleccionar un médico'),

  recurrenceType: z.nativeEnum(RecurrenceType, {
    required_error: 'Debe seleccionar un tipo de recurrencia',
  }),

  specificDate: z.string().optional(),

  daysOfWeek: z.array(z.nativeEnum(WeekDays)).optional(),

  dayOfMonth: z.number().min(1).max(31).optional(),

  startTime: z.string({
    required_error: 'Debe ingresar hora de inicio',
  }).regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato inválido (HH:mm)'),

  endTime: z.string({
    required_error: 'Debe ingresar hora de fin',
  }).regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato inválido (HH:mm)'),

  slotDuration: z.number().min(5).max(120).default(30),

  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
}).refine((data) => {
  // Validar que si es NONE, tenga specificDate
  if (data.recurrenceType === RecurrenceType.NONE && !data.specificDate) {
    return false;
  }
  return true;
}, {
  message: 'Debe seleccionar una fecha específica',
  path: ['specificDate'],
}).refine((data) => {
  // Validar que si es WEEKLY, tenga daysOfWeek
  if (data.recurrenceType === RecurrenceType.WEEKLY && (!data.daysOfWeek || data.daysOfWeek.length === 0)) {
    return false;
  }
  return true;
}, {
  message: 'Debe seleccionar al menos un día de la semana',
  path: ['daysOfWeek'],
}).refine((data) => {
  // Validar que si es MONTHLY, tenga dayOfMonth
  if (data.recurrenceType === RecurrenceType.MONTHLY && !data.dayOfMonth) {
    return false;
  }
  return true;
}, {
  message: 'Debe seleccionar un día del mes',
  path: ['dayOfMonth'],
}).refine((data) => {
  // Validar que startTime sea menor que endTime
  if (data.startTime && data.endTime) {
    return data.startTime < data.endTime;
  }
  return true;
}, {
  message: 'La hora de inicio debe ser menor a la hora de fin',
  path: ['endTime'],
});

export type CreateDoctorAvailabilityFormData = z.infer<typeof CreateDoctorAvailabilitySchema>;
