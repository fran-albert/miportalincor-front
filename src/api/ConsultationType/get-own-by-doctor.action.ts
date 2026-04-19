import { apiTurnos } from "@/services/axiosConfig";
import { ConsultationTypeResponseDto } from "@/types/ConsultationType/ConsultationType";

export const getOwnConsultationTypesByDoctor = async (
  doctorId: number,
): Promise<ConsultationTypeResponseDto[]> => {
  const { data } = await apiTurnos.get<ConsultationTypeResponseDto[]>(
    `consultation-types/own/${doctorId}`,
  );

  return data;
};
