import { ConsultationType } from '@/types/ConsultationType/ConsultationType';

export interface DoctorConsultationTypeSettingResponseDto {
  id: number;
  doctorId: number;
  consultationTypeId: number;
  durationMinutes: number;
  consultationType: ConsultationType;
}

export interface UpsertDoctorConsultationTypeSettingsDto {
  settings: UpsertSettingItem[];
}

export interface UpsertSettingItem {
  consultationTypeId: number;
  durationMinutes: number;
}
