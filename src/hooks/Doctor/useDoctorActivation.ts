import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDoctorPendingFuture } from "@/api/Appointments/get-doctor-pending-future.action";
import { deactivateDoctor } from "@/api/Doctor/deactivate-doctor.action";
import { reactivateDoctor } from "@/api/Doctor/reactivate-doctor.action";
import { getInactiveDoctors } from "@/api/Doctor/get-inactive-doctors.action";

export const doctorActivationKeys = {
  inactive: ["doctors-inactive"] as const,
  pendingFuture: (doctorId: number) =>
    ["doctor-pending-future", doctorId] as const,
};

/**
 * Todo lo que lista médicos o arma selectores de agenda con ellos. Al
 * desactivar o reactivar, cada una de estas listas tiene que volver a pedirse.
 */
const DOCTOR_LIST_KEYS = [
  ["doctors"],
  ["doctors-search"],
  doctorActivationKeys.inactive,
  ["doctor"],
  ["doctorsWithAvailability"],
  ["publicDoctorsBySpeciality"],
  ["doctorAgenda"],
  ["doctor-pending-future"],
] as const;

const invalidateDoctorLists = (queryClient: ReturnType<typeof useQueryClient>) =>
  Promise.all(
    DOCTOR_LIST_KEYS.map((queryKey) =>
      queryClient.invalidateQueries({ queryKey: [...queryKey] })
    )
  );

export const useDoctorPendingFuture = (doctorId: number, enabled: boolean) =>
  useQuery({
    queryKey: doctorActivationKeys.pendingFuture(doctorId),
    queryFn: () => getDoctorPendingFuture(doctorId),
    enabled: enabled && doctorId > 0,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });

export const useInactiveDoctors = (enabled: boolean) => {
  const query = useQuery({
    queryKey: doctorActivationKeys.inactive,
    queryFn: getInactiveDoctors,
    enabled,
    staleTime: 1000 * 30,
  });

  return {
    doctors: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

export const useDeactivateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateDoctor(id),
    onSuccess: () => invalidateDoctorLists(queryClient),
  });
};

export const useReactivateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reactivateDoctor(id),
    onSuccess: () => invalidateDoctorLists(queryClient),
  });
};
