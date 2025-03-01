import LoadingAnimation from "@/components/Loading/loading";
import PreOccupationalPreviewComponent from "@/components/Pre-Occupational/Preview";
import { useCollaborator } from "@/hooks/Collaborator/useCollaborator";
import { useGetAllUrlsByCollaboratorAndMedicalEvaluation } from "@/hooks/Study/useGetAllUrlsByCollaboratorAndMedicalEvaluation";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

export default function PreOccupationalPreviewPage() {
  const { slug, medicalEvaluationId } = useParams();
  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const id = parseInt(slugParts[slugParts.length - 1], 10);

  const { isLoading, collaborator, error } = useCollaborator({
    auth: true,
    id,
  });

  const { data: urls } = useGetAllUrlsByCollaboratorAndMedicalEvaluation({
    auth: true,
    collaboratorId: id,
    medicalEvaluationId: Number(medicalEvaluationId),
  });

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
      {error && <div>Hubo un error al cargar el colaborador.</div>}
      {isLoading ? (
        <LoadingAnimation />
      ) : collaborator ? (
        <PreOccupationalPreviewComponent
          collaborator={collaborator}
          urls={urls}
        />
      ) : (
        <div>No hay un colaborador disponible.</div>
      )}
    </>
  );
}
