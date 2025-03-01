import { useParams } from "react-router-dom";
import LoadingAnimation from "@/components/Loading/loading";
import { Helmet } from "react-helmet-async";
import { NewPreOcuppationalComponent } from "@/components/Pre-Occupational/Component";
import { useCollaborator } from "@/hooks/Collaborator/useCollaborator";
import { useMedicalEvaluation } from "@/hooks/Medical-Evaluation/useMedicalEvaluation";

const CreatePreoccupationalPage = () => {
  const { slug, medicalEvaluationId } = useParams();

  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const collaboratorId = parseInt(slugParts[slugParts.length - 1], 10);

  const { isLoading, collaborator, error } = useCollaborator({
    auth: true,
    id: collaboratorId,
  });

  const { data: medicalEvaluation } = useMedicalEvaluation({
    auth: true,
    id: Number(medicalEvaluationId),
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
      ) : collaborator && medicalEvaluation ? (
        <NewPreOcuppationalComponent
          Collaborator={collaborator}
          medicalEvaluation={medicalEvaluation}
        />
      ) : (
        <div>No hay un colaborador disponible.</div>
      )}
    </>
  );
};

export default CreatePreoccupationalPage;
