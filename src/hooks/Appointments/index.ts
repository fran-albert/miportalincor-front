// Queries
export { useAppointments } from './useAppointments';
export { useAppointment } from './useAppointment';
export { useDoctorTabs, type DoctorTab, type UseDoctorTabsReturn } from './useDoctorTabs';
export { useAvailableSlots } from './useAvailableSlots';
export { useAvailableSlotsRange } from './useAvailableSlotsRange';
export { useFirstAvailableDate, clearFirstAvailableDateCache } from './useFirstAvailableDate';
export { useWaitingList } from './useWaitingList';
export { useDoctorTodayAppointments } from './useDoctorTodayAppointments';
export { usePatientAppointments } from './usePatientAppointments';
export { usePatientAppointmentsByUserId } from './usePatientAppointmentsByUserId';
export { useDoctorsWithAvailability } from './useDoctorsWithAvailability';

// Legacy hooks (for backwards compatibility)
export { useGetByDate } from './useGetByDate';
export { useGetByDoctorId } from './useGetByDoctorId';
export { useGetByMonthYear } from './useGetByMonthYear';
export { useCountFromMonthYear } from './useCountFromMonthYear';

// Mutations
export { useAppointmentMutations } from './useAppointmentMutations';
export { useRequestAppointment } from './useRequestAppointment';
export { useConvertGuest } from './useConvertGuest';
