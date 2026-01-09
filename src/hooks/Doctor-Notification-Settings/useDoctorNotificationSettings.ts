import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDoctorNotificationSettingsByDoctorId } from "@/api/Doctor-Notification-Settings/get-by-doctor-id.action";
import { createDoctorNotificationSettings } from "@/api/Doctor-Notification-Settings/create.action";
import { updateDoctorNotificationSettings } from "@/api/Doctor-Notification-Settings/update.action";
import {
  DoctorNotificationSettings,
  CreateDoctorNotificationSettingsDto,
  UpdateDoctorNotificationSettingsDto,
} from "@/types/Doctor-Notification-Settings/DoctorNotificationSettings";

// Query Keys
export const doctorNotificationSettingsKeys = {
  all: ["doctorNotificationSettings"] as const,
  byDoctor: (doctorId: number) =>
    [...doctorNotificationSettingsKeys.all, "doctor", doctorId] as const,
};

// Get Doctor Notification Settings by Doctor ID
export const useDoctorNotificationSettings = (
  doctorId: number,
  enabled: boolean = true
) => {
  return useQuery<DoctorNotificationSettings | null>({
    queryKey: doctorNotificationSettingsKeys.byDoctor(doctorId),
    queryFn: () => getDoctorNotificationSettingsByDoctorId(doctorId),
    enabled: enabled && doctorId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Create Doctor Notification Settings
export const useCreateDoctorNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation<
    DoctorNotificationSettings,
    Error,
    CreateDoctorNotificationSettingsDto
  >({
    mutationFn: createDoctorNotificationSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(
        doctorNotificationSettingsKeys.byDoctor(data.doctorId),
        data
      );
    },
    onError: (error) => {
      console.error("Error creating doctor notification settings:", error);
    },
  });
};

// Update Doctor Notification Settings
export const useUpdateDoctorNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation<
    DoctorNotificationSettings,
    Error,
    { id: number; dto: UpdateDoctorNotificationSettingsDto }
  >({
    mutationFn: ({ id, dto }) => updateDoctorNotificationSettings(id, dto),
    onSuccess: (data) => {
      queryClient.setQueryData(
        doctorNotificationSettingsKeys.byDoctor(data.doctorId),
        data
      );
    },
    onError: (error) => {
      console.error("Error updating doctor notification settings:", error);
    },
  });
};
