import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPrescriptionCenters,
  getPrescriptionCenterOperators,
  addPrescriptionCenterOperator,
  removePrescriptionCenterOperator,
} from "@/api/Prescription-Center";

const keys = {
  centers: ["prescription-centers"] as const,
  operators: (centerId: string) =>
    ["prescription-centers", centerId, "operators"] as const,
};

export const usePrescriptionCenters = () => {
  return useQuery({
    queryKey: keys.centers,
    queryFn: getPrescriptionCenters,
  });
};

export const usePrescriptionCenterOperators = (centerId: string) => {
  return useQuery({
    queryKey: keys.operators(centerId),
    queryFn: () => getPrescriptionCenterOperators(centerId),
    enabled: !!centerId,
  });
};

export const useAddOperator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      centerId,
      userId,
    }: {
      centerId: string;
      userId: string;
    }) => addPrescriptionCenterOperator(centerId, userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: keys.operators(variables.centerId),
      });
    },
  });
};

export const useRemoveOperator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      centerId,
      userId,
    }: {
      centerId: string;
      userId: string;
    }) => removePrescriptionCenterOperator(centerId, userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: keys.operators(variables.centerId),
      });
    },
  });
};
