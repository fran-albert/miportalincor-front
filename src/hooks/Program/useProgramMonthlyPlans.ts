import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProgramMonthlyPlan,
  getProgramMonthlyPlans,
  retryProgramMonthlyPlanWhatsapp,
  upsertProgramMonthlyPlan,
} from "@/api/Program/program-monthly-plans.actions";
import { UpsertProgramMonthlyPlanDto } from "@/types/Program/ProgramMonthlyPlan";

export const programMonthlyPlanQueryKey = (
  enrollmentId: string,
  year: number,
  month: number
) => ["program-monthly-plan", enrollmentId, year, month];

export const programMonthlyPlansQueryKey = (enrollmentId: string) => [
  "program-monthly-plans",
  enrollmentId,
];

export const useProgramMonthlyPlan = (
  enrollmentId: string,
  year: number,
  month: number
) =>
  useQuery({
    queryKey: programMonthlyPlanQueryKey(enrollmentId, year, month),
    queryFn: () => getProgramMonthlyPlan(enrollmentId, year, month),
    enabled: Boolean(enrollmentId && year && month),
    staleTime: 30_000,
  });

export const useProgramMonthlyPlans = (enrollmentId: string) =>
  useQuery({
    queryKey: programMonthlyPlansQueryKey(enrollmentId),
    queryFn: () => getProgramMonthlyPlans(enrollmentId),
    enabled: Boolean(enrollmentId),
    staleTime: 30_000,
  });

export const useProgramMonthlyPlanMutations = (enrollmentId: string) => {
  const queryClient = useQueryClient();

  const syncResponse = (
    year: number,
    month: number,
    response: Awaited<ReturnType<typeof upsertProgramMonthlyPlan>>
  ) => {
    queryClient.setQueryData(
      programMonthlyPlanQueryKey(enrollmentId, year, month),
      response
    );
    queryClient.invalidateQueries({
      queryKey: programMonthlyPlansQueryKey(enrollmentId),
    });
  };

  const saveMutation = useMutation({
    mutationFn: ({
      year,
      month,
      dto,
    }: {
      year: number;
      month: number;
      dto: UpsertProgramMonthlyPlanDto;
    }) => upsertProgramMonthlyPlan(enrollmentId, year, month, dto),
    onSuccess: (response) => {
      syncResponse(response.periodYear, response.periodMonth, response);
    },
  });

  const retryWhatsappMutation = useMutation({
    mutationFn: ({ year, month }: { year: number; month: number }) =>
      retryProgramMonthlyPlanWhatsapp(enrollmentId, year, month),
    onSuccess: (response) => {
      syncResponse(response.periodYear, response.periodMonth, response);
    },
  });

  return { saveMutation, retryWhatsappMutation };
};
