import { z } from 'zod';
import { AppointmentStatus } from '@/types/Appointment/Appointment';
import { OverturnStatus } from '@/types/Overturn/Overturn';

/**
 * Schema para crear un turno
 */
export const CreateAppointmentSchema = z.object({
  doctorId: z.number({
    required_error: 'Debe seleccionar un médico',
    invalid_type_error: 'Debe seleccionar un médico',
  }).min(1, 'Debe seleccionar un médico'),

  patientId: z.number({
    required_error: 'Debe seleccionar un paciente',
    invalid_type_error: 'Debe seleccionar un paciente',
  }).min(1, 'Debe seleccionar un paciente'),

  date: z.string({
    required_error: 'Debe seleccionar una fecha',
  }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),

  hour: z.string({
    required_error: 'Debe seleccionar un horario',
  }).min(1, 'Debe seleccionar un horario')
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato de hora inválido (HH:mm)'),
});

export type CreateAppointmentFormData = z.infer<typeof CreateAppointmentSchema>;

/**
 * Schema para actualizar un turno
 */
export const UpdateAppointmentSchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
    .optional(),

  hour: z.string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato de hora inválido (HH:mm)')
    .optional(),
});

export type UpdateAppointmentFormData = z.infer<typeof UpdateAppointmentSchema>;

/**
 * Schema para cambiar el estado de un turno
 */
export const ChangeAppointmentStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus, {
    required_error: 'Debe seleccionar un estado',
    invalid_type_error: 'Estado inválido',
  }),
});

export type ChangeAppointmentStatusFormData = z.infer<typeof ChangeAppointmentStatusSchema>;

/**
 * Schema para crear un sobreturno
 */
export const CreateOverturnSchema = z.object({
  doctorId: z.number({
    required_error: 'Debe seleccionar un médico',
    invalid_type_error: 'Debe seleccionar un médico',
  }).min(1, 'Debe seleccionar un médico'),

  patientId: z.number({
    required_error: 'Debe seleccionar un paciente',
    invalid_type_error: 'Debe seleccionar un paciente',
  }).min(1, 'Debe seleccionar un paciente'),

  date: z.string({
    required_error: 'Debe seleccionar una fecha',
  }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),

  hour: z.string({
    required_error: 'Debe seleccionar un horario',
  }).min(1, 'Debe seleccionar un horario')
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato de hora inválido (HH:mm)'),

  reason: z.string()
    .max(500, 'El motivo no puede exceder los 500 caracteres')
    .optional(),
});

export type CreateOverturnFormData = z.infer<typeof CreateOverturnSchema>;

/**
 * Schema para cambiar el estado de un sobreturno
 */
export const ChangeOverturnStatusSchema = z.object({
  status: z.nativeEnum(OverturnStatus, {
    required_error: 'Debe seleccionar un estado',
    invalid_type_error: 'Estado inválido',
  }),
});

export type ChangeOverturnStatusFormData = z.infer<typeof ChangeOverturnStatusSchema>;

/**
 * Schema para filtros de búsqueda de turnos
 */
export const AppointmentFiltersSchema = z.object({
  doctorId: z.number().optional(),
  patientId: z.number().optional(),
  date: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
});

export type AppointmentFiltersFormData = z.infer<typeof AppointmentFiltersSchema>;
