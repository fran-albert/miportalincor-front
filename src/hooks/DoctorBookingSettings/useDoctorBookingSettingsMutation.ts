import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDoctorBookingSettings } from "@/api/DoctorBookingSettings";
import { UpdateDoctorBookingSettingsDto } from "@/types/DoctorBookingSettings";

export const useDoctorBookingSettingsMutation = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ doctorId, dto }: { doctorId: number; dto: UpdateDoctorBookingSettingsDto }) =>
      updateDoctorBookingSettings(doctorId, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['doctorBookingSettings', variables.doctorId]
      });
    },
  });

  return {
    updateSettings: updateMutation,
    isUpdating: updateMutation.isPending,
  };
};
