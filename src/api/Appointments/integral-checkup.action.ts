import { apiTurnos } from "@/services/axiosConfig";
import type {
  AppointmentResponseDto,
  IntegralCheckupBooking,
  IntegralCheckupSlot,
} from "@/types/Appointment/Appointment";

/**
 * Días con control ginecológico integral disponible. Los horarios los define
 * el backend (configuración de instancia): el front no los calcula.
 */
export const getIntegralAvailableDays = async (params?: {
  from?: string;
  to?: string;
}): Promise<IntegralCheckupSlot[]> => {
  const { data } = await apiTurnos.get<IntegralCheckupSlot[]>(
    "appointments/patient/integral/available-days",
    { params },
  );
  return data;
};

/**
 * Reserva el control completo. El backend crea el turno de consulta y el
 * sobreturno de ecografía en una sola transacción.
 */
export const requestIntegralAppointment = async (dto: {
  date: string;
}): Promise<IntegralCheckupBooking> => {
  const { data } = await apiTurnos.post<IntegralCheckupBooking>(
    "appointments/patient/integral",
    dto,
  );
  return data;
};

export type { AppointmentResponseDto };

/**
 * La ginecóloga indica, en su consulta, qué ecografía se le hace a la
 * paciente. El tipo viaja a la pata de la eco y de ahí a la worklist, así el
 * ecógrafo ya sabe qué estudio hacer cuando la paciente entra.
 *
 * `consultationId` es el turno de la CONSULTA (la pata que la médica tiene
 * delante), no el de la ecografía: el backend resuelve la otra pata por el
 * vínculo.
 */
export const setIntegralUltrasoundTypes = async (
  consultationId: number,
  consultationTypeIds: number[],
): Promise<AppointmentResponseDto> => {
  const { data } = await apiTurnos.patch<AppointmentResponseDto>(
    `appointments/${consultationId}/integral/ultrasound-types`,
    { consultationTypeIds },
  );
  return data;
};
