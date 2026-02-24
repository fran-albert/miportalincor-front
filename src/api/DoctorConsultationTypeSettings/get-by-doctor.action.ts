import { apiTurnos } from '@/services/axiosConfig';
import { DoctorConsultationTypeSettingResponseDto } from '@/types/DoctorConsultationTypeSettings';

export const getDoctorConsultationTypeSettings = async (
  doctorId: number,
): Promise<DoctorConsultationTypeSettingResponseDto[]> => {
  const { data } = await apiTurnos.get<DoctorConsultationTypeSettingResponseDto[]>(
    `doctor-consultation-type-settings/doctor/${doctorId}`,
  );
  return data;
};
