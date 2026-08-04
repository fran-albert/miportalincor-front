import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteProgramActivityCoverage,
  getProgramActivityCoverages,
  upsertProgramActivityCoverage,
} from "@/api/Program/program-activity-coverages.actions";
import { UpsertProgramActivityCoverageDto } from "@/types/Program/ProgramActivityCoverage";

export const programActivityCoveragesQueryKey = (programId: string) => [
  "program-activity-coverages",
  programId,
];

export const useProgramActivityCoverages = (programId: string) =>
  useQuery({
    queryKey: programActivityCoveragesQueryKey(programId),
    queryFn: () => getProgramActivityCoverages(programId),
    enabled: Boolean(programId),
    staleTime: 60_000,
  });

export const useProgramActivityCoverageMutations = (programId: string) => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: programActivityCoveragesQueryKey(programId),
    });

  const upsertMutation = useMutation({
    mutationFn: ({
      activityId,
      healthInsuranceId,
      dto,
    }: {
      activityId: string;
      healthInsuranceId: number;
      dto: UpsertProgramActivityCoverageDto;
    }) =>
      upsertProgramActivityCoverage(
        programId,
        activityId,
        healthInsuranceId,
        dto
      ),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: ({
      activityId,
      healthInsuranceId,
    }: {
      activityId: string;
      healthInsuranceId: number;
    }) =>
      deleteProgramActivityCoverage(programId, activityId, healthInsuranceId),
    onSuccess: invalidate,
  });

  return { upsertMutation, deleteMutation };
};
