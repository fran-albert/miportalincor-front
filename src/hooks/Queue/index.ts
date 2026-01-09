export {
  queueKeys,
  useWaitingQueue,
  useActiveQueue,
  useQueueStats,
  useCallNextPatient,
  useCallSpecificPatient,
  useRecallPatient,
  useMarkAsAttending,
  useMarkAsCompleted,
  useMarkAsNoShow,
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
