import { apiTurnos } from "@/services/axiosConfig";
import { ConsultationTypeResponseDto } from "@/types/ConsultationType/ConsultationType";

/**
 * Obtiene los tipos de consulta activos desde la API de turnos
 */
export const getActiveConsultationTypes = async (): Promise<ConsultationTypeResponseDto[]> => {
  const { data } = await apiTurnos.get<ConsultationTypeResponseDto[]>('consultation-types/active');
  return data;
};
