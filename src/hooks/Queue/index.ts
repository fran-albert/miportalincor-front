export {
  queueKeys,
  useWaitingQueue,
  useActiveQueue,
  useQueueStats,
  useCallNextPatient,
  useCallSpecificPatient,
  useRecallPatient,
  useConfirmArrival,
  useMarkAsAttending,
  useMarkAsCompleted,
  useMarkAsNoShow,
  useRegisterQueuePatient,
} from './useQueue';

export {
  doctorQueueKeys,
  useDoctorWaitingQueue,
  useDoctorQueueStats,
  useDoctorCallPatient,
  useDoctorRecallPatient,
  useDoctorMarkAsAttending,
} from './useDoctorQueue';

export { useDoctorQueueSocket } from './useDoctorQueueSocket';
