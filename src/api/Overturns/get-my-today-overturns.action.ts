import { apiTurnos } from "@/services/axiosConfig";
import { OverturnDetailedDto } from "@/types/Overturn/Overturn";

/**
 * Obtiene los sobreturnos del día del médico logueado.
 */
export const getMyTodayOverturns = async (): Promise<OverturnDetailedDto[]> => {
  const { data } = await apiTurnos.get<OverturnDetailedDto[]>(
    'overturns/doctor/me/today'
  );
  return data;
};
