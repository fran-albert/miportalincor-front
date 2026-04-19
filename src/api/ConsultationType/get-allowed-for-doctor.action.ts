import { apiTurnos } from "@/services/axiosConfig";
import { ConsultationTypeResponseDto } from "@/types/ConsultationType/ConsultationType";

export const getAllowedConsultationTypesByDoctor = async (
  doctorId: number,
): Promise<ConsultationTypeResponseDto[]> => {
  const { data } = await apiTurnos.get<ConsultationTypeResponseDto[]>(
    `consultation-types/allowed-for-doctor/${doctorId}`,
  );

  return data;
};
