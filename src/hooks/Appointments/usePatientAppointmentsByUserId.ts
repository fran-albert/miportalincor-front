import { useQuery } from "@tanstack/react-query";
import { getAppointmentsByPatientId } from "@/api/Appointments";
import { AppointmentStatus } from "@/types/Appointment/Appointment";

interface UsePatientAppointmentsByUserIdProps {
  patientUserId: number;
  status?: AppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
  enabled?: boolean;
}

/**
 * Hook para obtener turnos de un paciente específico (Admin/Secretaria/Doctor)
 * Diferente de usePatientAppointments que obtiene turnos del usuario autenticado
 */
export const usePatientAppointmentsByUserId = ({
  patientUserId,
  status,
  dateFrom,
  dateTo,
  enabled = true
}: UsePatientAppointmentsByUserIdProps) => {
  const query = useQuery({
    queryKey: ['patientAppointmentsByUserId', patientUserId, status, dateFrom, dateTo],
    queryFn: () => getAppointmentsByPatientId(patientUserId, { status, dateFrom, dateTo }),
    staleTime: 1000 * 30, // 30 segundos
    enabled: enabled && patientUserId > 0,
  });

  return {
    appointments: query.data ?? [],
    total: query.data?.length ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};
