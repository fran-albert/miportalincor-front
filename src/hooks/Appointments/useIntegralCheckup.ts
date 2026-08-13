import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getIntegralAvailableDays,
  requestIntegralAppointment,
  setIntegralUltrasoundTypes,
} from "@/api/Appointments/integral-checkup.action";
import { useToast } from "@/hooks/use-toast";
import { doctorAgendaKeys } from "@/hooks/Doctor/useDoctorDayAgenda";
import { doctorWaitingQueueKeys } from "@/hooks/Doctor/useDoctorWaitingQueue";
import { doctorQueueKeys } from "@/hooks/Queue/useDoctorQueue";
import type { IntegralCheckupSlot } from "@/types/Appointment/Appointment";

interface UseIntegralAvailableDaysOptions {
  enabled?: boolean;
}

export const useIntegralAvailableDays = ({
  enabled = true,
}: UseIntegralAvailableDaysOptions = {}) => {
  const query = useQuery<IntegralCheckupSlot[]>({
    queryKey: ["integralAvailableDays"],
    queryFn: () => getIntegralAvailableDays(),
    enabled,
    staleTime: 60 * 1000,
  });

  return {
    days: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

export const useRequestIntegralAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (dto: { date: string }) => requestIntegralAppointment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patientAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["integralAvailableDays"] });
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      queryClient.invalidateQueries({
        queryKey: ["publicAvailableSlotsBySpeciality"],
      });
      toast({
        title: "Control reservado",
        description: "Reservamos la consulta y la ecografía en un solo paso.",
      });
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      const message =
        error.response?.data?.message || "No se pudo reservar el control";
      toast({
        title: "Error",
        description: message,
      });
    },
  });
};

/**
 * La ginecóloga indica qué ecografía se le hace a la paciente del control.
 *
 * Se invalidan las vistas donde el tipo pasa a verse: su sala de espera, la
 * cola de recepción y el turnero. Es lo que hace que la eco deje de estar
 * marcada como "falta definir el subtipo" sin recargar la página.
 */
export const useSetIntegralUltrasoundTypes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      consultationId,
      consultationTypeIds,
    }: {
      consultationId: number;
      consultationTypeIds: number[];
    }) => setIntegralUltrasoundTypes(consultationId, consultationTypeIds),
    onSuccess: () => {
      // Las claves salen de los hooks que alimentan la sala de espera: el
      // vinculo con el tipo indicado viaja en la agenda del dia y en la cola,
      // asi que sin invalidar estas tres la tarjeta sigue mostrando el estado
      // viejo hasta recargar la pagina.
      queryClient.invalidateQueries({ queryKey: doctorAgendaKeys.all });
      queryClient.invalidateQueries({ queryKey: doctorWaitingQueueKeys.all });
      queryClient.invalidateQueries({ queryKey: doctorQueueKeys.all });
      toast({
        title: "Ecografía indicada",
        description:
          "La ecografista la va a ver con el estudio ya definido.",
      });
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "No se pudo indicar el tipo de ecografía",
      });
    },
  });
};
