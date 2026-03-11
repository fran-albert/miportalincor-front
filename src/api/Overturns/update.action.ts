import { apiTurnos } from "@/services/axiosConfig";
import { OverturnResponseDto, UpdateOverturnDto } from "@/types/Overturn/Overturn";

export const updateOverturn = async (
  id: number,
  dto: UpdateOverturnDto
): Promise<OverturnResponseDto> => {
  const { data } = await apiTurnos.put<OverturnResponseDto>(`overturns/${id}`, dto);
  return data;
};
