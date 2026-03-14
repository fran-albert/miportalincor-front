import { apiTurnos } from "@/services/axiosConfig";
import {
  ConsultationTypeResponseDto,
  UpdateConsultationTypeDto,
} from "@/types/ConsultationType/ConsultationType";

export const updateConsultationType = async (
  id: number,
  dto: UpdateConsultationTypeDto
): Promise<ConsultationTypeResponseDto> => {
  const { data } = await apiTurnos.put<ConsultationTypeResponseDto>(`consultation-types/${id}`, dto);
  return data;
};
