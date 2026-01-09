import { apiTurnos } from "@/services/axiosConfig";
import { OverturnResponseDto, CreateOverturnDto } from "@/types/Overturn/Overturn";

export const createOverturn = async (
  dto: CreateOverturnDto
): Promise<OverturnResponseDto> => {
  const { data } = await apiTurnos.post<OverturnResponseDto>('overturns', dto);
  return data;
};
