import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProgramPricing,
  updateProgramPricing,
} from "@/api/Program/program-pricing.actions";
import { UpdateProgramPricingDto } from "@/types/Program/Program";

export const programPricingQueryKey = (programId: string) => [
  "program-pricing",
  programId,
];

export const useProgramPricing = (programId: string) =>
  useQuery({
    queryKey: programPricingQueryKey(programId),
    queryFn: () => getProgramPricing(programId),
    enabled: Boolean(programId),
    staleTime: 60_000,
  });

export const useProgramPricingMutation = (programId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateProgramPricingDto) =>
      updateProgramPricing(programId, dto),
    onSuccess: (pricing) => {
      queryClient.setQueryData(programPricingQueryKey(programId), pricing);
      queryClient.invalidateQueries({ queryKey: ["program", programId] });
    },
  });
};
