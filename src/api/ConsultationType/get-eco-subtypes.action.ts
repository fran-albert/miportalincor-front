import { apiTurnos } from "@/services/axiosConfig";
import { ConsultationTypeResponseDto } from "@/types/ConsultationType/ConsultationType";

/**
 * Subtipos de ecografía del catálogo (ECOGRAFIA ABDOMEN, GINECOLOGICA,
 * MAMARIA, doppler, DVC, etc.): lo que la secretaria elige cuando un turno
 * de eco no tiene el tipo definido. La lista la resuelve el backend
 * (ECO_SUBTYPE_IDS), única fuente de verdad.
 */
export const getEcoSubtypes = async (): Promise<ConsultationTypeResponseDto[]> => {
  const { data } = await apiTurnos.get<ConsultationTypeResponseDto[]>('consultation-types/eco-subtypes');
  return data;
};
