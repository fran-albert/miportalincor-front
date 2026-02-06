import { useDoctorBookingSettings } from "./useDoctorBookingSettings";
import useUserRole from "@/hooks/useRoles";

export const useCanSelfManageSchedule = () => {
  const { isDoctor, session } = useUserRole();
  const doctorId = typeof session?.id === 'string' ? parseInt(session.id, 10) : (session?.id ?? 0);

  const { settings, isLoading } = useDoctorBookingSettings({
    doctorId,
    enabled: isDoctor && doctorId > 0,
  });

  return {
    canSelfManage: isDoctor ? (settings?.canSelfManageSchedule ?? false) : false,
    isLoading: isDoctor ? isLoading : false,
    doctorId,
  };
};
