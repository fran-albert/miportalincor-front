import { Helmet } from "react-helmet-async";
import { ListPreoccupationalExamsTable } from "../Table/table";
import { useCollaboratorMedicalEvaluation } from "@/hooks/Collaborator-Medical-Evaluation/useCollaboratorMedicalEvaluation";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { useParams } from "react-router-dom";
import { parseSlug } from "@/common/helpers/helpers";
import { useCollaborator } from "@/hooks/Collaborator/useCollaborator";

const ListPreoccupationalExams = () => {
  const params = useParams();
  const slug = params.slug as string;

  const { id, formattedName } = parseSlug(slug);

  const { collaborator } = useCollaborator({
    auth: true,
    id,
  });

  const { data, isFetching } = id
    ? useCollaboratorMedicalEvaluation({ id, auth: true })
    : { data: undefined, isFetching: false };
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Incor Laboral", href: "/incor-laboral" },
    { label: "Colaboradores", href: `/incor-laboral/colaboradores` },
    { label: formattedName, href: `/incor-laboral/colaboradores/${slug}` },
  ];

  return (
    <>
      <Helmet>
        <title>Incor Laboral</title>
      </Helmet>
      <div className="space-y-2 mt-2">
        <BreadcrumbComponent items={breadcrumbItems} />
        <div className="overflow-hidden sm:rounded-lg">
          {id && collaborator && data ? (
            <>
              <ListPreoccupationalExamsTable
                data={data || []}
                isFetching={isFetching}
                slug={slug}
                collaborator={collaborator}
              />
            </>
          ) : (
            <p className="text-gray-500">
              No se encontraron exámenes o el ID no es válido.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ListPreoccupationalExams;
