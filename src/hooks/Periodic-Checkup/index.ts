// Checkup Types
export { useCheckupTypes, useActiveCheckupTypes } from './useCheckupTypes';
export {
  useCreateCheckupType,
  useUpdateCheckupType,
  useDeleteCheckupType,
} from './useCheckupTypeMutations';

// Patient Schedules
export { usePatientSchedules } from './usePatientSchedules';
export {
  useAssignCheckupToPatient,
  useUpdatePatientSchedule,
  useDeletePatientSchedule,
  useCompleteCheckup,
} from './usePatientScheduleMutations';
