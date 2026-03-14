import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createConsultationType,
  deactivateConsultationType,
  updateConsultationType,
} from "@/api/ConsultationType";
import {
  CreateConsultationTypeDto,
  UpdateConsultationTypeDto,
} from "@/types/ConsultationType/ConsultationType";
import { consultationTypeKeys } from "./useConsultationTypes";

const invalidateConsultationTypeQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: consultationTypeKeys.all });
};

export const useCreateConsultationType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateConsultationTypeDto) => createConsultationType(dto),
    onSuccess: () => {
      invalidateConsultationTypeQueries(queryClient);
    },
  });
};

export const useUpdateConsultationType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateConsultationTypeDto }) =>
      updateConsultationType(id, dto),
    onSuccess: () => {
      invalidateConsultationTypeQueries(queryClient);
    },
  });
};

export const useDeactivateConsultationType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deactivateConsultationType(id),
    onSuccess: () => {
      invalidateConsultationTypeQueries(queryClient);
    },
  });
};
