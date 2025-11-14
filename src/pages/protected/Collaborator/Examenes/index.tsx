import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { parseSlug } from "@/common/helpers/helpers";
import { useCollaborator } from "@/hooks/Collaborator/useCollaborator";
import LoadingAnimation from "@/components/Loading/loading";
import { PageHeader } from "@/components/PageHeader";
import { FileText } from "lucide-react";
import { useCollaboratorMedicalEvaluation } from "@/hooks/Collaborator-Medical-Evaluation/useCollaboratorMedicalEvaluation";
import { useEvaluationType } from "@/hooks/Evaluation-Type/useEvaluationTypes";
import { ListPreoccupationalExamsTable } from "@/components/Pre-Occupational/List/Table/table";

const CollaboratorExamenesPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const { id, formattedName } = parseSlug(slug);
  const { collaborator, isLoading } = useCollaborator({
    auth: true,
    id,
  });

  const { data, isFetching } = useCollaboratorMedicalEvaluation({
    id: id || 0,
    auth: true,
    enabled: !!id,
  });

  const {
    evaluationTypes: allEvaluationTypes,
    isLoading: isLoadingEvaluationTypes,
  } = useEvaluationType({ auth: true });

  const allowedEvaluationTypes = [
    "Preocupacional",
    "Periódico",
    "Salida (Retiro)",
    "Cambio de Puesto",
    "Libreta Sanitaria",
    "Otro",
  ];

  const evaluationTypes = allEvaluationTypes.filter((type) =>
    allowedEvaluationTypes.includes(type.name)
  );

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Incor Laboral", href: "/incor-laboral" },
    { label: "Colaboradores", href: "/incor-laboral/colaboradores" },
    {
      label: collaborator
        ? `${collaborator.firstName.charAt(0).toUpperCase() + collaborator.firstName.slice(1).toLowerCase()} ${collaborator.lastName.charAt(0).toUpperCase() + collaborator.lastName.slice(1).toLowerCase()}`
        : formattedName,
      href: `/incor-laboral/colaboradores/${slug}`,
    },
    { label: "Exámenes Médicos" },
  ];

  if (isLoading || isLoadingEvaluationTypes) {
    return <LoadingAnimation />;
  }

  return (
    <>
      <Helmet>
        <title>Exámenes - {formattedName}</title>
      </Helmet>
      <div className="space-y-6 p-6">
        <PageHeader
          breadcrumbItems={breadcrumbItems}
          title="Exámenes Médicos"
          description={`Registro de exámenes preocupacionales, periódicos y especiales de ${formattedName}`}
          icon={<FileText className="h-6 w-6" />}
        />

        {collaborator && (
          <ListPreoccupationalExamsTable
            data={data || []}
            isFetching={isFetching}
            evaluationTypes={evaluationTypes}
            slug={slug}
            collaborator={collaborator}
          />
        )}
      </div>
    </>
  );
};

export default CollaboratorExamenesPage;
