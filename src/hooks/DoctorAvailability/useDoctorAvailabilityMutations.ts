import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDoctorAvailability,
  updateDoctorAvailability,
  deleteDoctorAvailability
} from "@/api/DoctorAvailability";
import {
  CreateDoctorAvailabilityDto,
  UpdateDoctorAvailabilityDto
} from "@/types/DoctorAvailability";

export const useDoctorAvailabilityMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (dto: CreateDoctorAvailabilityDto) => createDoctorAvailability(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['doctorAvailabilities', variables.doctorId]
      });
      queryClient.invalidateQueries({
        queryKey: ['availableSlots']
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateDoctorAvailabilityDto; doctorId: number }) =>
      updateDoctorAvailability(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['doctorAvailabilities', variables.doctorId]
      });
      queryClient.invalidateQueries({
        queryKey: ['availableSlots']
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: number; doctorId: number }) => deleteDoctorAvailability(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['doctorAvailabilities', variables.doctorId]
      });
      queryClient.invalidateQueries({
        queryKey: ['availableSlots']
      });
    },
  });

  return {
    createAvailability: createMutation,
    updateAvailability: updateMutation,
    deleteAvailability: deleteMutation,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
