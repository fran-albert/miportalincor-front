import { apiTurnos } from '@/services/axiosConfig';
import {
  DoctorConsultationTypeSettingResponseDto,
  UpsertDoctorConsultationTypeSettingsDto,
} from '@/types/DoctorConsultationTypeSettings';

export const upsertDoctorConsultationTypeSettings = async (
  doctorId: number,
  dto: UpsertDoctorConsultationTypeSettingsDto,
): Promise<DoctorConsultationTypeSettingResponseDto[]> => {
  const { data } = await apiTurnos.put<DoctorConsultationTypeSettingResponseDto[]>(
    `doctor-consultation-type-settings/doctor/${doctorId}`,
    dto,
  );
  return data;
};
