import { apiTurnos } from "@/services/axiosConfig";
import { ConsultationTypeResponseDto } from "@/types/ConsultationType/ConsultationType";

export const deactivateConsultationType = async (
  id: number
): Promise<ConsultationTypeResponseDto> => {
  const { data } = await apiTurnos.patch<ConsultationTypeResponseDto>(
    `consultation-types/${id}/deactivate`
  );
  return data;
};
