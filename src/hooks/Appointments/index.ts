// Queries
export { useAppointments } from './useAppointments';
export { useAppointment } from './useAppointment';
export { useAvailableSlots } from './useAvailableSlots';
export { useWaitingList } from './useWaitingList';
export { useDoctorTodayAppointments } from './useDoctorTodayAppointments';
export { usePatientAppointments } from './usePatientAppointments';
export { useDoctorsWithAvailability } from './useDoctorsWithAvailability';

// Legacy hooks (for backwards compatibility)
export { useGetByDate } from './useGetByDate';
export { useGetByDoctorId } from './useGetByDoctorId';
export { useGetByMonthYear } from './useGetByMonthYear';
export { useCountFromMonthYear } from './useCountFromMonthYear';

// Mutations
export { useAppointmentMutations } from './useAppointmentMutations';
export { useRequestAppointment } from './useRequestAppointment';
