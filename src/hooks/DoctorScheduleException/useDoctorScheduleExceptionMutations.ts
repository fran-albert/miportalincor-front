import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDoctorScheduleException,
  deleteDoctorScheduleException,
  updateDoctorScheduleException,
} from "@/api/DoctorScheduleException";
import {
  CreateDoctorScheduleExceptionDto,
  UpdateDoctorScheduleExceptionDto,
} from "@/types/DoctorScheduleException";

export const useDoctorScheduleExceptionMutations = () => {
  const queryClient = useQueryClient();

  const invalidateDoctorScheduleQueries = (doctorId: number) => {
    queryClient.invalidateQueries({
      queryKey: ["doctorScheduleExceptions", doctorId],
    });
    queryClient.invalidateQueries({
      queryKey: ["availableSlots"],
    });
    queryClient.invalidateQueries({
      queryKey: ["availableSlotsRange"],
    });
    queryClient.invalidateQueries({
      queryKey: ["doctorDashboard"],
    });
    queryClient.invalidateQueries({
      queryKey: ["firstAvailableDate"],
    });
  };

  const createMutation = useMutation({
    mutationFn: (dto: CreateDoctorScheduleExceptionDto) =>
      createDoctorScheduleException(dto),
    onSuccess: (_, variables) => {
      invalidateDoctorScheduleQueries(variables.doctorId);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: number;
      dto: UpdateDoctorScheduleExceptionDto;
      doctorId: number;
    }) => updateDoctorScheduleException(id, dto),
    onSuccess: (_, variables) => {
      invalidateDoctorScheduleQueries(variables.doctorId);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({
      id,
    }: {
      id: number;
      doctorId: number;
    }) => deleteDoctorScheduleException(id),
    onSuccess: (_, variables) => {
      invalidateDoctorScheduleQueries(variables.doctorId);
    },
  });

  return {
    createException: createMutation,
    updateException: updateMutation,
    deleteException: deleteMutation,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
