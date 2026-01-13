import { useQuery } from "@tanstack/react-query";
import { getDoctorBookingSettings } from "@/api/DoctorBookingSettings";

interface UseDoctorBookingSettingsProps {
  doctorId: number;
  enabled?: boolean;
}

export const useDoctorBookingSettings = ({
  doctorId,
  enabled = true
}: UseDoctorBookingSettingsProps) => {
  const query = useQuery({
    queryKey: ['doctorBookingSettings', doctorId],
    queryFn: () => getDoctorBookingSettings(doctorId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled && doctorId > 0,
  });

  return {
    settings: query.data,
    // Si no hay settings, por defecto está habilitado
    allowOnlineBooking: query.data?.allowOnlineBooking ?? true,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
