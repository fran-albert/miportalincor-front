// GET operations
export { getAllAppointments, type GetAllAppointmentsParams, type PaginatedAppointmentsResponse } from './get-all.action';
export { getAppointmentById } from './get-by-id.action';
export { getAvailableSlots } from './get-slots.action';
export { getAppointmentsByDoctorAndDate } from './get-by-doctor-date.action';
export { getTodayAppointmentsByDoctor } from './get-today-by-doctor.action';
export { getAppointmentsByPatient } from './get-by-patient.action';
export { getAllAppointmentsByDate } from './get-all-by-date';
export { getAllAppointmentsByDoctor } from './get-all-by-doctor';
export { getAllAppointmentsByMonthYear } from './get-all-by-month-year';

// MUTATIONS
export { createAppointment } from './create.action';
export { updateAppointment } from './update.action';
export { changeAppointmentStatus } from './change-status.action';
export { deleteAppointment } from './delete.action';
