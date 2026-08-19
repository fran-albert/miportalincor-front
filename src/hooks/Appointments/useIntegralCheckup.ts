import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStaffIntegralAppointment,
  getIntegralAvailableDays,
  getIntegralCheckupConfig,
  getStaffIntegralAvailableDays,
  requestIntegralAppointment,
  setIntegralUltrasoundTypes,
} from "@/api/Appointments/integral-checkup.action";
import { useToast } from "@/hooks/use-toast";
import { doctorAgendaKeys } from "@/hooks/Doctor/useDoctorDayAgenda";
import { doctorWaitingQueueKeys } from "@/hooks/Doctor/useDoctorWaitingQueue";
import { doctorQueueKeys } from "@/hooks/Queue/useDoctorQueue";
import type {
  IntegralCheckupConfig,
  IntegralCheckupSlot,
} from "@/types/Appointment/Appointment";

interface UseIntegralAvailableDaysOptions {
  enabled?: boolean;
  /**
   * El control que se está reprogramando, para que no se cuente a sí mismo
   * como ocupado: sin esto, el día donde el control ya está desaparece de la
   * lista. Es el id del turno de la CONSULTA (el que ocupa el casillero).
   */
  excludeAppointmentId?: number;
}

export const useIntegralAvailableDays = ({
  enabled = true,
  excludeAppointmentId,
}: UseIntegralAvailableDaysOptions = {}) => {
  const query = useQuery<IntegralCheckupSlot[]>({
    queryKey: ["integralAvailableDays", excludeAppointmentId ?? null],
    queryFn: () => getIntegralAvailableDays({ excludeAppointmentId }),
    enabled,
    staleTime: 60 * 1000,
  });

  return {
    days: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    // Para que un listado que falla no deje la pantalla muerta: se puede
    // volver a pedir sin recargar.
    refetch: query.refetch,
  };
};

/**
 * Los días del control que ve el PERSONAL. Clave de caché propia: la respuesta
 * no es la misma que la de la paciente (trae el nombre real de la eco), así
 * que compartir la clave le filtraría el subtipo al portal.
 */
export const useStaffIntegralAvailableDays = ({
  enabled = true,
  excludeAppointmentId,
}: UseIntegralAvailableDaysOptions = {}) => {
  const query = useQuery<IntegralCheckupSlot[]>({
    queryKey: ["staffIntegralAvailableDays", excludeAppointmentId ?? null],
    queryFn: () => getStaffIntegralAvailableDays({ excludeAppointmentId }),
    enabled,
    staleTime: 60 * 1000,
  });

  return {
    days: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    // Para que un listado que falla no deje la pantalla muerta: se puede
    // volver a pedir sin recargar.
    refetch: query.refetch,
  };
};

/**
 * Quiénes ofrecen el control, según el backend.
 *
 * 🔴 Con esto la pantalla de turnos decide si mostrarle a la secretaria la
 * modalidad del control después de elegir el médico. **El id no se cablea**:
 * quién es la ginecóloga es config de instancia y la respuesta puede cambiar
 * sin tocar el front.
 *
 * Es config, no disponibilidad: no cambia entre pantallas ni entre días, así
 * que se cachea largo y no se invalida al reservar.
 */
export const useIntegralCheckupConfig = ({
  enabled = true,
}: UseIntegralAvailableDaysOptions = {}) => {
  const query = useQuery<IntegralCheckupConfig>({
    queryKey: ["integralCheckupConfig"],
    queryFn: () => getIntegralCheckupConfig(),
    enabled,
    staleTime: 60 * 60 * 1000,
  });

  return {
    config: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

/**
 * La secretaría da el control: elige paciente y día, nada más.
 *
 * El aviso al usuario lo da quien la llama (el diálogo del turnero usa el
 * mismo toast que el alta común), así el mensaje es el de esa pantalla.
 */
export const useCreateStaffIntegralAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: { patientId: number; date: string }) =>
      createStaffIntegralAppointment(dto),
    onSuccess: () => {
      /**
       * 🔴 El control **es** un alta de turnos: ocupa dos casilleros reales de
       * dos agendas. Refresca todo lo que refresca el alta común
       * (`useAppointmentMutations`) —si no, un control dado para HOY dejaba la
       * cola del día y los listados de la paciente mostrando lo de antes— más
       * lo suyo: los días del control, que acaban de perder un lugar.
       */
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      queryClient.invalidateQueries({ queryKey: ["waitingList"] });
      queryClient.invalidateQueries({ queryKey: ["doctorTodayAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["patientAppointments"] });
      queryClient.invalidateQueries({
        queryKey: ["patientAppointmentsByUserId"],
      });
      queryClient.invalidateQueries({ queryKey: ["doctorDashboard"] });
      queryClient.invalidateQueries({
        queryKey: ["staffIntegralAvailableDays"],
      });
      queryClient.invalidateQueries({ queryKey: ["integralAvailableDays"] });
    },
  });
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
