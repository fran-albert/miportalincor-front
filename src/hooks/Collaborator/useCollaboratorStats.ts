import { useCollaboratorMedicalEvaluation } from "@/hooks/Collaborator-Medical-Evaluation/useCollaboratorMedicalEvaluation";
import { useEvolutions } from "@/hooks/Evolutions/useEvolutions";

interface UseCollaboratorStatsProps {
  collaboratorId: number;
  isAuthenticated: boolean;
}

export const useCollaboratorStats = ({
  collaboratorId,
  isAuthenticated,
}: UseCollaboratorStatsProps) => {
  // Total de evaluaciones médicas (exámenes)
  const { data: evaluations = [], isFetching: isFetchingEvaluations } =
    useCollaboratorMedicalEvaluation({
      id: collaboratorId || 0,
      auth: isAuthenticated,
      enabled: isAuthenticated && collaboratorId > 0,
    });

  // Total de evoluciones
  const { evolutions = [], isFetching: isFetchingEvolutions } = useEvolutions({
    collaboratorId,
    enabled: isAuthenticated && collaboratorId > 0,
  });

  const totalExamenes = evaluations.length;
  const totalEvoluciones = evolutions.length;

  // Obtener último examen
  const lastExam = evaluations && evaluations.length > 0 ? evaluations[0] : null;
  const lastExamDate = lastExam
    ? new Date(lastExam.createdAt).toLocaleDateString("es-AR")
    : "Sin exámenes";
  const lastExamType = lastExam?.evaluationType?.name || "N/A";

  const isLoading = isFetchingEvaluations || isFetchingEvolutions;

  return {
    stats: {
      totalExamenes,
      totalEvoluciones,
      lastExam,
      lastExamDate,
      lastExamType,
    },
    isLoading,
  };
};
