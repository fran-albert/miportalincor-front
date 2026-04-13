import { apiTurnos } from "@/services/axiosConfig";
import {
  OverturnResponseDto,
  UpdateOverturnStatusDto,
} from "@/types/Overturn/Overturn";

export const changeOverturnStatus = async (
  id: number,
  dto: UpdateOverturnStatusDto
): Promise<OverturnResponseDto> => {
  const { data } = await apiTurnos.patch<OverturnResponseDto>(
    `overturns/${id}/status`,
    dto
  );
  return data;
};
