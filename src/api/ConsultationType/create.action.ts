import { apiTurnos } from "@/services/axiosConfig";
import {
  ConsultationTypeResponseDto,
  CreateConsultationTypeDto,
} from "@/types/ConsultationType/ConsultationType";

export const createConsultationType = async (
  dto: CreateConsultationTypeDto
): Promise<ConsultationTypeResponseDto> => {
  const { data } = await apiTurnos.post<ConsultationTypeResponseDto>("consultation-types", dto);
  return data;
};
