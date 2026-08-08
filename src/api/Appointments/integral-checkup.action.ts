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
