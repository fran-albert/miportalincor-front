import { apiTurnos } from "@/services/axiosConfig";
import { OverturnDetailedDto } from "@/types/Overturn/Overturn";

export const getTodayOverturnsByDoctor = async (
  doctorId: number
): Promise<OverturnDetailedDto[]> => {
  const { data } = await apiTurnos.get<OverturnDetailedDto[]>(
    `overturns/doctor/${doctorId}/today`
  );
  return data;
};
