import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCheckupType, updateCheckupType, deleteCheckupType } from "@/api/Periodic-Checkup";
import { CreateCheckupTypeDto, UpdateCheckupTypeDto } from "@/types/Periodic-Checkup/PeriodicCheckup";

export const useCreateCheckupType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCheckupTypeDto) => createCheckupType(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkup-types'] });
    },
  });
};

export const useUpdateCheckupType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateCheckupTypeDto }) =>
      updateCheckupType(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkup-types'] });
    },
  });
};

export const useDeleteCheckupType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCheckupType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkup-types'] });
    },
  });
};
