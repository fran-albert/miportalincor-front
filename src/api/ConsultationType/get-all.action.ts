import { apiTurnos } from "@/services/axiosConfig";
import { ConsultationTypeResponseDto } from "@/types/ConsultationType/ConsultationType";

export const getAllConsultationTypes = async (): Promise<ConsultationTypeResponseDto[]> => {
  const { data } = await apiTurnos.get<ConsultationTypeResponseDto[]>("consultation-types");
  return data;
};
