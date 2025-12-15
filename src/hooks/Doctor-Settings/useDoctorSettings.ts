import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyDoctorSettings,
  updateMyDoctorSettings,
  getAvailableDoctorsForPrescriptions,
  AvailableDoctor,
} from "@/api/Doctor-Settings";
import { DoctorSettings, UpdateDoctorSettingsDto } from "@/types/Doctor-Settings/Doctor-Settings";

// Query Keys
export const doctorSettingsKeys = {
  all: ["doctorSettings"] as const,
  mySettings: () => [...doctorSettingsKeys.all, "my-settings"] as const,
  availableDoctors: () => [...doctorSettingsKeys.all, "available-doctors"] as const,
};

// Get My Doctor Settings
export const useMyDoctorSettings = (enabled: boolean = true) => {
  return useQuery<DoctorSettings>({
    queryKey: doctorSettingsKeys.mySettings(),
    queryFn: getMyDoctorSettings,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Update My Doctor Settings
export const useUpdateMyDoctorSettings = () => {
  const queryClient = useQueryClient();

  return useMutation<DoctorSettings, Error, UpdateDoctorSettingsDto>({
    mutationFn: updateMyDoctorSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(doctorSettingsKeys.mySettings(), data);
    },
    onError: (error) => {
      console.error("Error updating doctor settings:", error);
    },
  });
};

// Get Available Doctors for Prescriptions (for patients)
export const useAvailableDoctorsForPrescriptions = (enabled: boolean = true) => {
  return useQuery<AvailableDoctor[]>({
    queryKey: doctorSettingsKeys.availableDoctors(),
    queryFn: getAvailableDoctorsForPrescriptions,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Re-export type for convenience
export type { AvailableDoctor };
