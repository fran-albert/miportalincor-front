import LoadingAnimation from "@/components/Loading/loading";
import PreOccupationalPreviewComponent from "@/components/Pre-Occupational/Preview";
import { useCollaborator } from "@/hooks/Collaborator/useCollaborator";
import { useDataValuesByMedicalEvaluationId } from "@/hooks/Data-Values/useDataValues";
import { useMedicalEvaluation } from "@/hooks/Medical-Evaluation/useMedicalEvaluation";
import { useGetAllStudiesImagesUrlsByCollaboratorAndMedicalEvaluation } from "@/hooks/Study/useGetAllStudiesImagesUrlsByCollaboratorAndMedicalEvaluation";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

export default function PreOccupationalPreviewPage() {
  const { slug, medicalEvaluationId } = useParams();
  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const id = parseInt(slugParts[slugParts.length - 1], 10);

  const { isLoading: collaboratorLoading, collaborator, error: collaboratorError } = useCollaborator({
    auth: true,
    id,
  });

  const { data, isLoading: medicalEvaluationLoading, error: medicalEvaluationError } = useMedicalEvaluation({
    auth: true,
    id: Number(medicalEvaluationId),
  });

  const { data: urls, isLoading: urlsLoading, error: urlsError } =
    useGetAllStudiesImagesUrlsByCollaboratorAndMedicalEvaluation({
      auth: true,
      collaboratorId: id,
      medicalEvaluationId: Number(medicalEvaluationId),
    });

  // Filtrar estudios de tipo "Preocupacional" para evitar duplicación de PDFs previos
  const filteredUrls = urls?.filter(study => study.dataTypeName !== "Preocupacional");

  const { data: dataValues, isLoading: dataValuesLoading, error: dataValuesError } = useDataValuesByMedicalEvaluationId({
    id: Number(medicalEvaluationId),
    auth: true,
  });

  const isLoading = collaboratorLoading || medicalEvaluationLoading || urlsLoading || dataValuesLoading;
  const error = collaboratorError || medicalEvaluationError || urlsError || dataValuesError;

  return (
    <>
      <Helmet>
        <title>
          {isLoading
            ? "Colaboradores"
            : `${collaborator?.firstName} ${collaborator?.lastName}`}
        </title>
        <meta
          name="description"
          content={`Información detallada sobre el colaborador ${collaborator?.firstName}.`}
        />
        <meta
          name="keywords"
          content={`Collaborator, ${collaborator?.firstName}, perfil`}
        />
      </Helmet>
      {error && <div>Hubo un error al cargar los datos.</div>}
      {isLoading ? (
        <LoadingAnimation />
      ) : collaborator && data ? (
        <PreOccupationalPreviewComponent
          collaborator={collaborator}
          medicalEvaluation={data}
          urls={filteredUrls}
          dataValues={dataValues}
        />
      ) : (
        <div>No hay datos disponibles.</div>
      )}
    </>
  );
}
