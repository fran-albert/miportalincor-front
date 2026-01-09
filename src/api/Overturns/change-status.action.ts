import { apiTurnos } from "@/services/axiosConfig";
import { OverturnResponseDto, OverturnStatus } from "@/types/Overturn/Overturn";

export const changeOverturnStatus = async (
  id: number,
  status: OverturnStatus
): Promise<OverturnResponseDto> => {
  const { data } = await apiTurnos.patch<OverturnResponseDto>(
    `overturns/${id}/status`,
    { status }
  );
  return data;
};
