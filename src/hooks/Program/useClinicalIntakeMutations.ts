import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMeasurement,
  createMedicalEvaluation,
  updateMedicalEvaluation,
} from "@/api/Program/clinical-intake.actions";
import {
  CreateMeasurementDto,
  UpsertMedicalEvaluationDto,
} from "@/types/Program/ProgramClinicalIntake";

export const useClinicalIntakeMutations = (enrollmentId: string) => {
  const queryClient = useQueryClient();

  // La ficha crea/corrige la medición inicial y puede crear una versión del
  // plan: se invalida todo lo que depende de eso, no sólo la ficha.
  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: ["medical-evaluation", enrollmentId],
    });
    queryClient.invalidateQueries({
      queryKey: ["program-measurements", enrollmentId],
    });
    queryClient.invalidateQueries({ queryKey: ["current-plan", enrollmentId] });
    queryClient.invalidateQueries({ queryKey: ["plan-versions", enrollmentId] });
  };

  const createEvaluationMutation = useMutation({
    mutationFn: (dto: UpsertMedicalEvaluationDto) =>
      createMedicalEvaluation(enrollmentId, dto),
    onSuccess: invalidateAll,
  });

  const updateEvaluationMutation = useMutation({
    mutationFn: (dto: UpsertMedicalEvaluationDto) =>
      updateMedicalEvaluation(enrollmentId, dto),
    onSuccess: invalidateAll,
  });

  const createMeasurementMutation = useMutation({
    mutationFn: (dto: CreateMeasurementDto) =>
      createMeasurement(enrollmentId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["program-measurements", enrollmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["medical-evaluation", enrollmentId],
      });
    },
  });

  return {
    createEvaluationMutation,
    updateEvaluationMutation,
    createMeasurementMutation,
  };
};
