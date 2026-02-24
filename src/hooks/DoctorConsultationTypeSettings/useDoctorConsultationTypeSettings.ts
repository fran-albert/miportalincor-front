import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDoctorConsultationTypeSettings,
  upsertDoctorConsultationTypeSettings,
  deleteDoctorConsultationTypeSetting,
} from '@/api/DoctorConsultationTypeSettings';
import { UpsertDoctorConsultationTypeSettingsDto } from '@/types/DoctorConsultationTypeSettings';

export const doctorCtSettingsKeys = {
  all: ['doctorConsultationTypeSettings'] as const,
  byDoctor: (doctorId: number) => [...doctorCtSettingsKeys.all, doctorId] as const,
};

export const useDoctorConsultationTypeSettings = (doctorId: number, enabled = true) => {
  const query = useQuery({
    queryKey: doctorCtSettingsKeys.byDoctor(doctorId),
    queryFn: () => getDoctorConsultationTypeSettings(doctorId),
    staleTime: 5 * 60 * 1000,
    enabled: enabled && doctorId > 0,
  });

  return {
    settings: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useDoctorConsultationTypeSettingsMutations = (doctorId: number) => {
  const queryClient = useQueryClient();

  const upsert = useMutation({
    mutationFn: (dto: UpsertDoctorConsultationTypeSettingsDto) =>
      upsertDoctorConsultationTypeSettings(doctorId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorCtSettingsKeys.byDoctor(doctorId) });
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteDoctorConsultationTypeSetting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorCtSettingsKeys.byDoctor(doctorId) });
    },
  });

  return {
    upsert,
    remove,
    isUpserting: upsert.isPending,
    isRemoving: remove.isPending,
  };
};
