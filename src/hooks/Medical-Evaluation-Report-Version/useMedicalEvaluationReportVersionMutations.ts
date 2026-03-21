import { markMedicalEvaluationReportVersionAsFinal } from "@/api/Medical-Evaluation-Report-Version/mark-final.action";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useMedicalEvaluationReportVersionMutations = (
  medicalEvaluationId: number
) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToastContext();

  const markAsFinalMutation = useMutation({
    mutationFn: (reportVersionId: number) =>
      markMedicalEvaluationReportVersionAsFinal(reportVersionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["medical-evaluation-report-versions", medicalEvaluationId],
      });
      showSuccess(
        "Versión final actualizada",
        "La versión seleccionada quedó marcada como final entregada."
      );
    },
    onError: () => {
      showError(
        "No se pudo marcar como final",
        "Intentá nuevamente en unos segundos."
      );
    },
  });

  return {
    markAsFinalMutation,
  };
};
